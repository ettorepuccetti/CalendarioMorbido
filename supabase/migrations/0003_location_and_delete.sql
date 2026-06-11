-- ============================================================================
-- CalendarioMorbido — migrazione 0003
-- Per istanze GIÀ deployate (chi parte da zero usa 0001+0002 aggiornati).
--   1. Luogo: rimuove le coordinate, sostituisce *_location_name con comune+provincia.
--   2. Aggiorna la RPC approve_proposal alla nuova lista colonne.
--   3. Aggiunge la RPC delete_event (cancellazione evento da parte del gestore).
-- Esegui nel SQL Editor di Supabase.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SCHEMA: events e proposals
-- ----------------------------------------------------------------------------

-- proposals
alter table public.proposals drop column if exists start_lat;
alter table public.proposals drop column if exists start_lng;
alter table public.proposals drop column if exists end_lat;
alter table public.proposals drop column if exists end_lng;

alter table public.proposals add column if not exists start_comune text;
alter table public.proposals add column if not exists start_provincia text;
alter table public.proposals add column if not exists end_comune text;
alter table public.proposals add column if not exists end_provincia text;

-- migra i dati esistenti dal vecchio campo testo, poi rendi NOT NULL
-- (solo se la vecchia colonna esiste — su DB nuovi 0001 ha già il nuovo schema)
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'proposals' and column_name = 'start_location_name'
  ) then
    update public.proposals
      set start_comune = coalesce(start_comune, start_location_name, '—'),
          start_provincia = coalesce(start_provincia, '—'),
          end_comune = coalesce(end_comune, end_location_name)
      where start_comune is null or start_provincia is null;
  end if;
end $$;

alter table public.proposals alter column start_comune set not null;
alter table public.proposals alter column start_provincia set not null;
alter table public.proposals drop column if exists start_location_name;
alter table public.proposals drop column if exists end_location_name;

-- events
alter table public.events drop column if exists start_lat;
alter table public.events drop column if exists start_lng;
alter table public.events drop column if exists end_lat;
alter table public.events drop column if exists end_lng;

alter table public.events add column if not exists start_comune text;
alter table public.events add column if not exists start_provincia text;
alter table public.events add column if not exists end_comune text;
alter table public.events add column if not exists end_provincia text;

do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'start_location_name'
  ) then
    update public.events
      set start_comune = coalesce(start_comune, start_location_name, '—'),
          start_provincia = coalesce(start_provincia, '—'),
          end_comune = coalesce(end_comune, end_location_name)
      where start_comune is null or start_provincia is null;
  end if;
end $$;

alter table public.events alter column start_comune set not null;
alter table public.events alter column start_provincia set not null;
alter table public.events drop column if exists start_location_name;
alter table public.events drop column if exists end_location_name;

-- ----------------------------------------------------------------------------
-- 2. RPC approve_proposal aggiornata
-- ----------------------------------------------------------------------------

create or replace function public.approve_proposal(p_proposal_id uuid)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_event_id uuid;
  v_p public.proposals%rowtype;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select * into v_p from public.proposals
  where id = p_proposal_id
  for update;

  if not found then
    raise exception 'proposal not found';
  end if;
  if v_p.status <> 'pending' then
    raise exception 'proposal not pending';
  end if;

  insert into public.events (
    proposal_id, title, description, start_date, end_date, region, official_url,
    cover_image_key, start_comune, start_provincia, end_comune, end_provincia)
  values (
    v_p.id, v_p.title, v_p.description, v_p.start_date, v_p.end_date, v_p.region,
    v_p.official_url, v_p.cover_image_key, v_p.start_comune, v_p.start_provincia,
    v_p.end_comune, v_p.end_provincia)
  returning id into v_event_id;

  update public.proposals
  set status = 'approved', reviewed_at = now()
  where id = v_p.id;

  return v_event_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 3. RPC delete_event — cancellazione evento da parte di un gestore.
-- La FK saved_events.event_id è ON DELETE CASCADE → spariscono anche i salvataggi.
-- ----------------------------------------------------------------------------

create or replace function public.delete_event(p_event_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  delete from public.events where id = p_event_id;
end;
$$;
