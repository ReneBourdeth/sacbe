-- ── DATABASE CHECKS ──────────────────────────────────────────
-- Run in Supabase → SQL Editor after ANY database change.
-- It acts as a guest, a passenger and a staff member, checks what each may do,
-- and then undoes everything (rollback), so it never changes real data.
-- Every row must say ok = true.
--
-- Needs: one passenger login, one staff login linked to a company that has a
-- trip tomorrow or later with all 40 seats free, and one other company with tickets.
-- Change the two emails below if yours are different.

begin;
create temp table _pruebas (n serial, prueba text, esperado text, obtenido text) on commit drop;
grant all on _pruebas to anon, authenticated;
grant usage on sequence _pruebas_n_seq to anon, authenticated;

do $$
declare
  pasajero uuid := (select id from auth.users where email = 'rene.bourdeth3@gmail.com');
  staff    uuid := (select id from auth.users where email = 'bourder553@lynchburg.edu');
  empresa  uuid := (select empresa_id from empresa_usuarios where usuario_id = (select id from auth.users where email = 'bourder553@lynchburg.edu'));
  v_viaje  uuid := (select v.id from viajes v join rutas r on r.id = v.ruta_id
                    where r.empresa_id = (select empresa_id from empresa_usuarios where usuario_id = (select id from auth.users where email = 'bourder553@lynchburg.edu'))
                      and v.salida > now() + interval '1 day' and v.asientos_disp = 40 limit 1);
  a   uuid[] := array(select id from asientos where viaje_id = v_viaje order by fila, columna limit 9);
  ids uuid[];
  txt text;
  n   int;

