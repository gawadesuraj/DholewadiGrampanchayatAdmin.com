
---

# supabase/schema.sql
```sql
-- Tables for the Admin Portal

create table if not exists public.news (
  id bigserial primary key,
  title text not null,
  summary text,
  content text,
  image_url text,
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.grievances (
  id bigserial primary key,
  name text not null,
  phone text,
  email text,
  subject text not null,
  description text,
  status text default 'new',
  assigned_to uuid,
  internal_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.photos (
  id bigserial primary key,
  image_url text not null,
  alt_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.events (
  id bigserial primary key,
  title text not null,
  subtitle text,
  description text,
  content text,
  image_url text,
  date date not null,
  time time,
  venue text,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Basic RLS policies (adjust as needed)
alter table public.news enable row level security;
alter table public.grievances enable row level security;
alter table public.photos enable row level security;
alter table public.events enable row level security;

-- Allow authenticated users full access for now (tighten later)
create policy "news_read" on public.news for select using (true);
create policy "news_write" on public.news for all using (auth.role() = 'authenticated');

create policy "grievances_read" on public.grievances for select using (auth.role() = 'authenticated');
create policy "grievances_write" on public.grievances for all using (auth.role() = 'authenticated');

create policy "photos_read" on public.photos for select using (true);
-- Allow authenticated users to insert/update/delete photos
create policy "photos_write" on public.photos for all using (auth.uid() is not null);

-- Allow public read access for photos (for frontend gallery)
create policy "photos_public_read" on public.photos for select using (true);

create policy "events_read" on public.events for select using (true);
create policy "events_write" on public.events for all using (auth.role() = 'authenticated');

-- Trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists news_set_updated_at on public.news;
create trigger news_set_updated_at before update on public.news
for each row execute function public.set_updated_at();

drop trigger if exists grv_set_updated_at on public.grievances;
create trigger grv_set_updated_at before update on public.grievances
for each row execute function public.set_updated_at();

drop trigger if exists photos_set_updated_at on public.photos;
create trigger photos_set_updated_at before update on public.photos
for each row execute function public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at before update on public.events
for each row execute function public.set_updated_at();
