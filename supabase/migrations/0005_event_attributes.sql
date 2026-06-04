-- ============================================================================
-- CalendarioMorbido — migrazione 0005
-- Nuovi attributi evento ricavati da docs/events-research/cycling-events-2026.csv.
-- Per istanze GIÀ deployate (chi parte da zero usa 0001+0002 aggiornati).
--
-- Destinazioni decise per il MVP:
--   • Filtro home + form + dettaglio : event_type
--   • Dettaglio pubblico + form      : terrain, distances_km, elevation_gain_m,
--                                      instagram_url, facebook_url, organizer, circuit
--   • Solo admin (pagina evento)     : bike_type, competitive, registration_fee,
--                                      contact_email, contact_phone
--   • Solo DB, non mostrato          : source
--
-- I campi pubblici stanno su proposals + events (li compila l'utente e li copia
-- approve_proposal). I campi admin-only e source stanno solo su events: li
-- arricchisce il gestore (update_event) o l'import del CSV.
-- Esegui nel SQL Editor di Supabase.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SCHEMA: campi pubblici su proposals
-- ----------------------------------------------------------------------------

alter table public.proposals add column if not exists event_type text;
alter table public.proposals add column if not exists terrain text;
alter table public.proposals add column if not exists distances_km text;
alter table public.proposals add column if not exists elevation_gain_m text;
alter table public.proposals add column if not exists instagram_url text;
alter table public.proposals add column if not exists facebook_url text;
alter table public.proposals add column if not exists organizer text;
alter table public.proposals add column if not exists circuit text;

-- ----------------------------------------------------------------------------
-- 2. SCHEMA: campi pubblici + admin-only + source su events
-- ----------------------------------------------------------------------------

alter table public.events add column if not exists event_type text;
alter table public.events add column if not exists terrain text;
alter table public.events add column if not exists distances_km text;
alter table public.events add column if not exists elevation_gain_m text;
alter table public.events add column if not exists instagram_url text;
alter table public.events add column if not exists facebook_url text;
alter table public.events add column if not exists organizer text;
alter table public.events add column if not exists circuit text;
-- admin-only
alter table public.events add column if not exists bike_type text;
alter table public.events add column if not exists competitive text;
alter table public.events add column if not exists registration_fee text;
alter table public.events add column if not exists contact_email text;
alter table public.events add column if not exists contact_phone text;
-- solo DB, non mostrato
alter table public.events add column if not exists source text;

create index if not exists events_event_type_idx on public.events (event_type);

-- CHECK su event_type: vincolato alle categorie canoniche (vedi
-- src/lib/constants/event-types.ts). NULL ammesso (campo opzionale).
-- drop+add per idempotenza (i constraint non supportano IF NOT EXISTS).
alter table public.proposals drop constraint if exists proposals_event_type_chk;
alter table public.proposals add constraint proposals_event_type_chk
  check (event_type is null or event_type in (
    'ciclostorica', 'cicloturistica', 'gravel', 'bikepacking', 'mtb', 'randonnee'));

alter table public.events drop constraint if exists events_event_type_chk;
alter table public.events add constraint events_event_type_chk
  check (event_type is null or event_type in (
    'ciclostorica', 'cicloturistica', 'gravel', 'bikepacking', 'mtb', 'randonnee'));

-- ----------------------------------------------------------------------------
-- 3. RPC approve_proposal aggiornata (copia i campi pubblici; i campi admin
--    restano null e li compila poi il gestore)
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
    cover_image_key, start_comune, start_provincia, end_comune, end_provincia,
    event_type, terrain, distances_km, elevation_gain_m,
    instagram_url, facebook_url, organizer, circuit)
  values (
    v_p.id, v_p.title, v_p.description, v_p.start_date, v_p.end_date, v_p.region,
    v_p.official_url, v_p.cover_image_key, v_p.start_comune, v_p.start_provincia,
    v_p.end_comune, v_p.end_provincia,
    v_p.event_type, v_p.terrain, v_p.distances_km, v_p.elevation_gain_m,
    v_p.instagram_url, v_p.facebook_url, v_p.organizer, v_p.circuit)
  returning id into v_event_id;

  update public.proposals
  set status = 'approved', reviewed_at = now()
  where id = v_p.id;

  return v_event_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. RPC update_event aggiornata: il gestore edita tutti i campi (pubblici +
--    admin-only). `source` NON è editabile (solo DB) → non viene toccato, così
--    resta il valore di provenienza impostato dall'import.
--    Il form di modifica gestore passa SEMPRE tutti questi campi: nessun rischio
--    di azzeramento. La vecchia firma a 12 argomenti va eliminata prima di
--    ricrearla (firma diversa = nuova funzione, non un replace).
-- ----------------------------------------------------------------------------

drop function if exists public.update_event(
  uuid, text, text, date, date, text, text, text, text, text, text, text);

create or replace function public.update_event(
  p_event_id uuid,
  p_title text,
  p_description text,
  p_start_date date,
  p_end_date date,
  p_region text,
  p_official_url text,
  p_cover_image_key text,
  p_start_comune text,
  p_start_provincia text,
  p_end_comune text,
  p_end_provincia text,
  p_event_type text,
  p_terrain text,
  p_distances_km text,
  p_elevation_gain_m text,
  p_instagram_url text,
  p_facebook_url text,
  p_organizer text,
  p_circuit text,
  p_bike_type text,
  p_competitive text,
  p_registration_fee text,
  p_contact_email text,
  p_contact_phone text
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  update public.events set
    title = p_title,
    description = p_description,
    start_date = p_start_date,
    end_date = p_end_date,
    region = p_region,
    official_url = p_official_url,
    cover_image_key = p_cover_image_key,
    start_comune = p_start_comune,
    start_provincia = p_start_provincia,
    end_comune = p_end_comune,
    end_provincia = p_end_provincia,
    event_type = p_event_type,
    terrain = p_terrain,
    distances_km = p_distances_km,
    elevation_gain_m = p_elevation_gain_m,
    instagram_url = p_instagram_url,
    facebook_url = p_facebook_url,
    organizer = p_organizer,
    circuit = p_circuit,
    bike_type = p_bike_type,
    competitive = p_competitive,
    registration_fee = p_registration_fee,
    contact_email = p_contact_email,
    contact_phone = p_contact_phone,
    updated_at = now()
  where id = p_event_id;
end;
$$;
