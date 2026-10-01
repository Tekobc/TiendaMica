import { Sorteo, NumeroItem, SorteoHistorialItem } from './types';
import { createClient } from './supabase/server';

export const MOCK_SORTEO_ACTIVO: Sorteo = {
  id: 'b0000000-0000-0000-0000-000000000001',
  titulo: 'Gran Rifa Adonai',
  descripcion: 'Participá comprando tu número',
  premio: 'Box Exclusiva Adonai: Vestido Primavera + Accesorios & Fragancia de Autor',
  precio_numero: 2500,
  cantidad_numeros: 100,
  tope_por_compra: 10,
  descripcion_auto: 'Gran Rifa Adonai — $2.500 por número',
  estado: 'activo',
  bloqueado: false,
  numero_ganador: null,
  ganador_cargado_at: null,
  ganador_cargado_por: null,
  created_at: new Date().toISOString(),
};

// Generamos 100 números con algunos números ocupados para demostrar la grilla
const ocupadosEjemplo = new Set([3, 7, 12, 19, 24, 33, 45, 52, 60, 68, 77, 83, 91, 99]);

export const MOCK_NUMEROS: NumeroItem[] = Array.from({ length: 100 }, (_, i) => {
  const num = i + 1;
  return {
    id: `num-${num}`,
    sorteo_id: MOCK_SORTEO_ACTIVO.id,
    numero: num,
    ocupado: ocupadosEjemplo.has(num),
  };
});

export const MOCK_HISTORIAL: SorteoHistorialItem[] = [
  {
    id: 'hist-1',
    premio: 'Set Botanique de Lino + Perfume Adonai',
    numero_ganador: 47,
    ganador_cargado_at: '2026-08-15T18:30:00Z',
    cantidad_numeros: 100,
    precio_numero: 2000,
  },
  {
    id: 'hist-2',
    premio: 'Voucher $150.000 en Tienda Mica + Box de Regalo',
    numero_ganador: 14,
    ganador_cargado_at: '2026-07-20T21:00:00Z',
    cantidad_numeros: 100,
    precio_numero: 2500,
  },
  {
    id: 'hist-3',
    premio: 'Colección Cápsula Invierno: Tapado + Bufanda Soft',
    numero_ganador: 88,
    ganador_cargado_at: '2026-06-10T19:00:00Z',
    cantidad_numeros: 100,
    precio_numero: 1800,
  },
];

export async function getActiveSorteo(): Promise<Sorteo> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('sorteos')
      .select('*')
      .in('estado', ['activo', 'completo'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return MOCK_SORTEO_ACTIVO;
    }

    return {
      ...data,
      precio_numero: Number(data.precio_numero),
    } as Sorteo;
  } catch {
    return MOCK_SORTEO_ACTIVO;
  }
}

export async function getNumerosForSorteo(sorteoId: string, totalCount = 100): Promise<NumeroItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('numeros')
      .select('id, sorteo_id, numero, compra_id')
      .eq('sorteo_id', sorteoId)
      .order('numero', { ascending: true });

    if (error || !data || data.length === 0) {
      return MOCK_NUMEROS;
    }

    // Regla de Privacidad: Solo exponemos si está ocupado o no, nunca la compra_id ni datos personales
    return data.map((item) => ({
      id: item.id,
      sorteo_id: item.sorteo_id,
      numero: item.numero,
      ocupado: Boolean(item.compra_id),
    }));
  } catch {
    return MOCK_NUMEROS;
  }
}

export async function getHistorialSorteos(): Promise<SorteoHistorialItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('sorteos')
      .select('id, premio, numero_ganador, ganador_cargado_at, cantidad_numeros, precio_numero')
      .eq('estado', 'sorteado')
      .not('numero_ganador', 'is', null)
      .order('ganador_cargado_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_HISTORIAL;
    }

    return data.map((item) => ({
      id: item.id,
      premio: item.premio,
      numero_ganador: item.numero_ganador,
      ganador_cargado_at: item.ganador_cargado_at,
      cantidad_numeros: item.cantidad_numeros,
      precio_numero: Number(item.precio_numero),
    }));
  } catch {
    return MOCK_HISTORIAL;
  }
}
