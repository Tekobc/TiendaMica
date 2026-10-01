"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveSorteo, getHistorialSorteos, MOCK_SORTEO_ACTIVO, MOCK_HISTORIAL } from "@/lib/mock-data";
import { Sorteo, Compra, SorteoHistorialItem } from "@/lib/types";

export interface AdminParticipanteRow {
  compraId: string;
  nombreCompleto: string;
  telefono: string;
  cantidad: number;
  montoTotal: number;
  estadoPago: string;
  numeros: number[];
  createdAt: string;
  tokenAcceso: string;
}

export interface AdminDashboardData {
  sorteo: Sorteo;
  metricas: {
    totalRecaudado: number;
    vendidos: number;
    disponibles: number;
    pendientes: number;
    vencidos: number;
  };
  participantes: AdminParticipanteRow[];
  historial: SorteoHistorialItem[];
}

export async function obtenerDashboardAdmin(): Promise<AdminDashboardData> {
  try {
    const supabase = createAdminClient();

    // 1. Sorteo actual
    const sorteo = await getActiveSorteo();

    // 2. Historial de dinámicas anteriores
    const historial = await getHistorialSorteos();

    // 3. Compras del sorteo
    const { data: comprasData, error: comprasErr } = await supabase
      .from("compras")
      .select("*")
      .eq("sorteo_id", sorteo.id)
      .order("created_at", { ascending: false });

    // 3. Números del sorteo para mapear a compras
    const { data: numerosData } = await supabase
      .from("numeros")
      .select("numero, compra_id")
      .eq("sorteo_id", sorteo.id);

    const numerosPorCompra = new Map<string, number[]>();
    let vendidosCount = 0;

    (numerosData || []).forEach((n) => {
      if (n.compra_id) {
        vendidosCount++;
        const current = numerosPorCompra.get(n.compra_id) || [];
        current.push(n.numero);
        numerosPorCompra.set(n.compra_id, current);
      }
    });

    let totalRecaudado = 0;
    let pendientes = 0;
    let vencidos = 0;

    const participantes: AdminParticipanteRow[] = (comprasData || []).map((c) => {
      const monto = Number(c.monto_total);
      if (c.estado_pago === "pagado") {
        totalRecaudado += monto;
      } else if (c.estado_pago === "pendiente") {
        pendientes++;
      } else if (c.estado_pago === "fallido" || c.estado_pago === "reembolsado") {
        vencidos++;
      }

      const numeros = (numerosPorCompra.get(c.id) || []).sort((a, b) => a - b);

      return {
        compraId: c.id,
        nombreCompleto: c.nombre_completo,
        telefono: c.telefono,
        cantidad: c.cantidad,
        montoTotal: monto,
        estadoPago: c.estado_pago,
        numeros,
        createdAt: c.created_at,
        tokenAcceso: c.token_acceso,
      };
    });

    return {
      sorteo,
      metricas: {
        totalRecaudado,
        vendidos: vendidosCount,
        disponibles: Math.max(0, sorteo.cantidad_numeros - vendidosCount),
        pendientes,
        vencidos,
      },
      participantes,
      historial,
    };
  } catch (err) {
    console.warn("[Admin Action] Error conectando con BD, usando datos mockeados:", err);
    return getMockAdminDashboard();
  }
}

// RN-02: Al registrarse el primer pago aprobado, precio_numero, premio y cantidad_numeros quedan inmutables
export async function actualizarConfiguracionSorteo(formData: {
  sorteoId: string;
  titulo: string;
  descripcion: string;
  premio: string;
  precioNumero: number;
  cantidadNumeros: number;
  topePorCompra: number;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    // 1. Validar si el sorteo está bloqueado
    const { data: sorteo, error: checkErr } = await supabase
      .from("sorteos")
      .select("bloqueado, estado")
      .eq("id", formData.sorteoId)
      .single();

    if (checkErr || !sorteo) {
      return { ok: false, error: "El sorteo no existe." };
    }

    if (sorteo.bloqueado) {
      return {
        ok: false,
        error: "Inmutable: El sorteo está bloqueado porque ya se registró al menos un pago aprobado (RN-02).",
      };
    }

    const tituloFinal = formData.titulo?.trim() || formData.premio.trim();
    const descripcionFinal = formData.descripcion?.trim() || "Participá comprando tu número";
    const descripcionAuto = `${tituloFinal} — $${formData.precioNumero.toLocaleString("es-AR")} por número`;

    const { error: updateErr } = await supabase
      .from("sorteos")
      .update({
        titulo: tituloFinal,
        descripcion: descripcionFinal,
        premio: formData.premio,
        precio_numero: formData.precioNumero,
        cantidad_numeros: formData.cantidadNumeros,
        tope_por_compra: formData.topePorCompra,
        descripcion_auto: descripcionAuto,
      })
      .eq("id", formData.sorteoId);

    if (updateErr) {
      return { ok: false, error: updateErr.message };
    }

    revalidatePath("/admin");
    revalidatePath("/dinamica");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error al actualizar la configuración." };
  }
}

