-- ==============================================================================
-- 02_atomic_reservation_function.sql
-- RF-07: El flujo ya no reserva números antes del pago. La compra queda en pendiente
-- y la asignación de números ocurre solo cuando el webhook confirma `status = approved`.
-- ==============================================================================

create or replace function crear_compra_pendiente(
  p_sorteo_id uuid,
  p_cantidad integer,
  p_nombre text,
  p_telefono text,
  p_token_acceso text,
  p_monto_total numeric(12,2)
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_compra_id uuid;
begin
  insert into compras (
    sorteo_id,
    nombre_completo,
    telefono,
    cantidad,
    monto_total,
    estado_pago,
    token_acceso
  ) values (
    p_sorteo_id,
    p_nombre,
    p_telefono,
    p_cantidad,
    p_monto_total,
    'pendiente',
    p_token_acceso
  )
  returning id into v_compra_id;

  return v_compra_id;
end;
$$;

-- La lógica de asignación atómica queda en el webhook, no en una "reserva" previa.
