-- ── AUTO-CREATE SEATS FOR NEW TRIPS ──────────────────────────
-- Run once in Supabase → SQL Editor.
-- Every new row in `viajes` gets its seats generated automatically:
-- rows of 4 (A B | C D), A/D = ventana, B/C = pasillo.

create or replace function crear_asientos_viaje()
returns trigger
language plpgsql
as $$
declare
  f int;
  c text;
begin
  for f in 1..ceil(new.capacidad / 4.0)::int loop
    foreach c in array array['A','B','C','D'] loop
      exit when (f - 1) * 4 + array_position(array['A','B','C','D'], c) > new.capacidad;
      insert into asientos (viaje_id, numero, fila, columna, tipo)
      values (
        new.id,
        f || c,
        f,
        c,
        case when c in ('A','D') then 'ventana' else 'pasillo' end
      );
    end loop;
  end loop;
  return new;
end;
$$;

drop trigger if exists trg_crear_asientos on viajes;
create trigger trg_crear_asientos
  after insert on viajes
  for each row execute function crear_asientos_viaje();

-- Backfill: trips that already exist but have no seats
insert into asientos (viaje_id, numero, fila, columna, tipo)
select v.id, f || c, f, c, case when c in ('A','D') then 'ventana' else 'pasillo' end
from viajes v
cross join generate_series(1, ceil(v.capacidad / 4.0)::int) as f
cross join unnest(array['A','B','C','D']) as c
where not exists (select 1 from asientos a where a.viaje_id = v.id)
on conflict (viaje_id, numero) do nothing;
