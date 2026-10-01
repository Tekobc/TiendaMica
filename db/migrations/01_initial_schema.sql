-- ==============================================================================
-- 01_initial_schema.sql
-- Sorteos Adonai BY TIENDA MICA - Tablas principales e índices
-- Fuente: CONTEXT.md Sección 6 y Sección 15
-- ==============================================================================

-- 1. Tabla de Sorteos
-- Solo puede existir UNO con estado != 'sorteado'/'cancelado' (RN-01)
create table if not exists sorteos (
  id uuid primary key default gen_random_uuid(),
  titulo text,
  descripcion text,
  premio text not null,
  precio_numero numeric(12,2) not null check (precio_numero > 0),
  cantidad_numeros integer not null check (cantidad_numeros > 0),
  tope_por_compra integer not null default 10 check (tope_por_compra > 0),
  descripcion_auto text, -- generada automáticamente, ej: 'Sorteo de {premio} — ${precio_numero} por número'
  estado text not null default 'activo' check (estado in ('activo', 'completo', 'sorteado', 'cancelado')),
  bloqueado boolean not null default false, -- true tras la primera venta aprobada (RN-02)
  numero_ganador integer,
  ganador_cargado_at timestamptz,
  ganador_cargado_por text, -- email del admin
  created_at timestamptz not null default now()
);

-- Máximo un sorteo activo o completo a la vez (RN-01)
create unique index if not exists un_sorteo_activo on sorteos ((true))
  where estado in ('activo', 'completo');

-- 2. Tabla de Compras
-- Una compra = un pago = uno o más números
create table if not exists compras (
  id uuid primary key default gen_random_uuid(),
  sorteo_id uuid not null references sorteos(id) on delete cascade,
  nombre_completo text not null,
  telefono text not null,
  cantidad integer not null check (cantidad > 0),
  monto_total numeric(12,2) not null,
  estado_pago text not null default 'pendiente'
    check (estado_pago in ('pendiente', 'pagado', 'fallido', 'reembolsado')),
  mp_preference_id text,
  mp_payment_id text unique, -- unicidad = idempotencia del webhook Mercado Pago
  token_acceso text not null unique, -- acceso privado del participante
  created_at timestamptz not null default now()
);

-- 3. Tabla de Números individuales
-- Se pre-generan al crear el sorteo (1..cantidad_numeros)
create table if not exists numeros (
  id uuid primary key default gen_random_uuid(),
  sorteo_id uuid not null references sorteos(id) on delete cascade,
  numero integer not null,
  compra_id uuid references compras(id) on delete set null, -- null = disponible
  unique (sorteo_id, numero)
);

-- Índice único PARCIAL: un número solo puede estar tomado por una compra activa a la vez (RN-04, Gap #1)
create unique index if not exists un_numero_activo on numeros (sorteo_id, numero)
  where compra_id is not null;

-- 4. Whitelist de Administradores
create table if not exists admins_whitelist (
  email text primary key
);

-- ==============================================================================
-- Políticas de Seguridad RLS (Row Level Security)
-- ==============================================================================

alter table sorteos enable row level security;
alter table numeros enable row level security;
alter table compras enable row level security;
alter table admins_whitelist enable row level security;

-- Las consultas de la aplicación pasan por el servidor con service_role.
create policy "Compras: solo service_role"
  on compras for all to service_role
  using (true)
  with check (true);

-- Whitelist: Solo service_role
create policy "Admins: solo service_role"
  on admins_whitelist for all to service_role
  using (true)
  with check (true);

grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
