"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createMercadoPagoPreference } from "@/lib/mercadopago";
import { getActiveSorteo } from "@/lib/mock-data";

export interface ReservarNumerosInput {
  sorteoId: string;
  nombreCompleto: string;
  telefono: string;
  cantidad: number;
}

export interface ReservarNumerosResult {
  ok: boolean;
  error?: string;
  initPoint?: string;
  tokenAcceso?: string;
  compraId?: string;
}

export async function reservarNumerosAction(input: ReservarNumerosInput): Promise<ReservarNumerosResult> {
  try {
    const { sorteoId, nombreCompleto, telefono, cantidad } = input;

    // 1. Validar campos requeridos
    if (!nombreCompleto || nombreCompleto.trim().length < 3) {
      return { ok: false, error: "Por favor, ingresá tu nombre y apellido completos." };
    }

    // 2. Validar formato de teléfono celular argentino (RN-11)
    const cleanedPhone = telefono.replace(/\D/g, "");
    if (cleanedPhone.length < 10 || cleanedPhone.length > 13) {
      return {
        ok: false,
        error: "Ingresá un número de celular válido (ej: 1123456789 o con código de área de tu provincia).",
      };
    }

    // 3. Obtener datos del sorteo para cálculo y validación
    const sorteo = await getActiveSorteo();
    if (!sorteo || sorteo.id !== sorteoId || sorteo.estado !== "activo") {
      return { ok: false, error: "El sorteo solicitado no está activo." };
    }

    if (cantidad <= 0 || cantidad > sorteo.tope_por_compra) {
      return {
        ok: false,
        error: `Podés adquirir entre 1 y ${sorteo.tope_por_compra} números por compra.`,
      };
    }

    // RN-03: Cálculo estricto del monto en el servidor
    const montoCalculado = cantidad * sorteo.precio_numero;
    const tokenAcceso = crypto.randomUUID();

    // 4. Crear la compra en estado pendiente sin tocar la tabla de números (RF-07)
    let compraId: string = crypto.randomUUID();
    let modoSimulado = false;

    const hasSupabaseConfig = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
    );

    if (!hasSupabaseConfig && process.env.NODE_ENV === "production") {
      return { ok: false, error: "La conexión de pagos todavía no está configurada." };
    }

    if (hasSupabaseConfig) {
      try {
        const supabaseAdmin = createAdminClient();

        const { data, error } = await supabaseAdmin
          .from("compras")
          .insert({
            sorteo_id: sorteoId,
            nombre_completo: nombreCompleto.trim(),
            telefono: cleanedPhone,
            cantidad,
            monto_total: montoCalculado,
            estado_pago: "pendiente",
            token_acceso: tokenAcceso,
          })
          .select("id")
          .single();

        if (error) {
          console.error("[Compra] Error insertando compra pendiente:", error);
          return { ok: false, error: error.message || "Error al registrar la compra." };
        }

        compraId = data.id;
      } catch (dbErr: any) {
        console.error("[Compra] Excepción al crear la compra pendiente:", dbErr);
        return { ok: false, error: dbErr?.message || "Error de conexión al registrar la compra." };
      }
    } else {
      console.warn("[Compra] Supabase no configurado en entorno, operando en modo simulado para desarrollo local.");
      modoSimulado = true;
    }

    // 5. Crear preferencia en Mercado Pago (Paso 2)
    const preference = await createMercadoPagoPreference({
      compraId,
      premio: sorteo.premio,
      cantidad,
      precioUnitario: sorteo.precio_numero,
      nombreCompleto: nombreCompleto.trim(),
      telefono: cleanedPhone,
      tokenAcceso,
    });

    // 6. Si estamos con Supabase conectado, guardar mp_preference_id
    if (!modoSimulado) {
      try {
        const supabaseAdmin = createAdminClient();
        await supabaseAdmin
          .from("compras")
          .update({ mp_preference_id: preference.id })
          .eq("id", compraId);
      } catch (e) {
        console.error("Error actualizando mp_preference_id en compras:", e);
      }
    }

    const isLive = process.env.MP_ACCESS_TOKEN?.startsWith("APP_USR-");
    const initPoint = isLive
      ? (preference.init_point || preference.sandbox_init_point)
      : (preference.sandbox_init_point || preference.init_point);

    return {
      ok: true,
      initPoint,
      tokenAcceso,
      compraId,
    };
  } catch (err: any) {
    console.error("Error en reservarNumerosAction:", err);
    return {
      ok: false,
      error: err.message || "Ocurrió un error inesperado al procesar la reserva.",
    };
  }
}
