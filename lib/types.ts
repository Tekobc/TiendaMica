export type SorteoEstado = 'activo' | 'completo' | 'sorteado' | 'cancelado';
export type PagoEstado = 'reservado' | 'pagado' | 'vencido' | 'fallido' | 'reembolsado';

export interface Sorteo {
  id: string;
  premio: string;
  precio_numero: number;
  cantidad_numeros: number;
  tope_por_compra: number;
  descripcion_auto?: string | null;
  estado: SorteoEstado;
  bloqueado: boolean;
  numero_ganador?: number | null;
  ganador_cargado_at?: string | null;
  ganador_cargado_por?: string | null;
  created_at: string;
}

export interface NumeroItem {
  id: string;
  sorteo_id: string;
  numero: number;
  ocupado: boolean; // Solo expuesto al público (disponible / ocupado) - RN dice nunca mostrar comprador
}

export interface Compra {
  id: string;
  sorteo_id: string;
  nombre_completo: string;
  telefono: string;
  cantidad: number;
  monto_total: number;
  estado_pago: PagoEstado;
  mp_preference_id?: string | null;
  mp_payment_id?: string | null;
  token_acceso: string;
  reservado_hasta: string;
  created_at: string;
}

export interface SorteoHistorialItem {
  id: string;
  premio: string;
  numero_ganador: number;
  ganador_cargado_at: string;
  cantidad_numeros: number;
  precio_numero: number;
}
