-- =============================================================================
-- Formby — initial schema
-- Applied: 2026-03-21
--
-- Notes on manual steps taken before running this migration:
--   - public.profiles table already existed (created by Supabase default setup)
--   - on_auth_user_created trigger already existed and was left in place
--   - profiles RLS policies were already present
--   - Ran backfill manually to cover existing auth.users rows:
--       insert into public.profiles (id, email)
--       select id, email from auth.users
--       on conflict (id) do nothing;
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

create table public.forms (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  name        text        not null,
  description text        not null default '',
  fields      jsonb       not null default '[]',
  published   boolean     not null default false,
  webhook_url text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.submissions (
  id         uuid        primary key default gen_random_uuid(),
  form_id    uuid        not null references public.forms(id) on delete cascade,
  data       jsonb       not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------

create index on public.forms (user_id);
create index on public.submissions (form_id);

-- ---------------------------------------------------------------------------
-- TRIGGER: updated_at on forms
-- ---------------------------------------------------------------------------

create or replace function public.set_forms_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_forms_updated
  before update on public.forms
  for each row
  execute procedure public.set_forms_updated_at();

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

alter table public.forms       enable row level security;
alter table public.submissions enable row level security;

-- forms: owner full access
create policy "forms: owner can select"
  on public.forms for select
  using (auth.uid() = user_id);

create policy "forms: owner can insert"
  on public.forms for insert
  with check (auth.uid() = user_id);

create policy "forms: owner can update"
  on public.forms for update
  using (auth.uid() = user_id);

create policy "forms: owner can delete"
  on public.forms for delete
  using (auth.uid() = user_id);

-- forms: public (anon) can read published forms (needed for embed endpoint)
create policy "forms: public can select published"
  on public.forms for select
  using (published = true);

-- submissions: form owner can read submissions for their forms
create policy "submissions: owner can select"
  on public.submissions for select
  using (
    exists (
      select 1 from public.forms f
      where f.id = form_id
        and f.user_id = auth.uid()
    )
  );

-- submissions: anyone (anon) can insert on published forms only
create policy "submissions: anon can insert on published forms"
  on public.submissions for insert
  with check (
    exists (
      select 1 from public.forms f
      where f.id = form_id
        and f.published = true
    )
  );
