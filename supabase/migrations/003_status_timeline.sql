-- ============================================================
-- Migration 003: Status Timeline & Realtime Setup
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Pastikan kolom priority_score & vote_count & similar_count ada
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS similar_count  INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vote_count     INTEGER DEFAULT 0;

-- 2. Tabel report_votes (jika belum ada dari Phase 0)
CREATE TABLE IF NOT EXISTS public.report_votes (
  id          UUID NOT NULL DEFAULT uuid_generate_v4(),
  report_id   UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT report_votes_pkey    PRIMARY KEY (id),
  CONSTRAINT report_votes_unique  UNIQUE (report_id, user_id)
);

ALTER TABLE public.report_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Public read votes"
  ON public.report_votes FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can vote"
  ON public.report_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own vote"
  ON public.report_votes FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Tabel report_status_logs (buat jika belum ada)
CREATE TABLE IF NOT EXISTS public.report_status_logs (
  id          UUID NOT NULL DEFAULT uuid_generate_v4(),
  report_id   UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  note        TEXT,
  changed_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT report_status_logs_pkey PRIMARY KEY (id)
);

ALTER TABLE public.report_status_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Public can read status logs"
  ON public.report_status_logs FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Only admins can insert status logs"
  ON public.report_status_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Seed: tambahkan log awal untuk laporan yang sudah ada
-- (status "pending" sebagai starting point)
INSERT INTO public.report_status_logs (report_id, status, note)
SELECT id, 'pending', 'Laporan awal diterima sistem'
FROM public.reports
WHERE id NOT IN (
  SELECT DISTINCT report_id FROM public.report_status_logs
);

-- 5. Aktifkan Realtime untuk report_status_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.report_status_logs;