// RN-11 & Gap #6: Corrección manual de teléfono por parte del admin
export async function actualizarTelefonoParticipante(
  compraId: string,
  nuevoTelefono: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const cleaned = nuevoTelefono.replace(/\D/g, "");
    if (cleaned.length < 10) {
      return { ok: false, error: "El teléfono debe contener al menos 10 dígitos." };
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("compras")
      .update({ telefono: cleaned })
      .eq("id", compraId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error al actualizar teléfono." };
  }
}

// RN-07: Carga única e inalterable del número ganador.
// Una vez cargado, no existe UI ni API que permita editarlo.
export async function cargarGanador(
  sorteoId: string,
  numeroGanador: number,
  adminEmail: string
): Promise<{ ok: boolean; error?: string; ganador?: number }> {
  try {
    const supabase = createAdminClient();

    // 1. Verificar que el sorteo exista y NO tenga ya un ganador cargado (RN-07)
    const { data: sorteo, error: sorteoErr } = await supabase
      .from("sorteos")
      .select("id, estado, numero_ganador, cantidad_numeros")
      .eq("id", sorteoId)
      .single();

    if (sorteoErr || !sorteo) {
      return { ok: false, error: "El sorteo no existe." };
    }

    if (sorteo.numero_ganador !== null && sorteo.numero_ganador !== undefined) {
      return {
        ok: false,
        error: "El ganador ya fue cargado y no puede modificarse (RN-07).",
      };
    }

    if (sorteo.estado === "cancelado") {
      return { ok: false, error: "No se puede cargar ganador en un sorteo cancelado." };
    }

    // 2. Validar que el número esté dentro del rango del sorteo
    if (
      !Number.isInteger(numeroGanador) ||
      numeroGanador < 1 ||
      numeroGanador > sorteo.cantidad_numeros
    ) {
      return {
        ok: false,
        error: `El número ganador debe ser un entero entre 1 y ${sorteo.cantidad_numeros}.`,
      };
    }

    // 3. Registrar ganador con auditoría de quién y cuándo (RN-07)
    const { error: updateErr } = await supabase
      .from("sorteos")
      .update({
        numero_ganador: numeroGanador,
        ganador_cargado_at: new Date().toISOString(),
        ganador_cargado_por: adminEmail,
        estado: "sorteado",
      })
      .eq("id", sorteoId);

    if (updateErr) {
      return { ok: false, error: updateErr.message };
    }

    revalidatePath("/admin");
    revalidatePath("/dinamica");
    return { ok: true, ganador: numeroGanador };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error al cargar el ganador." };
  }
}

// Sección 9.4: Abrir nuevo sorteo solo cuando el actual está en estado 'sorteado' o 'cancelado'
export async function abrirNuevoSorteo(config: {
  titulo: string;
  descripcion: string;
  premio: string;
  precioNumero: number;
  cantidadNumeros: number;
  topePorCompra: number;
}): Promise<{ ok: boolean; error?: string; sorteoId?: string }> {
  try {
    const supabase = createAdminClient();

    // Verificar que no haya un sorteo activo o completo (RN-01)
    const { data: activo } = await supabase
      .from("sorteos")
      .select("id, estado")
      .in("estado", ["activo", "completo"])
      .maybeSingle();

    if (activo) {
      return {
        ok: false,
        error:
          "Ya existe un sorteo activo o completo. Solo puede haber uno a la vez (RN-01).",
      };
    }

    // Validaciones básicas
    if (!config.premio.trim()) {
      return { ok: false, error: "El nombre del premio es obligatorio." };
    }
    if (config.precioNumero <= 0) {
      return { ok: false, error: "El precio por número debe ser mayor a 0." };
    }
    if (config.cantidadNumeros < 10 || config.cantidadNumeros > 10000) {
      return {
        ok: false,
        error: "La cantidad de números debe estar entre 10 y 10.000.",
      };
    }
    if (config.topePorCompra < 1 || config.topePorCompra > config.cantidadNumeros) {
      return {
        ok: false,
        error: "El tope por compra es inválido.",
      };
    }

    const tituloFinal = config.titulo?.trim() || config.premio.trim();
    const descripcionFinal = config.descripcion?.trim() || "Participá comprando tu número";
    const descripcionAuto = `${tituloFinal} — $${config.precioNumero.toLocaleString("es-AR")} por número`;

    // Crear el nuevo sorteo
    const { data: nuevoSorteo, error: sorteoErr } = await supabase
      .from("sorteos")
      .insert({
        titulo: tituloFinal,
        descripcion: descripcionFinal,
        premio: config.premio.trim(),
        precio_numero: config.precioNumero,
        cantidad_numeros: config.cantidadNumeros,
        tope_por_compra: config.topePorCompra,
        descripcion_auto: descripcionAuto,
        estado: "activo",
        bloqueado: false,
      })
      .select("id")
      .single();

    if (sorteoErr || !nuevoSorteo) {
      return { ok: false, error: sorteoErr?.message || "Error al crear el sorteo." };
    }

    // Pre-generar todos los números del sorteo (1..cantidad_numeros)
    const numerosInsert = Array.from({ length: config.cantidadNumeros }, (_, i) => ({
      sorteo_id: nuevoSorteo.id,
      numero: i + 1,
    }));

    // Insertar en lotes de 500 para evitar límites de payload
    const LOTE = 500;
    for (let i = 0; i < numerosInsert.length; i += LOTE) {
      const lote = numerosInsert.slice(i, i + LOTE);
      const { error: numErr } = await supabase.from("numeros").insert(lote);
      if (numErr) {
        // Rollback: borrar el sorteo si falla la generación de números
        await supabase.from("sorteos").delete().eq("id", nuevoSorteo.id);
        return { ok: false, error: `Error generando números: ${numErr.message}` };
      }
    }

    revalidatePath("/admin");
    revalidatePath("/dinamica");
    return { ok: true, sorteoId: nuevoSorteo.id };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error al abrir el nuevo sorteo." };
  }
}


function getMockAdminDashboard(): AdminDashboardData {
  return {
    sorteo: {
      ...MOCK_SORTEO_ACTIVO,
      bloqueado: true, // Demostración de regla RN-02
    },
    metricas: {
      totalRecaudado: 35000,
      vendidos: 14,
      disponibles: 86,
      pendientes: 2,
      vencidos: 1,
    },
    participantes: [
      {
        compraId: "c-101",
        nombreCompleto: "Camila Rodríguez",
        telefono: "1158492019",
        cantidad: 2,
        montoTotal: 5000,
        estadoPago: "pagado",
        numeros: [3, 4],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        tokenAcceso: "demo-token-1",
      },
      {
        compraId: "c-102",
        nombreCompleto: "Lucía Fernández",
        telefono: "1149203810",
        cantidad: 3,
        montoTotal: 7500,
        estadoPago: "pagado",
        numeros: [7, 8, 9],
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        tokenAcceso: "demo-token-2",
      },
      {
        compraId: "c-103",
        nombreCompleto: "Valeria Benítez",
        telefono: "1192837465",
        cantidad: 1,
        montoTotal: 2500,
        estadoPago: "pendiente",
        numeros: [12],
        createdAt: new Date(Date.now() - 300000).toISOString(),
        tokenAcceso: "demo-token-3",
      },
      {
        compraId: "c-104",
        nombreCompleto: "Agustina Morales",
        telefono: "1167483920",
        cantidad: 2,
        montoTotal: 5000,
        estadoPago: "reembolsado",
        numeros: [],
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        tokenAcceso: "demo-token-4",
      },
    ],
    historial: MOCK_HISTORIAL,
  };
}

export async function loginDevAdminAction(email = "admin@tiendamica.com.ar"): Promise<{ ok: boolean }> {
  const cookieStore = await cookies();
  cookieStore.set("admin_dev_session", email, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 horas
  });
  return { ok: true };
}

export async function logoutAdminAction(): Promise<{ ok: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_dev_session");
  return { ok: true };
}
