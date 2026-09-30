-- ==============================================================================
-- 02_atomic_reservation_function.sql
-- Función PostgreSQL para reserva atómica de números (RN-03, RN-04, RN-05, RN-06)
-- Concurrencia segura: SELECT ... FOR UPDATE SKIP LOCKED
-- ==============================================================================

create or replace function reservar_numeros(
  p_sorteo_id uuid,
  p_cantidad integer,
  p_nombre text,
  p_telefono text,
  p_token_acceso text
)
returns json
language plpgsql
security definer
as $$
declare
  v_sorteo record;
  v_compra_id uuid;
  v_disponibles_count integer;
  v_monto_total numeric(12,2);
  v_numeros_asignados integer[];
begin
  -- 1. Validar que el sorteo exista y esté activo
  select * into v_sorteo
  from sorteos
  where id = p_sorteo_id and estado = 'activo'
  for share;

  if not found then
    return json_build_object('ok', false, 'error', 'El sorteo no está disponible o no existe.');
  end if;

  -- Validar cantidad dentro del tope configurado (RN-08)
  if p_cantidad <= 0 or p_cantidad > v_sorteo.tope_por_compra then
    return json_build_object('ok', false, 'error', 'Cantidad inválida o supera el tope máximo permitido.');
  end if;

  -- 2. Liberar reservas vencidas de este sorteo (RN-05)
  with compras_vencidas as (
    update compras
    set estado_pago = 'vencido'
    where sorteo_id = p_sorteo_id
      and estado_pago = 'reservado'
      and reservado_hasta < now()
    returning id
  )
  update numeros
  set compra_id = null
  where compra_id in (select id from compras_vencidas);

  -- 3. Bloquear y seleccionar los números candidatos de menor numeración (RN-04)
  -- SELECT ... FOR UPDATE SKIP LOCKED evita carreras concurrentes (Gap #1)
  with seleccion as (
    select id, numero
    from numeros
    where sorteo_id = p_sorteo_id
      and compra_id is null
    order by numero asc
    limit p_cantidad
    for update skip locked
  )
  select array_agg(numero order by numero asc), count(*)
  into v_numeros_asignados, v_disponibles_count
  from seleccion;

  if coalesce(v_disponibles_count, 0) < p_cantidad then
    return json_build_object('ok', false, 'error', 'No hay suficientes números disponibles.');
  end if;

  -- 4. Calcular monto total en el servidor (RN-03)
  v_monto_total := p_cantidad * v_sorteo.precio_numero;

  -- 5. Crear el registro en compras (reserva de 10 minutos - RN-05)
  insert into compras (
    sorteo_id,
    nombre_completo,
    telefono,
    cantidad,
    monto_total,
    estado_pago,
    token_acceso,
    reservado_hasta
  ) values (
    p_sorteo_id,
    p_nombre,
    p_telefono,
    p_cantidad,
    v_monto_total,
    'reservado',
    p_token_acceso,
    now() + interval '10 minutes'
  )
  returning id into v_compra_id;

  -- 6. Asignar la compra a los números seleccionados
  update numeros
  set compra_id = v_compra_id
  where sorteo_id = p_sorteo_id
    and numero = any(v_numeros_asignados);

  -- 7. Si ya no quedan números disponibles tras esta reserva, actualizar estado del sorteo
  if not exists (select 1 from numeros where sorteo_id = p_sorteo_id and compra_id is null) then
    update sorteos set estado = 'completo' where id = p_sorteo_id;
  end if;

  return json_build_object(
    'ok', true,
    'compra_id', v_compra_id,
    'token_acceso', p_token_acceso,
    'monto_total', v_monto_total,
    'numeros', v_numeros_asignados,
    'reservado_hasta', now() + interval '10 minutes'
  );
end;
$$;
