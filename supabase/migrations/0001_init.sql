-- ============================================================================
-- CalendarioMorbido — schema iniziale (MVP)
-- Esegui questo file nel SQL Editor di Supabase (oppure `supabase db push`).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABELLE
-- ----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  region text not null,
  official_url text,
  cover_image_key text,
  start_comune text not null,
  start_provincia text not null,
  end_comune text,
  end_provincia text,
  -- attributi evento (campi pubblici, copiati su events all'approvazione)
  event_type text,
  terrain text,
  distances_km text,
  elevation_gain_m text,
  instagram_url text,
  facebook_url text,
  organizer text,
  circuit text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint proposals_region_chk check (region in (
    'Valle d''Aosta', 'Piemonte', 'Lombardia', 'Trentino-Alto Adige', 'Veneto',
    'Friuli-Venezia Giulia', 'Liguria', 'Emilia-Romagna', 'Toscana', 'Umbria',
    'Marche', 'Lazio', 'Abruzzo', 'Molise', 'Campania', 'Puglia', 'Basilicata',
    'Calabria', 'Sicilia', 'Sardegna')),
  constraint proposals_dates_chk check (end_date >= start_date),
  constraint proposals_event_type_chk check (event_type is null or event_type in (
    'ciclostorica', 'cicloturistica', 'gravel', 'bikepacking', 'mtb', 'randonnee'))
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references public.proposals (id) on delete set null,
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  region text not null,
  official_url text,
  cover_image_key text,
  start_comune text not null,
  start_provincia text not null,
  end_comune text,
  end_provincia text,
  -- attributi evento (campi pubblici)
  event_type text,
  terrain text,
  distances_km text,
  elevation_gain_m text,
  instagram_url text,
  facebook_url text,
  organizer text,
  circuit text,
  -- attributi admin-only (visibili solo al gestore nella pagina evento)
  bike_type text,
  competitive text,
  registration_fee text,
  contact_email text,
  contact_phone text,
  -- solo DB, non mostrato in alcuna UI
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_region_chk check (region in (
    'Valle d''Aosta', 'Piemonte', 'Lombardia', 'Trentino-Alto Adige', 'Veneto',
    'Friuli-Venezia Giulia', 'Liguria', 'Emilia-Romagna', 'Toscana', 'Umbria',
    'Marche', 'Lazio', 'Abruzzo', 'Molise', 'Campania', 'Puglia', 'Basilicata',
    'Calabria', 'Sicilia', 'Sardegna')),
  constraint events_dates_chk check (end_date >= start_date),
  constraint events_event_type_chk check (event_type is null or event_type in (
    'ciclostorica', 'cicloturistica', 'gravel', 'bikepacking', 'mtb', 'randonnee'))
);

create table if not exists public.saved_events (
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create index if not exists events_region_idx on public.events (region);
create index if not exists events_start_date_idx on public.events (start_date);
create index if not exists events_event_type_idx on public.events (event_type);
create index if not exists proposals_user_idx on public.proposals (user_id);
create index if not exists proposals_status_idx on public.proposals (status);

-- ----------------------------------------------------------------------------
-- TRIGGER: crea automaticamente un profilo alla registrazione
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- HELPER: is_admin() — SECURITY DEFINER per evitare la ricorsione RLS
-- (legge profiles bypassando le sue stesse policy)
-- ----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- RPC: approve_proposal — copia atomica proposta -> evento
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
-- RPC: delete_event — cancellazione evento da parte di un gestore.
-- events non ha policy di scrittura lato client; SECURITY DEFINER bypassa la RLS.
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

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.proposals enable row level security;
alter table public.saved_events enable row level security;

-- EVENTS: lettura pubblica; nessuna scrittura lato client (solo via RPC/seed)
drop policy if exists events_select_all on public.events;
create policy events_select_all on public.events
  for select using (true);

-- PROFILES: lettura del proprio profilo o se admin
drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- PROPOSALS
drop policy if exists proposals_insert_own on public.proposals;
create policy proposals_insert_own on public.proposals
  for insert with check (user_id = auth.uid() and status = 'pending');

drop policy if exists proposals_select_owner_or_admin on public.proposals;
create policy proposals_select_owner_or_admin on public.proposals
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists proposals_update_admin on public.proposals;
create policy proposals_update_admin on public.proposals
  for update using (public.is_admin()) with check (public.is_admin());

-- SAVED_EVENTS: CRUD solo del proprietario
drop policy if exists saved_select_own on public.saved_events;
create policy saved_select_own on public.saved_events
  for select using (user_id = auth.uid());

drop policy if exists saved_insert_own on public.saved_events;
create policy saved_insert_own on public.saved_events
  for insert with check (user_id = auth.uid());

drop policy if exists saved_delete_own on public.saved_events;
create policy saved_delete_own on public.saved_events
  for delete using (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- STORAGE: bucket pubblico "covers"
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists covers_read_all on storage.objects;
create policy covers_read_all on storage.objects
  for select using (bucket_id = 'covers');

drop policy if exists covers_insert_auth on storage.objects;
create policy covers_insert_auth on storage.objects
  for insert to authenticated
  with check (bucket_id = 'covers');
