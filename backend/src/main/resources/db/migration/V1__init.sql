-- CalendarioMorbido — schema iniziale backend Quarkus
-- Questa migration è indipendente da Supabase: nessun riferimento a auth.* o storage.*
-- L'autenticazione è gestita da Keycloak; lo user_id è il subject UUID del JWT.

create table if not exists profiles (
  id uuid primary key,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
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
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint proposals_dates_chk check (end_date >= start_date)
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references proposals (id) on delete set null,
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_dates_chk check (end_date >= start_date)
);

create table if not exists saved_events (
  user_id uuid not null,
  event_id uuid not null references events (id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create index if not exists events_region_idx on events (region);
create index if not exists events_start_date_idx on events (start_date);
create index if not exists proposals_user_idx on proposals (user_id);
create index if not exists proposals_status_idx on proposals (status);
