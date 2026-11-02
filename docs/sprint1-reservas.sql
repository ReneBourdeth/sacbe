-- ── SPRINT 1: SAFE BOOKING ───────────────────────────────────
-- Run once in Supabase → SQL Editor → Run.
-- The website can't write to asientos/viajes/boletos directly (RLS),
-- so bookings go through this function, which runs with owner rights
-- and does everything in one transaction.

create or replace function reservar_asiento(
  p_viaje_id        uuid,
  p_asiento_id      uuid,
  p_codigo_qr       text,
  p_nombre_pasajero text,
  p_identidad_pas   text,
  p_es_menor        boolean default false,
  p_tutor_nombre    text    default null,
  p_tutor_identidad text    default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_precio numeric(8,2);
  v_boleto uuid;
begin
  -- Only signed-in users can book, and at most 6 seats per trip each,
  -- so nobody can block a whole bus with a script.
  if auth.uid() is null then
    raise exception 'LOGIN_REQUERIDO';
  end if;
  if (select count(*) from boletos
      where usuario_id = auth.uid() and viaje_id = p_viaje_id
        and estado in ('reservado', 'pagado')) >= 6 then
    raise exception 'LIMITE_ASIENTOS';
  end if;

  if coalesce(trim(p_nombre_pasajero), '') = '' or coalesce(trim(p_identidad_pas), '') = '' then
    raise exception 'DATOS_INCOMPLETOS';
  end if;

  -- Price comes from the DB, never from the browser
  select precio into v_precio
  from viajes
  where id = p_viaje_id and estado = 'programado' and salida > now();
  if v_precio is null then
    raise exception 'VIAJE_NO_DISPONIBLE';
  end if;

  -- Take the seat only if it is still free (row lock prevents double booking)
  update asientos
     set estado = 'reservado'
   where id = p_asiento_id
     and viaje_id = p_viaje_id
     and estado = 'disponible';
  if not found then
    raise exception 'ASIENTO_OCUPADO';
  end if;

  update viajes
     set asientos_disp = asientos_disp - 1
   where id = p_viaje_id;

  insert into boletos (
    usuario_id, viaje_id, asiento_id, codigo_qr,
    nombre_pasajero, identidad_pas, es_menor,
    tutor_nombre, tutor_identidad, precio_final, estado
  ) values (
    auth.uid(),            -- always set: guests are refused above
    p_viaje_id, p_asiento_id, p_codigo_qr,
    trim(p_nombre_pasajero), trim(p_identidad_pas), p_es_menor,
    p_tutor_nombre, p_tutor_identidad, v_precio, 'reservado'
  )
  returning id into v_boleto;

  return v_boleto;
end;
$$;

revoke all on function reservar_asiento(uuid, uuid, text, text, text, boolean, text, text) from public;
grant execute on function reservar_asiento(uuid, uuid, text, text, text, boolean, text, text) to authenticated;  -- guests can't book

-- ── SEVERAL SEATS IN ONE PURCHASE ────────────────────────────
-- Book several seats on one trip in one go (max 6). Runs as a single statement,
-- so it is all-or-nothing: if any seat is already taken, nothing is booked.
-- p_reservas: [{"asiento_id": uuid, "codigo_qr": text, "nombre": text, "identidad": text, "es_menor": bool}, ...]
create or replace function reservar_varios(p_viaje_id uuid, p_reservas jsonb)
returns setof uuid
language plpgsql security definer set search_path = public as $$
declare
  r jsonb;
begin
  if jsonb_typeof(p_reservas) <> 'array' or jsonb_array_length(p_reservas) not between 1 and 6 then
    raise exception 'LIMITE_ASIENTOS';
  end if;
  for r in select * from jsonb_array_elements(p_reservas) loop
    -- reservar_asiento does all the checks (sign-in, 6-per-trip limit, free seat, price)
    return next reservar_asiento(
      p_viaje_id, (r->>'asiento_id')::uuid, r->>'codigo_qr',
      r->>'nombre', r->>'identidad', coalesce((r->>'es_menor')::boolean, false));
  end loop;
end;
$$;
revoke execute on function reservar_varios(uuid, jsonb) from public, anon;
grant execute on function reservar_varios(uuid, jsonb) to authenticated;
