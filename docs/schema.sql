-- ============================================================
--  SACBÉ — Database Schema
--  PostgreSQL via Supabase
--  Run this in Supabase → SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── TERMINALES ──────────────────────────────────────────────
create table terminales (
  id          uuid primary key default gen_random_uuid(),
  codigo      text not null unique,
  nombre      text not null,
  ciudad      text not null,
  pais        text not null default 'Honduras',
  latitud     numeric(9,6),
  longitud    numeric(9,6),
  direccion   text,
  activa      boolean not null default true,
  created_at  timestamptz default now()
);

insert into terminales (codigo, nombre, ciudad) values
  ('SPS', 'Terminal Gran Central',    'San Pedro Sula'),
  ('TGU', 'Terminal Metropolitana',   'Tegucigalpa'),
  ('CEI', 'Terminal La Ceiba',        'La Ceiba'),
  ('CMG', 'Terminal Comayagua',       'Comayagua'),
  ('CHO', 'Terminal Choluteca',       'Choluteca'),
  ('CPN', 'Terminal Copán',           'Copán Ruinas'),
  ('ROA', 'Terminal Roatán',          'Roatán');

-- ── EMPRESAS ────────────────────────────────────────────────
create table empresas (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  rtn           text unique,
  telefono      text,
  email         text,
  logo_url      text,
  activa        boolean not null default true,
  comision_pct  numeric(5,2) not null default 5.00,
  plan          text not null default 'basico'
                check (plan in ('basico','premium','enterprise')),
  created_at    timestamptz default now()
);

insert into empresas (nombre, rtn, email) values
  ('Hedman Alas',    '08011990000001', 'info@hedmanalas.com'),
  ('Viana',          '08011990000002', 'info@viana.hn'),
  ('El Rey Express', '08011990000003', 'info@elreyexpress.hn'),
  ('Saenz',          '08011990000004', 'info@saenz.hn'),
  ('Cotuc',          '08011990000005', 'info@cotuc.hn');

-- ── RUTAS ───────────────────────────────────────────────────
create table rutas (
  id            uuid primary key default gen_random_uuid(),
  empresa_id    uuid not null references empresas(id),
  origen_id     uuid not null references terminales(id),
  destino_id    uuid not null references terminales(id),
  duracion_min  int not null,
  precio_base   numeric(8,2) not null,
  activa        boolean not null default true,
  created_at    timestamptz default now(),
  unique (empresa_id, origen_id, destino_id)
);

-- ── VIAJES ──────────────────────────────────────────────────
create table viajes (
  id             uuid primary key default gen_random_uuid(),
  ruta_id        uuid not null references rutas(id),
  salida         timestamptz not null,
  llegada_est    timestamptz not null,
  capacidad      int not null default 40,
  asientos_disp  int not null default 40,
  clase          text not null default 'economica'
                 check (clase in ('economica','ejecutivo','primera')),
  precio         numeric(8,2) not null,
  estado         text not null default 'programado'
                 check (estado in ('programado','en_ruta','completado','cancelado')),
  placa_bus      text,
  created_at     timestamptz default now()
);

-- ── ASIENTOS ────────────────────────────────────────────────
create table asientos (
  id         uuid primary key default gen_random_uuid(),
  viaje_id   uuid not null references viajes(id) on delete cascade,
  numero     text not null,
  fila       int not null,
  columna    text not null,
  tipo       text not null default 'normal'
             check (tipo in ('normal','ventana','pasillo','preferencial')),
  estado     text not null default 'disponible'
             check (estado in ('disponible','reservado','vendido','bloqueado')),
  unique (viaje_id, numero)
);

-- ── PAGOS ───────────────────────────────────────────────────
create table pagos (
  id              uuid primary key default gen_random_uuid(),
  usuario_id      uuid references auth.users(id),
  monto           numeric(8,2) not null,
  comision        numeric(8,2) not null default 0,
  metodo          text not null check (metodo in ('tarjeta','efectivo','billetera')),
  estado          text not null default 'pendiente'
                  check (estado in ('pendiente','completado','fallido','reembolsado')),
  proveedor       text,
  referencia_ext  text unique,
  metadata        jsonb,
  created_at      timestamptz default now()
);

-- ── BOLETOS ─────────────────────────────────────────────────
create table boletos (
  id               uuid primary key default gen_random_uuid(),
  usuario_id       uuid references auth.users(id),
  viaje_id         uuid not null references viajes(id),
  asiento_id       uuid not null references asientos(id),
  pago_id          uuid references pagos(id),
  codigo_qr        text not null unique,
  nombre_pasajero  text not null,
  identidad_pas    text not null,
  es_menor         boolean not null default false,
  tutor_nombre     text,
  tutor_identidad  text,
  precio_final     numeric(8,2) not null,
  estado           text not null default 'reservado'
                   check (estado in ('reservado','pagado','usado','cancelado','expirado')),
  ticket_url       text,
  created_at       timestamptz default now()
);

-- ── NOTIFICACIONES ──────────────────────────────────────────
create table notificaciones (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid references auth.users(id),
  canal       text not null check (canal in ('sms','whatsapp','email','push')),
  tipo        text not null check (tipo in ('confirmacion','recordatorio','cancelacion','promo')),
  mensaje     text not null,
  enviada     boolean not null default false,
  created_at  timestamptz default now()
);

-- ── VIEW: viajes disponibles ─────────────────────────────────
create or replace view v_viajes_disponibles as
select
  v.id,
  v.salida,
  v.llegada_est,
  v.clase,
  v.precio,
  v.asientos_disp,
  v.estado,
  e.nombre         as empresa,
  e.logo_url       as empresa_logo,
  t_o.nombre       as origen,
  t_o.codigo       as origen_codigo,
  t_o.ciudad       as origen_ciudad,
  t_d.nombre       as destino,
  t_d.codigo       as destino_codigo,
  t_d.ciudad       as destino_ciudad,
  r.duracion_min
from viajes v
join rutas r          on r.id = v.ruta_id
join empresas e       on e.id = r.empresa_id
join terminales t_o   on t_o.id = r.origen_id
join terminales t_d   on t_d.id = r.destino_id
where v.estado = 'programado'
  and v.asientos_disp > 0
  and v.salida > now();

-- ── ROW LEVEL SECURITY ──────────────────────────────────────
-- Public can read routes and trips
alter table terminales enable row level security;
alter table empresas   enable row level security;
alter table rutas      enable row level security;
alter table viajes     enable row level security;
alter table asientos   enable row level security;
alter table boletos    enable row level security;
alter table pagos      enable row level security;

create policy "public read terminales" on terminales for select using (true);
create policy "public read empresas"   on empresas   for select using (true);
create policy "public read rutas"      on rutas      for select using (activa = true);
create policy "public read viajes"     on viajes     for select using (estado = 'programado');
create policy "public read asientos"   on asientos   for select using (true);

-- Users can only see their own tickets
create policy "users own boletos" on boletos
  for all using (auth.uid() = usuario_id);

create policy "users own pagos" on pagos
  for all using (auth.uid() = usuario_id);

-- ── REALTIME ────────────────────────────────────────────────
-- Enable realtime on asientos so seat map updates live
alter publication supabase_realtime add table asientos;
alter publication supabase_realtime add table viajes;
