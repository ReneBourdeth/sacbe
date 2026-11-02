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
revoke execute on function mi_empresa() from public, anon;
grant execute on function mi_empresa() to authenticated;

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

-- 6) Staff confirm a cash (PagoExpress) payment: reserved ticket → paid, seat → sold.
--    Only for trips of the staff member's own company.
create or replace function marcar_boleto_pagado(p_boleto_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_asiento uuid;
begin
  update boletos b set estado = 'pagado'
   from viajes v join rutas r on r.id = v.ruta_id
  where b.id = p_boleto_id
    and v.id = b.viaje_id
    and r.empresa_id = mi_empresa()
    and b.estado = 'reservado'
  returning b.asiento_id into v_asiento;

  if v_asiento is null then
    raise exception 'NO_PERMITIDO';  -- not this company's ticket, or not reserved
  end if;

  update asientos set estado = 'vendido' where id = v_asiento;
end;
$$;
revoke execute on function marcar_boleto_pagado(uuid) from public, anon;
grant execute on function marcar_boleto_pagado(uuid) to authenticated;

-- 7) Boarding check: staff scan a ticket's QR code. A paid ticket of their own
--    company becomes "usado" (used) and the passenger details come back.
--    Other companies' codes look the same as unknown codes (no data leak).
create or replace function validar_boleto(p_codigo text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_boleto boletos%rowtype;
begin
  select b.* into v_boleto
  from boletos b join viajes v on v.id = b.viaje_id join rutas r on r.id = v.ruta_id
  where b.codigo_qr = trim(p_codigo) and r.empresa_id = mi_empresa()
  for update of b;

  if not found then raise exception 'NO_ENCONTRADO'; end if;
  if v_boleto.estado = 'usado' then raise exception 'YA_USADO'; end if;
  if v_boleto.estado = 'reservado' then raise exception 'NO_PAGADO'; end if;
  if v_boleto.estado <> 'pagado' then raise exception 'NO_VALIDO'; end if;

  update boletos set estado = 'usado' where id = v_boleto.id;

  return (
    select json_build_object(
      'nombre', v_boleto.nombre_pasajero,
      'asiento', a.numero,
      'salida', v.salida,
      'origen', o.codigo,
      'destino', d.codigo)
    from viajes v
    join rutas r on r.id = v.ruta_id
    join terminales o on o.id = r.origen_id
    join terminales d on d.id = r.destino_id
    join asientos a on a.id = v_boleto.asiento_id
    where v.id = v_boleto.viaje_id
  );
end;
$$;
revoke execute on function validar_boleto(text) from public, anon;
grant execute on function validar_boleto(text) to authenticated;

-- 8) Staff manage their own company's routes and trips from /panel.
--    The WITH CHECK rules stop them from writing rows for another company.
drop policy if exists "staff lee sus rutas" on rutas;
create policy "staff lee sus rutas" on rutas for select using (empresa_id = (select mi_empresa()));
drop policy if exists "staff crea rutas" on rutas;
create policy "staff crea rutas" on rutas for insert
  with check (empresa_id = (select mi_empresa()) and origen_id <> destino_id and duracion_min > 0 and precio_base > 0);
drop policy if exists "staff edita rutas" on rutas;
create policy "staff edita rutas" on rutas for update
  using (empresa_id = (select mi_empresa()))
  with check (empresa_id = (select mi_empresa()) and duracion_min > 0 and precio_base > 0);

drop policy if exists "staff crea viajes" on viajes;
create policy "staff crea viajes" on viajes for insert with check (
  exists (select 1 from rutas r where r.id = viajes.ruta_id and r.empresa_id = (select mi_empresa()))
  and salida > now() and llegada_est > salida and precio > 0
);
drop policy if exists "staff edita viajes" on viajes;
create policy "staff edita viajes" on viajes for update
  using (exists (select 1 from rutas r where r.id = viajes.ruta_id and r.empresa_id = (select mi_empresa())))
  with check (
    exists (select 1 from rutas r where r.id = viajes.ruta_id and r.empresa_id = (select mi_empresa()))
    and llegada_est > salida and precio > 0
  );

-- New trips get their seats from this trigger; it must be allowed to write seats
-- even when a staff member (not the owner) inserts the trip.
alter function crear_asientos_viaje() security definer;

-- 9) Revenue per route for the staff member's company, for trips leaving between
--    two Honduras dates (inclusive). Runs with the caller's rights, so the usual
--    rules apply: a company only ever counts its own tickets.
--    Paid = 'pagado' or 'usado' (boarded); pending = 'reservado' (cash not yet paid).
create or replace function reporte_ingresos(p_desde date, p_hasta date)
returns table (
  origen text, destino text,
  boletos_pagados bigint, ingresos numeric,
  boletos_pendientes bigint, monto_pendiente numeric
)
language sql stable security invoker set search_path = public as $$
  select o.codigo, d.codigo,
         count(*) filter (where b.estado in ('pagado', 'usado')),
         coalesce(sum(b.precio_final) filter (where b.estado in ('pagado', 'usado')), 0),
         count(*) filter (where b.estado = 'reservado'),
         coalesce(sum(b.precio_final) filter (where b.estado = 'reservado'), 0)
  from boletos b
  join viajes v on v.id = b.viaje_id
  join rutas r on r.id = v.ruta_id
  join terminales o on o.id = r.origen_id
  join terminales d on d.id = r.destino_id
  where r.empresa_id = (select mi_empresa())
    and (v.salida at time zone 'America/Tegucigalpa')::date between p_desde and p_hasta
  group by o.codigo, d.codigo
  order by 3 desc, 5 desc
$$;
revoke execute on function reporte_ingresos(date, date) from public, anon;
grant execute on function reporte_ingresos(date, date) to authenticated;

-- ── GIVE A LOGIN ACCESS ──────────────────────────────────────
-- First create the login: Authentication → Users → Add user → Create new user
-- (email + password, tick "Auto Confirm User"). Then run, with that email:
--
-- insert into empresa_usuarios (usuario_id, empresa_id)
-- select u.id, e.id from auth.users u, empresas e
-- where u.email = 'gerente@ejemplo.com' and e.nombre = 'Hedman Alas';
