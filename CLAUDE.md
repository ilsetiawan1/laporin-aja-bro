# CLAUDE.md — Laporin Aja Bro

## 🧠 Role
You are a Senior Fullstack Engineer (Next.js 15 + Supabase) working on a competition project.
Always write clean, modular, production-ready TypeScript code.

---

## 🎯 Project Overview
**"Laporin Aja Bro"** — Platform pelaporan fasilitas publik berbasis web.
Dibangun untuk kompetisi **TechSprint IT 2026**.

---

## ✅ What's Already Done (DO NOT rewrite unless asked)
- Supabase Auth (sign up / login / logout)
- Tabel: `profiles`, `reports`, `comments`, `categories`, `cities`, `districts`, `ai_analysis`, `report_attachments`
- Middleware auth redirect
- Basic report creation form
- Basic comment & reply system

## ❌ What's NOT Yet Done (needs to be built)
- `lib/services/` and `lib/repositories/` layer (Supabase queries masih di komponen)
- Tabel: `report_votes`, `report_status_logs`
- Kolom baru: `reports.priority_score` (integer), `reports.similar_count` (integer)
- Vote system
- Auto-kategorisasi (rule-based)
- Deteksi laporan mirip
- Status timeline
- Admin dashboard
- Realtime updates

---

## 🗂️ Folder Structure (Target)
```
app/
  (auth)/          → login, register
  (user)/          → dashboard user, buat laporan, detail laporan
  (admin)/         → dashboard admin
  api/             → route handlers jika diperlukan
components/
  ui/              → reusable UI primitives
  reports/         → komponen terkait laporan
  comments/        → komponen terkait komentar
  admin/           → komponen admin
lib/
  supabase.ts      → Supabase client (SUDAH ADA)
  services/
    reportService.ts
    commentService.ts
    userService.ts
    voteService.ts
  repositories/
    reportRepository.ts
    commentRepository.ts
    voteRepository.ts
  utils/
    autoCategorize.ts
    priorityCalculator.ts
types/
  index.ts         → semua TypeScript types/interfaces
supabase/
  migrations/      → SQL migration files
```

---

## 🎨 Design System (Tailwind Custom Colors)
| Token | Hex | Usage |
|-------|-----|-------|
| `navy` | #0F172A | Text & Heading |
| `blue` | #1E40AF | Buttons & Primary Actions |
| `orange` | #F97316 | Accent / Badge / Highlight |
| `red` | #EF4444 | Errors & Alerts ONLY |
| `bg` | #F8FAFC | Page Background |

**Rules:**
- `bg-bg` → halaman background
- `text-navy` → teks utama
- `bg-blue text-white` → tombol primary
- `text-orange` → badge, emphasis
- **NEVER** red text on red background
- Mobile-first, clean, minimal

---

## 🔐 Auth & Role Rules
- Sign up → Supabase Auth → trigger `handle_new_user` → insert `profiles`
- Roles: `admin` | `user` (default: `user`)
- Redirect setelah login:
  - admin → `/admin/dashboard`
  - user → `/user/dashboard`
- Semua mutasi DB → gunakan **Server Actions**
- Selalu hormati **RLS** Supabase

---

## 🗄️ Database Rules
- **JANGAN** query Supabase langsung di komponen UI
- Semua akses data → lewat `lib/services/`
- Services memanggil `lib/repositories/`
- Repositories adalah satu-satunya layer yang boleh import Supabase client

---

## 📊 Priority Score Logic
```
priority_score = vote_count + similar_count

0–5   → "rendah"
6–15  → "sedang"
> 15  → "tinggi"
```
Update otomatis via Supabase Function/trigger ATAU di service layer setiap ada vote/laporan mirip baru.

---

## 🤖 Auto-Kategorisasi (Rule-Based)
```typescript
// lib/utils/autoCategorize.ts
const RULES = [
  { keywords: ["jalan", "berlubang", "aspal", "trotoar"], category: "Infrastruktur" },
  { keywords: ["sampah", "bau", "limbah", "kotor"], category: "Lingkungan" },
  { keywords: ["lampu", "listrik", "penerangan"], category: "Utilitas" },
  { keywords: ["air", "banjir", "drainase", "selokan"], category: "Sanitasi" },
  { keywords: ["taman", "pohon", "ruang hijau"], category: "Taman & RTH" },
];
```
Cek `title + description` (lowercase). Return `category_id` dari DB.

---

## ⚡ Realtime (Supabase)
Gunakan `supabase.channel()` untuk:
- `reports` → INSERT (halaman publik)
- `comments` → INSERT (detail laporan)
- `reports` → UPDATE status (timeline)

---

## ✅ Acceptance Criteria per Fitur
Setiap fitur dianggap selesai jika:
1. Ada SQL migration (jika perlu perubahan DB)
2. Ada repository function
3. Ada service function
4. Ada komponen UI yang menggunakannya
5. RLS sudah dikonfigurasi
6. Tidak ada query Supabase di komponen UI

---

## ⚙️ Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
- Akses via `process.env`
- JANGAN hardcode
- Client di `lib/supabase.ts`

---

## 🚫 Avoid
- Query Supabase langsung di komponen
- `any` type di TypeScript
- Nested ternary > 2 level
- External AI API (openai, gemini, dll)
- Overengineering — kompetisi butuh demo yang jalan, bukan arsitektur sempurna

---

## 📝 Code Style
- Functional components only
- TypeScript strict
- Server Actions untuk mutasi
- `async/await` (bukan `.then()`)
- Error handling dengan `try/catch`
- Export named functions (bukan default untuk services/repositories)