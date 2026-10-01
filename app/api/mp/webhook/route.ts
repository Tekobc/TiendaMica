import { NextRequest, NextResponse } from "next/server";
import { getMercadoPagoPayment, refundMercadoPagoPayment } from "@/lib/mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    // Extraer paymentId de body o query params
    const paymentId =
      body?.data?.id ||
      body?.id ||
      url.searchParams.get("data.id") ||
      url.searchParams.get("id");

    const topic = body?.type || body?.topic || url.searchParams.get("topic");

    console.log(`[Webhook MP] Notificación recibida. Topic: ${topic}, PaymentId: ${paymentId}`);

    // Si no es un evento de pago o falta paymentId, respondemos 200 para confirmar recepción
    if (!paymentId || (topic && topic !== "payment" && topic !== "merchant_order")) {
      return NextResponse.json({ ok: true, message: "Ignored non-payment event" }, { status: 200 });
    }

    // 1. RE-CONSULTAR contra la API de Mercado Pago (CONTEXT.md Sección 11: no confiar en payload del webhook)
    const payment = await getMercadoPagoPayment(paymentId);
    if (!payment || !payment.id) {
      console.error(`[Webhook MP] No se pudo obtener el pago ${paymentId} desde la API de MP.`);
      return NextResponse.json({ ok: true, message: "Payment not found in MP API" }, { status: 200 });
    }

    const compraId = (payment as any).external_reference;
    const paymentStatus = payment.status;
    const transactionAmount = Number(payment.transaction_amount || 0);

    if (!compraId) {
      console.warn(`[Webhook MP] Pago ${paymentId} sin external_reference (compraId).`);
      return NextResponse.json({ ok: true, message: "Missing external_reference" }, { status: 200 });
    }

    // Intentar conectar con Supabase service_role
    let supabase;
    try {
      supabase = createAdminClient();
    } catch {
      console.warn("[Webhook MP] Supabase no configurado, saltando actualización de BD.");
      return NextResponse.json({ ok: true, message: "Supabase not configured (mock mode)" }, { status: 200 });
    }

    // 2. IDEMPOTENCIA: Verificar si el pago ya fue registrado previamente (Sección 11 y RN)
    const { data: compraExistente, error: compraErr } = await supabase
      .from("compras")
      .select("*, sorteos!inner(id, bloqueado)")
      .eq("id", compraId)
      .maybeSingle();

    if (compraErr || !compraExistente) {
      console.error(`[Webhook MP] Compra no encontrada en BD: ${compraId}`);
      return NextResponse.json({ ok: true, message: "Compra not found" }, { status: 200 });
    }

    // Si ya está pagada y tiene el mismo mp_payment_id, es un webhook repetido (no-op seguro)
    if (
      compraExistente.estado_pago === "pagado" &&
      compraExistente.mp_payment_id === String(payment.id)
    ) {
      console.log(`[Webhook MP] Idempotencia: pago ${paymentId} ya estaba procesado.`);
      return NextResponse.json({ ok: true, message: "Already processed" }, { status: 200 });
    }

    // 3. Procesar según estado del pago de Mercado Pago
    if (paymentStatus === "approved") {
      if (transactionAmount < Number(compraExistente.monto_total)) {
        console.error(
          `[Webhook MP] Monto discordante en pago ${paymentId}. Esperado: ${compraExistente.monto_total}, Recibido: ${transactionAmount}`
        );
      }

      const { data: numerosDisponibles, error: stockErr } = await supabase
        .from("numeros")
        .select("id, numero")
        .eq("sorteo_id", compraExistente.sorteo_id)
        .is("compra_id", null)
        .order("numero", { ascending: true });

      if (stockErr) {
        console.error("[Webhook MP] Error consultando stock disponible:", stockErr);
        return NextResponse.json({ ok: true, message: "Stock lookup failed" }, { status: 200 });
      }

      const stockActual = numerosDisponibles?.length ?? 0;
      if (stockActual < compraExistente.cantidad) {
        console.warn(`[Webhook MP] RN-06: pago aprobado sin stock suficiente para compra ${compraId}. Se ejecuta reembolso automático.`);

        try {
          await refundMercadoPagoPayment(payment.id);
          await supabase
            .from("compras")
            .update({
              estado_pago: "reembolsado",
              mp_payment_id: String(payment.id),
            })
            .eq("id", compraId);
        } catch (refundErr) {
          console.error(`[Webhook MP] Error al ejecutar reembolso de pago ${payment.id}:`, refundErr);
        }

        return NextResponse.json(
          { ok: true, message: "Payment refunded due to insufficient stock" },
          { status: 200 }
        );
      }

      const idsAAsignar = (numerosDisponibles || []).slice(0, compraExistente.cantidad).map((n) => n.id);
      await supabase
        .from("numeros")
        .update({ compra_id: compraId })
        .in("id", idsAAsignar);

      await supabase
        .from("compras")
        .update({
          estado_pago: "pagado",
          mp_payment_id: String(payment.id),
        })
        .eq("id", compraId);

      await supabase
        .from("sorteos")
        .update({ bloqueado: true })
        .eq("id", compraExistente.sorteo_id);

      console.log(`[Webhook MP] Pago ${paymentId} confirmado exitosamente para compra ${compraId}. Números asignados y sorteo bloqueado.`);
    } else if (paymentStatus === "rejected" || paymentStatus === "cancelled") {
      await supabase
        .from("compras")
        .update({ estado_pago: "fallido" })
        .eq("id", compraId);

      console.log(`[Webhook MP] Pago ${paymentId} rechazado/cancelado. Compra marcada como fallida para ${compraId}.`);
    }

    return NextResponse.json({ ok: true, status: paymentStatus }, { status: 200 });
  } catch (error: any) {
    console.error("[Webhook MP] Error general procesando webhook:", error);
    // Siempre respondemos 200 a MP para evitar reintentos infinitos si fue un error de procesamiento no transitorio
    return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
  }
}
