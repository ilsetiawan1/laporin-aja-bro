# 🗂️ Database Schema — Laporin Aja Bro

> **Sync Status:** Up to date as of 2026-03-27

---

## 👤 `profiles`

Stores user data and roles. Auto-created via trigger on `auth.users`.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK → `auth.users.id` |
| email | text | |
| role | enum | `admin` \| `user` (default: `user`) |
| created_at | timestamp | |

---

## 🏷️ `categories`

List of complaint categories (seeded manually).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | e.g. "Infrastruktur", "Sampah" |
| created_at | timestamp | |

---

## 🏙️ `cities`

Stores regency/city in DIY (Daerah Istimewa Yogyakarta).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | e.g. "Kota Yogyakarta", "Sleman" |

---

## 🏘️ `districts`

Stores kecamatan, linked to a city.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| city_id | uuid | FK → `cities.id` |
| name | text | e.g. "Gondokusuman" |

---

## 📝 `reports`

Main complaint/report data.

| Column | Type | Notes |
| Column | Type | Notes | Default | Description | FK |
|--------|------|-------|---------|-------------|----|
| id | uuid | PK | | | |
| user_id | uuid | FK → `profiles.id` (nullable for anonymous) | | | `profiles(id)` |
| title | text | Required | | | |
| description | text | Required | | | |
| category_id | uuid | FK → `categories.id` | | | `categories(id)` |
| city_id | uuid | FK → `cities.id` | | | `cities(id)` |
| district_id | uuid | FK → `districts.id` (optional) | | Kecamatan | `districts(id)` |
| address | text | Free-text address (optional) | | Alamat lengkap spesifik | |
| is_anonymous | boolean | | `false` | Status anonimitas pelapor | |
| status | enum | `pending` \| `diproses` \| `selesai` \| `ditolak` | `'pending'` | | |
| priority | enum | `rendah` \| `sedang` \| `tinggi` | `'rendah'` | | |
| image_urls | text[] | **Array of Supabase Storage URLs** — bucket: `report_attachments` | `'{}'` | Array string URL gambar lampiran | |
| created_at | timestamp | | `now()` | Waktu laporan dibuat | |

> **Note:** `image_urls` column added via:
> ```sql
> ALTER TABLE public.reports ADD COLUMN image_urls text[] DEFAULT '{}';
> ```

---

## 🤖 `ai_analysis`

AI-generated analysis stored after report submission.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| report_id | uuid | FK → `reports.id` |
| summary | text | AI summary of the report |
| category_suggestion | text | AI-suggested category |
| priority | text | AI-assessed priority level |
| suggested_agency | text | Government agency to handle it |
| created_at | timestamp | |

---

## 🔐 Security (RLS)

Row Level Security is enabled on `profiles` and `reports`.

| Table | Policy | Rule |
|-------|--------|------|
| profiles | SELECT | User can view own profile (`auth.uid() = id`) |
| profiles | INSERT | Public can insert (for trigger) |
| reports | INSERT | Anyone can insert |
| reports | SELECT | Anyone can view (public reports) |
| reports | UPDATE | Admin only |

---

## 📦 Storage Bucket

| Bucket | Visibility | Max Size | MIME Types |
|--------|-----------|----------|------------|
| `report_attachments` | **Public** | 5MB | image/jpeg, image/png, image/webp, image/gif |

Files are uploaded from the client using the Supabase JS client with the anon key.
Public URLs are stored in `reports.image_urls[]`.

---

## 🔗 Relationships

```
auth.users
    └── profiles
            └── reports
                    ├── categories
                    ├── cities
                    │       └── districts
                    └── ai_analysis

Storage: report_attachments bucket → reports.image_urls[]
```