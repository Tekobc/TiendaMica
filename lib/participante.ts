import { createAdminClient } from "@/lib/supabase/admin";
import { Compra, Sorteo, NumeroItem } from "@/lib/types";
import { getActiveSorteo, MOCK_SORTEO_ACTIVO } from "@/lib/mock-data";

export interface ParticipantData {
  compra: Compra;
  sorteo: Sorteo;
  misNumeros: number[];
  todosLosNumeros: NumeroItem[];
}

export async function getParticipantData(token: string): Promise<ParticipantData | null> {
  try {
    const supabase = createAdminClient();

    // 1. Obtener la compra por su token no adivinable
    const { data: compraData, error: compraErr } = await supabase
      .from("compras")
      .select("*")
      .eq("token_acceso", token)
      .maybeSingle();

    if (compraErr || !compraData) {
      console.warn("[Participante] Compra no encontrada con token:", token);
      return process.env.NODE_ENV === "production" ? null : getMockParticipantData(token);
    }

    const compra = {
      ...compraData,
      monto_total: Number(compraData.monto_total),
    } as Compra;

    // 2. Obtener el sorteo correspondiente
    const { data: sorteoData } = await supabase
      .from("sorteos")
      .select("*")
      .eq("id", compra.sorteo_id)
      .single();

    const sorteo = sorteoData
      ? ({ ...sorteoData, precio_numero: Number(sorteoData.precio_numero) } as Sorteo)
      : await getActiveSorteo();

    if (!sorteo) {
      return process.env.NODE_ENV === "production" ? null : getMockParticipantData(token);
    }

    // 3. Obtener los números del sorteo e identificar los asignados a esta compra
    const { data: numerosData } = await supabase
      .from("numeros")
      .select("id, sorteo_id, numero, compra_id")
      .eq("sorteo_id", compra.sorteo_id)
      .order("numero", { ascending: true });

    const misNumeros: number[] = [];
    const todosLosNumeros: NumeroItem[] = (numerosData || []).map((n) => {
      const isMine = n.compra_id === compra.id;
      if (isMine) misNumeros.push(n.numero);
      return {
        id: n.id,
        sorteo_id: n.sorteo_id,
        numero: n.numero,
        ocupado: Boolean(n.compra_id),
      };
    });

    return {
      compra,
      sorteo,
      misNumeros: misNumeros.sort((a, b) => a - b),
      todosLosNumeros,
    };
  } catch {
    return process.env.NODE_ENV === "production" ? null : getMockParticipantData(token);
  }
}

// Fallback para pruebas en desarrollo cuando Supabase no está conectado
function getMockParticipantData(token: string): ParticipantData {
  const mockCompra: Compra = {
    id: "mock-compra-id",
    sorteo_id: MOCK_SORTEO_ACTIVO.id,
    nombre_completo: "Participante Demo",
    telefono: "1123456789",
    cantidad: 2,
    monto_total: MOCK_SORTEO_ACTIVO.precio_numero * 2,
    estado_pago: "pagado",
    token_acceso: token,
    created_at: new Date().toISOString(),
  } as any;

  const misNumeros = [14, 15];
  const todosLosNumeros: NumeroItem[] = Array.from({ length: 100 }, (_, i) => {
    const num = i + 1;
    return {
      id: `num-${num}`,
      sorteo_id: MOCK_SORTEO_ACTIVO.id,
      numero: num,
      ocupado: num < 20,
    };
  });

  return {
    compra: mockCompra,
    sorteo: MOCK_SORTEO_ACTIVO,
    misNumeros,
    todosLosNumeros,
  };
}
