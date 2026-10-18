-- ── DEMO TRIPS ───────────────────────────────────────────────
-- Fake trips for testing: every day for the next 30 days, 4 departures a day,
-- on 7 routes in both directions. Seats are created automatically by the
-- trigger in docs/asientos-trigger.sql.
-- Run in Supabase → SQL Editor. Safe to run again: it only adds what is missing,
-- so re-running later extends the trips another 30 days from that day.

-- 1) Routes (company, from, to, minutes, base price in lempiras)
insert into rutas (empresa_id, origen_id, destino_id, duracion_min, precio_base)
select e.id, o.id, d.id, r.minutos, r.precio
from (values
  ('Hedman Alas',    'SPS', 'TGU', 270, 380),
  ('Viana',          'SPS', 'TGU', 270, 340),
  ('El Rey Express', 'SPS', 'CEI', 180, 250),
  ('Cotuc',          'SPS', 'CPN', 180, 300),
  ('Saenz',          'TGU', 'CHO', 150, 200),
  ('El Rey Express', 'TGU', 'CMG',  90, 120),
  ('Viana',          'SPS', 'CMG', 150, 180)
) as r(empresa, desde, hasta, minutos, precio)
join empresas e on e.nombre = r.empresa
-- each route in both directions
cross join lateral (values (r.desde, r.hasta), (r.hasta, r.desde)) as sentido(a, b)
join terminales o on o.codigo = sentido.a
join terminales d on d.codigo = sentido.b
on conflict (empresa_id, origen_id, destino_id) do nothing;

-- 2) Trips: 06:00, 10:00, 14:00, 18:00 Honduras time, a different class each slot
insert into viajes (ruta_id, salida, llegada_est, clase, precio)
select
  r.id,
  salida,
  salida + make_interval(mins => r.duracion_min),
  h.clase,
  round(r.precio_base * h.factor)
from rutas r
cross join generate_series(
  (now() at time zone 'America/Tegucigalpa')::date,
  (now() at time zone 'America/Tegucigalpa')::date + 30,   -- 30 days keeps the seat count reasonable (~70k seats)
  interval '1 day'
) as dia
cross join (values
  ('06:00'::time, 'economica', 1.0),
  ('10:00'::time, 'ejecutivo', 1.3),
  ('14:00'::time, 'economica', 1.0),
  ('18:00'::time, 'primera',   1.7)
) as h(hora, clase, factor)
cross join lateral (select (dia::date + h.hora) at time zone 'America/Tegucigalpa' as salida) s
where r.activa
  and s.salida > now()                                   -- no trips in the past
  and not exists (select 1 from viajes v where v.ruta_id = r.id and v.salida = s.salida);

-- 3) Quick check: trips per day for the next week
select (salida at time zone 'America/Tegucigalpa')::date as dia, count(*) as viajes
from viajes
where salida > now()
group by 1 order by 1
limit 7;
