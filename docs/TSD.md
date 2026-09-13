# Technical Specifications Document (TSD) — Laporin Aja Bro

> **Dokumen Kontrol:**
> * **Nama Proyek:** Laporin Aja Bro (Platform Pelaporan Fasilitas & Layanan Publik DIY)
> * **Penulis / Pengembang:** Muhammad Ilham Setiawan
> * **Versi Dokumen:** v1.0
> * **Status Implementasi:** Selesai & Terimplementasi di Production
> * **URL Produksi:** [https://laporin-aja-bro.vercel.app](https://laporin-aja-bro.vercel.app)
> * **Target Lingkungan:** Vercel Edge/Serverless (Next.js 16) + Supabase (PostgreSQL 15+, Auth, Storage, RLS)

---

## 1. Arsitektur Sistem Tingkat Tinggi (*High-Level Architecture*)

Sistem dibangun menggunakan **Next.js 16 App Router** dengan pendekatan **Clean Layered Architecture** yang memisahkan tanggung jawab antara *Presentation Layer*, *Business Logic/Service Layer*, dan *Data Access/Repository Layer*:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER (UI / UX)                      │
│   Next.js App Router Pages, React 19 Client Components, Tailwind CSS v4 │
│   (Explore Feed, Create Report Form, Report Detail, Admin Dashboard)   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Invokes
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    APPLICATION & BUSINESS LOGIC LAYER                   │
│   Next.js Server Actions (lib/actions/*) & Domain Services (lib/services/*)│
│   • reportService  • voteService  • commentService  • statusLogService  │
│   • Auto-Categorization Rule Engine  • Priority Scoring Math            │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Queries
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS & REPOSITORY LAYER                     │
│   Repository Layer (lib/repositories/*) & Supabase SSR Client (@supabase/ssr)│
│   • reportRepository • locationRepository • commentRepository • voteRepo│
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Database / Auth / Storage
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE CLOUD PLATFORM                         │
│   • PostgreSQL Database with Row Level Security (RLS)                   │
│   • Supabase GoTrue Auth (Session Cookies & JWT)                        │
│   • Supabase Storage (Bucket: report_attachments, avatars)              │
│   • Supabase Realtime Engine (Pub/Sub replication)                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Diagram Alur Aktivitas (*UML Activity Diagrams*)

### 2.1 Alur Pembuatan Laporan Aduan Warga (*Citizen Report Submission Flow*)

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Warga (Pelapor)
    participant UI as Antarmuka Form Lapor
    participant Action as Server Action (submitReport)
    participant Engine as Auto-Categorize Engine
    participant Storage as Supabase Storage
    participant DB as PostgreSQL (reports)

    Citizen->>UI: Isi Formulir (Judul, Deskripsi, Foto, Lokasi, Opsi Anonim)
    UI->>Engine: Evaluasi Kata Kunci Judul + Deskripsi
    Engine-->>UI: Rekomendasi Kategori Otomatis (misal: Infrastruktur)
    Citizen->>UI: Klik "Kirim Laporan"
    UI->>Action: submitReport(FormData)
    
    alt Data Tidak Lengkap
        Action-->>UI: Return { error: "Semua field wajib diisi" }
        UI-->>Citizen: Tampilkan Notifikasi Validasi Gagal (Sonner)
    else Data Valid
        opt Ada Lampiran Foto
            Action->>Storage: Upload Gambar ke Bucket 'report_attachments'
            Storage-->>Action: Return Public Image URLs[]
        end
        Action->>DB: INSERT INTO reports (title, desc, category_id, city_id, image_urls, is_anonymous)
        DB-->>Action: Return Record id
        Action->>DB: INSERT INTO report_status_logs (report_id, status='pending', note='Laporan awal diterima')
        Action-->>UI: Return { success: true, reportId }
        UI-->>Citizen: Redirect ke Halaman Detail & Tampilkan Sukses
    end
```

---

### 2.2 Alur Moderasi & Pembaruan Status oleh Admin (*Admin Moderation Flow*)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Petugas Admin OPD
    participant Dashboard as Admin Dashboard
    participant Action as Server Action (updateReportStatus)
    participant DB as PostgreSQL (reports & logs)

    Admin->>Dashboard: Buka Detail Laporan & Pilih Status Baru ('diproses' / 'selesai' / 'ditolak')
    Admin->>Dashboard: Masukkan Catatan Tindak Lanjut (Note)
    Admin->>Dashboard: Klik "Simpan Perubahan"
    Dashboard->>Action: updateReportStatus(reportId, status, note)
    
    Action->>DB: Verifikasi Peran Pengguna (auth.uid -> profiles.role = 'admin')
    alt Bukan Admin (Unauthorized)
        DB-->>Action: Profile role != 'admin'
        Action-->>Dashboard: Return { error: "Hanya admin yang dapat mengubah status" }
    else Terverifikasi Admin
        Action->>DB: UPDATE reports SET status = $status WHERE id = $reportId
        Action->>DB: INSERT INTO report_status_logs (report_id, status, note, changed_by)
        DB-->>Action: Commit Transaction
        Action-->>Dashboard: Return { success: true }
        Dashboard-->>Admin: Perbarui Tampilan Linimasa & Status Badge
    end
```

---

## 3. Diagram Relasi Entitas (*Entity Relationship Diagram — Crow's Foot*)

```mermaid
erDiagram
    PROFILES ||--o{ REPORTS : "menulis / melaporkan"
    PROFILES ||--o{ REPORT_VOTES : "memberikan vote"
    PROFILES ||--o{ COMMENTS : "menulis tanggapan"
    PROFILES ||--o{ REPORT_STATUS_LOGS : "diubah oleh admin"
    
    CITIES ||--o{ DISTRICTS : "memiliki kecamatan"
    CITIES ||--o{ REPORTS : "lokasi kabupaten/kota"
    DISTRICTS ||--o{ REPORTS : "lokasi kecamatan"
    
    CATEGORIES ||--o{ REPORTS : "kategori masalah"
    
    REPORTS ||--o{ REPORT_ATTACHMENTS : "memiliki berkas lampiran"
    REPORTS ||--o{ REPORT_VOTES : "di-vote oleh warga"
    REPORTS ||--o{ COMMENTS : "memiliki diskusi"
    REPORTS ||--o{ REPORT_STATUS_LOGS : "memiliki riwayat status"
    REPORTS ||--o| AI_ANALYSIS : "memiliki ringkasan AI"

    PROFILES {
        uuid id PK
        string email
        enum role "admin | user"
        string nik "16 digit unik"
        string full_name
        string phone_number
        string gender
        date birth_date
        uuid city_id FK
        uuid district_id FK
        string avatar_url
        timestamp created_at
    }

    CATEGORIES {
        uuid id PK
        string name "Infrastruktur, Sampah, dll"
        timestamp created_at
    }

    CITIES {
        uuid id PK
        string name "Kota Yogyakarta, Sleman, dll"
    }

    DISTRICTS {
        uuid id PK
        uuid city_id FK
        string name
    }

    REPORTS {
        uuid id PK
        uuid user_id FK "nullable jika anonim"
        string title
        text description
        uuid category_id FK
        uuid city_id FK
        uuid district_id FK
        text address
        boolean is_anonymous "default: false"
        enum status "pending | diproses | selesai | ditolak"
        enum priority "rendah | sedang | tinggi"
        integer priority_score "default: 0"
        integer vote_count "default: 0"
        integer similar_count "default: 0"
        string_array image_urls
        timestamp created_at
    }

    REPORT_VOTES {
        uuid id PK
        uuid report_id FK
        uuid user_id FK
        timestamp created_at
    }

    REPORT_ATTACHMENTS {
        uuid id PK
        uuid report_id FK
        string file_url
        timestamp created_at
    }

    REPORT_STATUS_LOGS {
        uuid id PK
        uuid report_id FK
        string status
        text note
        uuid changed_by FK
        timestamp created_at
    }

    COMMENTS {
        uuid id PK
        uuid report_id FK
        uuid user_id FK
        uuid parent_id FK "nullable (threaded reply)"
        text content
        timestamp created_at
    }

    AI_ANALYSIS {
        uuid id PK
        uuid report_id FK
        text summary
        text category_suggestion
        text priority
        text suggested_agency
        timestamp created_at
    }
```

---

## 4. Spesifikasi Kamus Data (*Database Data Dictionary*)

### 4.1 Tabel Utama `reports`

| Kolom | Tipe Data | Constraint | Keterangan Bisnis |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT uuid_generate_v4()` | Kunci primer unik laporan |
| `user_id` | `UUID` | `REFERENCES profiles(id) ON DELETE SET NULL` | ID akun pelapor (disamarkan jika anonim) |
| `title` | `TEXT` | `NOT NULL` | Judul ringkas masalah |
| `description` | `TEXT` | `NOT NULL` | Rincian kronologi dan detail aduan |
| `category_id` | `UUID` | `REFERENCES categories(id) NOT NULL` | Kategori aduan (9 kategori resmi) |
| `city_id` | `UUID` | `REFERENCES cities(id) NOT NULL` | Kota / Kabupaten di wilayah DIY |
| `district_id` | `UUID` | `REFERENCES districts(id), Nullable` | Kecamatan lokasi kejadian |
| `address` | `TEXT` | `Nullable` | Alamat patokan spesifik lokasi |
| `is_anonymous` | `BOOLEAN` | `DEFAULT false` | True = Nama & profil disembunyikan di publik |
| `status` | `ENUM` | `DEFAULT 'pending'` | Nilai: `pending`, `diproses`, `selesai`, `ditolak` |
| `priority` | `ENUM` | `DEFAULT 'rendah'` | Nilai: `rendah`, `sedang`, `tinggi` |
| `priority_score`| `INTEGER`| `DEFAULT 0` | Skor kalkulasi bobot urgensi |
| `vote_count` | `INTEGER` | `DEFAULT 0` | Akumulasi jumlah dukungan warga |
| `similar_count`| `INTEGER` | `DEFAULT 0` | Jumlah laporan serupa yang terdeteksi |
| `image_urls` | `TEXT[]` | `DEFAULT '{}'` | Daftar URL publik foto di Supabase Storage |
| `created_at` | `TIMESTAMP`| `DEFAULT now()` | Waktu pembuatan laporan |

---

## 5. Algoritma & Logika Bisnis

### 5.1 Algoritma *Rule-Based Auto-Categorization*
Sistem menganalisis teks `title` dan `description` laporan secara otomatis untuk mendeteksi kategori yang relevan:

```typescript
// Cuplikan Logika di lib/utils/autoCategorize.ts
const CATEGORY_RULES = [
  { keywords: ["jalan", "lubang", "aspal", "trotoar", "jembatan"], category: "Infrastruktur & Jalan" },
  { keywords: ["lampu", "penerangan", "pju", "gelap", "bohlam"], category: "Penerangan Jalan" },
  { keywords: ["sampah", "bau", "limbah", "tps", "kotor", "sungai"], category: "Sampah & Lingkungan" },
  { keywords: ["pungli", "suap", "parkir liar", "tarif"], category: "Pungli & Gratifikasi" },
  { keywords: ["balap liar", "tawuran", "maling", "begal", "klitih"], category: "Keamanan & Kriminal" },
  { keywords: ["puskesmas", "rsud", "obat", "ambulans"], category: "Kesehatan" },
  { keywords: ["ktp", "kk", "kelurahan", "pelayanan", "antrean"], category: "Pelayanan Publik" },
  { keywords: ["sekolah", "gedung", "ruang kelas", "bangku"], category: "Fasilitas Pendidikan" },
];
```

### 5.2 Algoritma Kalkulasi Skor Prioritas (*Priority Scoring Engine*)
```typescript
priority_score = vote_count + (similar_count * 2);

if (priority_score >= 15) {
  priority = "tinggi";
} else if (priority_score >= 6) {
  priority = "sedang";
} else {
  priority = "rendah";
}
```

---

## 6. Spesifikasi Kontrak REST API & Postman Collection

Seluruh endpoint REST API di bawah ini dibundel dalam berkas resmi:
📁 **[`docs/Laporin Aja Bro.postman_collection.json`](file:///e:/project-nextjs/laporin-aja-bro/docs/Laporin%20Aja%20Bro.postman_collection.json)**

| Modul | Method | Endpoint | Keterangan | Autentikasi |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Masuk ke akun menggunakan Email & Password | Publik |
| **Auth** | `POST` | `/api/auth/register` | Registrasi akun baru lengkap dengan validasi 16-digit NIK | Publik |
| **Auth** | `GET` | `/api/auth/me` | Mengambil data profil pengguna yang sedang login | Bearer / Cookie |
| **Auth** | `POST` | `/api/auth/logout` | Mengakhiri sesi aktif dan membersihkan cookie | Terautentikasi |
| **Master**| `GET` | `/api/master/categories` | Mengambil daftar 9 kategori masalah resmi | Publik |
| **Master**| `GET` | `/api/master/cities` | Mengambil 5 Kota/Kabupaten di wilayah DIY | Publik |
| **Master**| `GET` | `/api/master/districts?city_id=...` | Mengambil daftar kecamatan berdasarkan kota | Publik |
| **Reports**| `GET` | `/api/reports?city=...&status=...` | Mengambil feed publik aduan warga dengan filter | Publik |
| **Reports**| `POST` | `/api/reports` | Membuat dan mempublikasikan aduan baru | Publik / User |
| **Reports**| `GET` | `/api/reports/:id` | Mengambil rincian aduan, foto, log, dan komentar | Publik |
| **Reports**| `POST` | `/api/reports/:id/vote` | Memberikan / membatalkan *upvote* urgensi aduan | Terautentikasi |
| **Reports**| `POST` | `/api/reports/:id/comments` | Menambahkan komentar / tanggapan diskusi | Terautentikasi |
| **Admin** | `PATCH`| `/api/reports/:id/status` | Memperbarui status aduan (`diproses`/`selesai`/`ditolak`) | Khusus Admin |

---

## 7. Keamanan Data & Row Level Security (RLS)

* **Keamanan Akses Tabel `profiles`:** Pengguna biasa hanya diizinkan membaca profil milik sendiri (`auth.uid() = id`), sedangkan admin memiliki hak supervisi.
* **Keamanan Akses Tabel `reports`:** Publik dapat membaca seluruh laporan publik (`SELECT true`) dan mengirimkan aduan (`INSERT true`), namun operasi mutasi `UPDATE status` dikunci secara ketat di level PostgreSQL RLS hanya untuk `role = 'admin'`.
* **Keamanan Storage Bucket `report_attachments`:** Mencegah file berbahaya dengan membatasi *MIME Types* ke format gambar (`image/jpeg`, `image/png`, `image/webp`) dan kuota maksimal 5MB per berkas.
