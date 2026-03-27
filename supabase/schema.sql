-- EXTENSIONS
create extension if not exists "uuid-ossp";

-- ENUMS
create type user_role as enum ('admin', 'user');
create type report_status as enum ('pending', 'diproses', 'selesai', 'ditolak');
create type report_priority as enum ('rendah', 'sedang', 'tinggi');

-- PROFILES
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role user_role default 'user',
  created_at timestamp default now()
);

-- CATEGORIES
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp default now()
);

-- CITIES
create table cities (
  id uuid primary key default uuid_generate_v4(),
  name text not null
);

-- DISTRICTS
create table districts (
  id uuid primary key default uuid_generate_v4(),
  city_id uuid references cities(id) on delete cascade,
  name text not null
);

-- REPORTS
create table reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  title text not null,
  description text not null,
  category_id uuid references categories(id),
  city_id uuid references cities(id),
  district_id uuid references districts(id),
  address text,
  is_anonymous boolean default false,
  status report_status default 'pending',
  priority report_priority default 'rendah',
  image_urls text[] default '{}',        -- ← Added: storage URLs from report_attachments bucket
  created_at timestamp default now()
);

-- AI ANALYSIS
create table ai_analysis (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid references reports(id) on delete cascade,
  summary text,
  category_suggestion text,
  priority text,
  suggested_agency text,                 -- ← Added: AI-suggested government agency
  created_at timestamp default now()
);

-- TRIGGER AUTO CREATE PROFILE
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();

-- ======================
-- 🔐 RLS
-- ======================

alter table profiles enable row level security;
alter table reports enable row level security;

-- PROFILES POLICY
create policy "Users can view own profile"
on profiles
for select
using (auth.uid() = id);

create policy "Public can insert profiles"
on profiles
for insert
with check (true);

-- REPORTS POLICY
create policy "Anyone can insert report"
on reports
for insert
with check (true);

create policy "Anyone can view reports"
on reports
for select
using (true);

-- ADMIN POLICY
create policy "Admin can update reports"
on reports
for update
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- ======================
-- 📦 STORAGE
-- ======================

-- Storage bucket: report_attachments (Public)
-- Created via Supabase Dashboard (Storage > New Bucket)
-- Bucket name: report_attachments
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- Storage Policy (run in SQL editor after creating bucket):
-- insert into storage.buckets (id, name, public) values ('report_attachments', 'report_attachments', true);
-- create policy "Public can upload attachments"
--   on storage.objects for insert
--   with check (bucket_id = 'report_attachments');
-- create policy "Public can view attachments"
--   on storage.objects for select
--   using (bucket_id = 'report_attachments');

-- 1. Update Tabel Profiles dengan kolom lengkap & Avatar
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nik varchar(16) UNIQUE,
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES public.cities(id),
ADD COLUMN IF NOT EXISTS district_id uuid REFERENCES public.districts(id),
ADD COLUMN IF NOT EXISTS avatar_url text;

-- 2. Buat Tabel Komentar (Threaded System)
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  report_id uuid REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id)
);

-- 3. Aktifkan Realtime (Pastikan publikasi 'supabase_realtime' sudah ada)
-- Jika error di sini, abaikan dulu dan setting via Dashboard Supabase (Replication)
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;