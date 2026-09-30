"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createMercadoPagoPreference } from "@/lib/mercadopago";
import { getActiveSorteo, MOCK_SORTEO_ACTIVO } from "@/lib/mock-data";

// Almacén en memoria simple para control de rate-limit por IP (RN-10)
const ipReservationsMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipReservationsMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipReservationsMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 }); // Ventana de 10 min
    return true;
  }

  if (entry.count >= 5) {
    // Máximo 5 reservas activas por IP cada 10 min (RN-10)
    return false;
  }

  entry.count += 1;
  return true;
}

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

    // 3. Control de abuso por IP (RN-10)
    const headerList = await headers();
    const clientIp =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      "127.0.0.1";

    if (!checkRateLimit(clientIp)) {
      return {
        ok: false,
        error: "Has superado el límite de reservas activas temporales. Por favor, aguardá unos minutos.",
      };
    }

    // 4. Obtener datos del sorteo para cálculo y validación
    const sorteo = await getActiveSorteo();
    if (sorteo.id !== sorteoId || sorteo.estado !== "activo") {
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

    // 5. Intentar reserva atómica en Supabase vía procedimiento almacenado plpgsql (Sección 8 paso 1)
    let compraId: string = crypto.randomUUID();
    let modoSimulado = false;

    const hasSupabaseConfig = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (hasSupabaseConfig) {
      try {
        const supabaseAdmin = createAdminClient();

        const { data, error } = await supabaseAdmin.rpc("reservar_numeros", {
          p_sorteo_id: sorteoId,
          p_cantidad: cantidad,
          p_nombre: nombreCompleto.trim(),
          p_telefono: cleanedPhone,
          p_token_acceso: tokenAcceso,
        });

        if (error) {
          console.error("[Reserva] Error RPC Supabase:", error);
          if (error.message && error.message.includes("No hay suficientes números")) {
            return { ok: false, error: "No quedan suficientes números disponibles para esta cantidad." };
          }
          return { ok: false, error: error.message || "Error al procesar la reserva en base de datos." };
        }

        if (!data || !data.ok) {
          return { ok: false, error: data?.error || "No quedan suficientes números disponibles para esta cantidad." };
        }

        compraId = data.compra_id;
      } catch (dbErr: any) {
        console.error("[Reserva] Excepción al invocar Supabase RPC:", dbErr);
        return { ok: false, error: dbErr?.message || "Error de conexión al procesar la reserva." };
      }
    } else {
      console.warn("[Reserva] Supabase no configurado en entorno, operando en modo simulado para desarrollo local.");
      modoSimulado = true;
    }

    // 6. Crear preferencia en Mercado Pago (Paso 2)
    const preference = await createMercadoPagoPreference({
      compraId,
      premio: sorteo.premio,
      cantidad,
      precioUnitario: sorteo.precio_numero,
      nombreCompleto: nombreCompleto.trim(),
      telefono: cleanedPhone,
      tokenAcceso,
    });

    // 7. Si estamos con Supabase conectado, guardar mp_preference_id
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
