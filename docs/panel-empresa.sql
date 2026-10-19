-- ── BUS COMPANY PANEL (/panel) ───────────────────────────────
-- Run once in Supabase → SQL Editor.
-- Staff log in with email + password. A login only gets panel access if it is
-- listed in empresa_usuarios, and then only sees its own company's data.

-- 1) Which login manages which company
create table if not exists empresa_usuarios (
  usuario_id uuid primary key references auth.users(id) on delete cascade,
  empresa_id uuid not null references empresas(id)
);
alter table empresa_usuarios enable row level security;
drop policy if exists "staff lee su fila" on empresa_usuarios;
create policy "staff lee su fila" on empresa_usuarios for select using (auth.uid() = usuario_id);

-- Company of the logged-in staff member (null for passengers).
-- security definer so the policies below can call it without recursion.
create or replace function mi_empresa() returns uuid
language sql stable security definer set search_path = public as $$
  select empresa_id from empresa_usuarios where usuario_id = auth.uid()
$$;

-- 2) Staff read all trips of their company (the public rule only shows scheduled ones)
drop policy if exists "staff lee viajes de su empresa" on viajes;
create policy "staff lee viajes de su empresa" on viajes for select using (
  exists (select 1 from rutas r where r.id = viajes.ruta_id and r.empresa_id = mi_empresa())
);

-- 3) Staff read the bookings on their company's trips (passenger list)
drop policy if exists "staff lee boletos de su empresa" on boletos;
create policy "staff lee boletos de su empresa" on boletos for select using (
  exists (select 1 from viajes v join rutas r on r.id = v.ruta_id
          where v.id = boletos.viaje_id and r.empresa_id = mi_empresa())
);

-- 4) Security fix: passengers could change their own tickets/payments
--    (e.g. mark a ticket "pagado"). Now read-only; writes only via reservar_asiento().
drop policy if exists "users own boletos" on boletos;
drop policy if exists "users read own boletos" on boletos;
create policy "users read own boletos" on boletos for select using (auth.uid() = usuario_id);

drop policy if exists "users own pagos" on pagos;
drop policy if exists "users read own pagos" on pagos;
create policy "users read own pagos" on pagos for select using (auth.uid() = usuario_id);

-- 5) Security fix: notificaciones had no row level security at all
alter table notificaciones enable row level security;
drop policy if exists "users read own notificaciones" on notificaciones;
create policy "users read own notificaciones" on notificaciones for select using (auth.uid() = usuario_id);

-- ── GIVE A LOGIN ACCESS ──────────────────────────────────────
-- First create the login: Authentication → Users → Add user → Create new user
-- (email + password, tick "Auto Confirm User"). Then run, with that email:
--
-- insert into empresa_usuarios (usuario_id, empresa_id)
-- select u.id, e.id from auth.users u, empresas e
-- where u.email = 'gerente@ejemplo.com' and e.nombre = 'Hedman Alas';
