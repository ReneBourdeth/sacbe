-- ── CANCELLATIONS & REFUNDS ──────────────────────────────────
-- Run in Supabase → SQL Editor (after panel-empresa.sql, it uses mi_empresa()).

-- Refund bookkeeping on tickets: how much is owed after a cancel, and when it was paid back
alter table boletos
  add column if not exists reembolso numeric(8,2),
  add column if not exists reembolsado_at timestamptz;

-- Passenger cancels their own ticket before departure. The seat goes back on sale.
-- A paid ticket records the refund owed (the company pays it back); returns that amount.
create or replace function cancelar_boleto(p_boleto_id uuid) returns numeric
language plpgsql security definer set search_path = public as $$
declare
  b boletos%rowtype;
  v_reembolso numeric(8,2);
begin
  select * into b from boletos where id = p_boleto_id and usuario_id = auth.uid() for update;
  if not found then raise exception 'NO_PERMITIDO'; end if;
  if b.estado not in ('reservado', 'pagado') then raise exception 'NO_CANCELABLE'; end if;
  if (select salida from viajes where id = b.viaje_id) <= now() then raise exception 'YA_SALIO'; end if;

  v_reembolso := case when b.estado = 'pagado' then b.precio_final end;
  update boletos set estado = 'cancelado', reembolso = v_reembolso where id = b.id;
  update asientos set estado = 'disponible' where id = b.asiento_id;
  update viajes set asientos_disp = asientos_disp + 1 where id = b.viaje_id;
  return coalesce(v_reembolso, 0);
end;
$$;
revoke execute on function cancelar_boleto(uuid) from public, anon;
grant execute on function cancelar_boleto(uuid) to authenticated;

-- Staff confirm they paid a refund back, for their own company's tickets only.
create or replace function marcar_reembolsado(p_boleto_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update boletos b set reembolsado_at = now()
   from viajes v join rutas r on r.id = v.ruta_id
  where b.id = p_boleto_id and v.id = b.viaje_id
    and r.empresa_id = mi_empresa()
    and b.estado = 'cancelado' and b.reembolso > 0 and b.reembolsado_at is null;
  if not found then raise exception 'NO_PERMITIDO'; end if;
end;
$$;
revoke execute on function marcar_reembolsado(uuid) from public, anon;
grant execute on function marcar_reembolsado(uuid) to authenticated;
