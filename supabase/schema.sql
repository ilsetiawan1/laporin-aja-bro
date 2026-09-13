-- ============================================================
-- MASTER DATABASE SCHEMA — LAPORIN AJA BRO
-- Platform Pelaporan Fasilitas & Layanan Publik DIY
-- Target Database: PostgreSQL 15+ (Supabase)
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CUSTOM ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE report_status AS ENUM ('pending', 'diproses', 'selesai', 'ditolak');
CREATE TYPE report_priority AS ENUM ('rendah', 'sedang', 'tinggi');

-- 3. MASTER DATA WILAYAH & KATEGORI
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

-- 4. PROFILES (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role user_role DEFAULT 'user',
  nik VARCHAR(16) UNIQUE,
  full_name TEXT,
  phone_number TEXT UNIQUE,
  gender TEXT,
  birth_date DATE,
  city_id UUID REFERENCES public.cities(id),
  district_id UUID REFERENCES public.districts(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. REPORTS (Main Complaint Entity)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  city_id UUID NOT NULL REFERENCES public.cities(id),
  district_id UUID REFERENCES public.districts(id),
  address TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  status report_status DEFAULT 'pending',
  priority report_priority DEFAULT 'rendah',
  priority_score INTEGER DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  similar_count INTEGER DEFAULT 0,
  image_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. REPORT ATTACHMENTS (File Attachment Details)
CREATE TABLE IF NOT EXISTS public.report_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. REPORT VOTES (Community Urgency Upvoting)
CREATE TABLE IF NOT EXISTS public.report_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT report_votes_unique UNIQUE (report_id, user_id)
);

-- 8. REPORT STATUS LOGS (Audit Trail & Timeline)
CREATE TABLE IF NOT EXISTS public.report_status_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. COMMENTS (Threaded Discussion System)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. AI ANALYSIS (AI-Assisted Classification & Summarization)
CREATE TABLE IF NOT EXISTS public.ai_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  summary TEXT,
  category_suggestion TEXT,
  priority TEXT,
  suggested_agency TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ⚡ TRIGGERS & FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- 🔐 ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;

-- PROFILES RLS
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Public can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- REPORTS RLS
CREATE POLICY "Anyone can view reports" ON public.reports
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert report" ON public.reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update reports" ON public.reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- REPORT VOTES RLS
CREATE POLICY "Public read votes" ON public.report_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.report_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vote" ON public.report_votes
  FOR DELETE USING (auth.uid() = user_id);

-- REPORT STATUS LOGS RLS
CREATE POLICY "Public can read status logs" ON public.report_status_logs
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert status logs" ON public.report_status_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- COMMENTS RLS
CREATE POLICY "Public can read comments" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 📦 STORAGE BUCKET SPECIFICATIONS
-- ============================================================
-- Bucket 1: report_attachments (Public, max 5MB, image MIME types)
-- Bucket 2: avatars (Public, max 2MB, image MIME types)