begin
  if pasajero is null or staff is null or v_viaje is null then
    raise exception 'Setup missing: check the two emails and that the staff company has a free trip tomorrow or later';
  end if;

  -- ── Guest (not signed in) ──
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
  begin select count(*)::text into txt from (select 1 from v_viajes_disponibles limit 5) x;
  exception when others then txt := sqlerrm; end;
  insert into _pruebas (prueba, esperado, obtenido) values ('guest can search trips', '5', txt);
  select count(*)::text into txt from boletos;
  insert into _pruebas (prueba, esperado, obtenido) values ('guest sees no tickets', '0', txt);
  begin perform reservar_varios(v_viaje, jsonb_build_array(jsonb_build_object('asiento_id', a[1], 'codigo_qr', 'P-0', 'nombre', 'x', 'identidad', 'x')));
    txt := 'booked';
  exception when others then txt := 'refused'; end;
  insert into _pruebas (prueba, esperado, obtenido) values ('guest cannot book', 'refused', txt);
  reset role;

  -- ── Passenger ──
  perform set_config('request.jwt.claims', json_build_object('sub', pasajero, 'role', 'authenticated')::text, true);
  set local role authenticated;
  ids := array(select reservar_varios(v_viaje, jsonb_build_array(
    jsonb_build_object('asiento_id', a[1], 'codigo_qr', 'P-1', 'nombre', 'Ana', 'identidad', '1'),
    jsonb_build_object('asiento_id', a[2], 'codigo_qr', 'P-2', 'nombre', 'Beto', 'identidad', '2'),
    jsonb_build_object('asiento_id', a[3], 'codigo_qr', 'P-3', 'nombre', 'Caro', 'identidad', '3'))));
  insert into _pruebas (prueba, esperado, obtenido) values ('book 3 seats in one purchase', '3', coalesce(array_length(ids, 1), 0)::text);

  begin perform reservar_varios(v_viaje, jsonb_build_array(
      jsonb_build_object('asiento_id', a[4], 'codigo_qr', 'P-4', 'nombre', 'D', 'identidad', '4'),
      jsonb_build_object('asiento_id', a[1], 'codigo_qr', 'P-5', 'nombre', 'E', 'identidad', '5')));
    txt := 'booked';
  exception when others then txt := sqlerrm; end;
  reset role; select estado into n from (select case when estado = 'disponible' then 1 else 0 end as estado from asientos where id = a[4]) x;
  insert into _pruebas (prueba, esperado, obtenido) values ('taken seat: nothing booked (all or nothing)', 'ASIENTO_OCUPADO, free seat still free', txt || case when n = 1 then ', free seat still free' else ', FREE SEAT WAS BOOKED' end);
  set local role authenticated;

  begin perform reservar_varios(v_viaje, (select jsonb_agg(jsonb_build_object('asiento_id', x, 'codigo_qr', 'X' || x, 'nombre', 'x', 'identidad', 'x')) from unnest(a[3:9]) x));
    txt := 'booked';
  exception when others then txt := sqlerrm; end;
  insert into _pruebas (prueba, esperado, obtenido) values ('7 seats in one purchase', 'LIMITE_ASIENTOS', txt);

  insert into _pruebas (prueba, esperado, obtenido) values ('cancel unpaid ticket: no refund', '0', cancelar_boleto(ids[1])::text);

  reset role; update boletos set estado = 'pagado' where id = ids[2]; set local role authenticated;
  insert into _pruebas (prueba, esperado, obtenido) values ('cancel paid ticket: refund owed', 'more than 0', case when cancelar_boleto(ids[2]) > 0 then 'more than 0' else '0' end);

  begin perform cancelar_boleto(ids[2]); txt := 'cancelled again'; exception when others then txt := sqlerrm; end;
  insert into _pruebas (prueba, esperado, obtenido) values ('cancel the same ticket twice', 'NO_CANCELABLE', txt);
  reset role;

  -- ── Staff ──
  perform set_config('request.jwt.claims', json_build_object('sub', staff, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*)::text into txt from boletos b join viajes v on v.id = b.viaje_id join rutas r on r.id = v.ruta_id where r.empresa_id <> empresa;
  insert into _pruebas (prueba, esperado, obtenido) values ('staff see no other company''s tickets', '0', txt);

  begin perform cancelar_boleto(ids[3]); txt := 'cancelled'; exception when others then txt := sqlerrm; end;
  insert into _pruebas (prueba, esperado, obtenido) values ('staff cannot cancel a passenger''s ticket', 'NO_PERMITIDO', txt);

  perform marcar_reembolsado(ids[2]);
  insert into _pruebas (prueba, esperado, obtenido) values ('staff mark refund paid back', 'ok', 'ok');
  begin perform marcar_reembolsado(ids[2]); txt := 'marked again'; exception when others then txt := sqlerrm; end;
  insert into _pruebas (prueba, esperado, obtenido) values ('mark refund twice', 'NO_PERMITIDO', txt);

  begin perform validar_boleto('P-3'); txt := 'boarded'; exception when others then txt := sqlerrm; end;
  insert into _pruebas (prueba, esperado, obtenido) values ('unpaid ticket cannot board', 'NO_PAGADO', txt);
  perform marcar_boleto_pagado(ids[3]);
  begin perform validar_boleto('P-3'); txt := 'boarded'; exception when others then txt := sqlerrm; end;
  insert into _pruebas (prueba, esperado, obtenido) values ('paid ticket boards', 'boarded', txt);
  begin perform validar_boleto('P-3'); txt := 'boarded'; exception when others then txt := sqlerrm; end;
  insert into _pruebas (prueba, esperado, obtenido) values ('same ticket cannot board twice', 'YA_USADO', txt);

  begin
    insert into viajes (ruta_id, salida, llegada_est, clase, precio)
    select r.id, now() + interval '2 days', now() + interval '2 days 4 hours', 'economica', 100
    from rutas r where r.empresa_id <> empresa limit 1;
    txt := 'created';
  exception when others then txt := 'refused'; end;
  insert into _pruebas (prueba, esperado, obtenido) values ('staff cannot add trips for another company', 'refused', txt);
  reset role;
end $$;

reset role;
select n, prueba, esperado, obtenido, esperado = obtenido as ok from _pruebas order by n;
rollback;
