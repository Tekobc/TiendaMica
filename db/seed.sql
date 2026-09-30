-- ==============================================================================
-- seed.sql
-- Datos iniciales y de prueba para desarrollo local / Supabase
-- ==============================================================================

-- Admin inicial en whitelist
insert into admins_whitelist (email)
values ('admin@tiendamica.com.ar')
on conflict (email) do nothing;

-- Sorteos pasados (Historial)
insert into sorteos (
  id,
  premio,
  precio_numero,
  cantidad_numeros,
  tope_por_compra,
  descripcion_auto,
  estado,
  bloqueado,
  numero_ganador,
  ganador_cargado_at,
  ganador_cargado_por,
  created_at
) values
(
  'a0000000-0000-0000-0000-000000000001',
  'Set Botanique de Lino + Perfume Adonai',
  2000.00,
  100,
  10,
  'Sorteo de Set Botanique de Lino + Perfume Adonai — $2.000 por número',
  'sorteado',
  true,
  47,
  now() - interval '20 days',
  'admin@tiendamica.com.ar',
  now() - interval '30 days'
),
(
  'a0000000-0000-0000-0000-000000000002',
  'Voucher $150.000 en Tienda Mica + Box de Regalo',
  2500.00,
  100,
  10,
  'Sorteo de Voucher $150.000 en Tienda Mica + Box de Regalo — $2.500 por número',
  'sorteado',
  true,
  14,
  now() - interval '45 days',
  'admin@tiendamica.com.ar',
  now() - interval '55 days'
)
on conflict do nothing;

-- Sorteo actual activo
insert into sorteos (
  id,
  premio,
  precio_numero,
  cantidad_numeros,
  tope_por_compra,
  descripcion_auto,
  estado,
  bloqueado,
  created_at
) values (
  'b0000000-0000-0000-0000-000000000001',
  'Box Exclusiva Adonai: Vestido Primavera + Accesorios & Fragancia de Autor',
  2500.00,
  100,
  10,
  'Sorteo de Box Exclusiva Adonai: Vestido Primavera + Accesorios & Fragancia de Autor — $2.500 por número',
  'activo',
  false,
  now()
)
on conflict do nothing;

-- Pre-generar los 100 números para el sorteo activo
insert into numeros (sorteo_id, numero)
select
  'b0000000-0000-0000-0000-000000000001'::uuid,
  generate_series(1, 100)
on conflict (sorteo_id, numero) do nothing;
