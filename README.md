# Laporin Aja Bro

Platform Pelaporan Fasilitas dan Layanan Publik Terpadu — Daerah Istimewa Yogyakarta

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Deployment](https://img.shields.io/badge/Vercel-Live_Production-000000?style=flat-square&logo=vercel)](https://laporin-aja-bro.vercel.app)

> **Live Demo:** [https://laporin-aja-bro.vercel.app](https://laporin-aja-bro.vercel.app)  
> **Konteks Proyek:** TechSprint IT 2026 — Tim UTY (Universitas Teknologi Yogyakarta)

---

## Ringkasan Eksekutif

**Laporin Aja Bro** adalah platform *civic-tech* berbasis web yang dirancang untuk memangkas hambatan birokrasi dan ketidaktransparanan dalam pelaporan fasilitas dan layanan publik di wilayah Daerah Istimewa Yogyakarta (DIY).

Platform ini menghubungkan aspirasi masyarakat di 5 Kota/Kabupaten DIY (Kota Yogyakarta, Sleman, Bantul, Kulon Progo, dan Gunungkidul) dengan instansi dinas terkait melalui sistem pelaporan cepat, opsi anonimitas terproteksi, algoritma skor prioritas berbasis dukungan warga, serta linimasa audit trail penanganan yang dapat dipantau secara terbuka.

---

## Masalah & Solusi

| Tantangan Lapangan | Dampak pada Warga & Pemda | Solusi di Laporin Aja Bro |
| :--- | :--- | :--- |
| **Kanal Pengaduan Tersebar** | Warga bingung menentukan dinas yang berwenang untuk kerusakan jalan, sampah, atau lampu padam. | **Pusat Pelaporan Terpadu** dengan master data 5 kabupaten/kota, kecamatan, dan 9 kategori terstandarisasi. |
| **Kekhawatiran Privasi & Intimidasi** | Warga enggan melaporkan isu sensitif karena identitas rentan terekspos. | **Opsi Pelaporan Anonim (`is_anonymous`)** yang menyamarkan identitas pelapor di hadapan publik. |
| **Tindak Lanjut "Kotak Hitam"** | Aduan warga kerap tanpa kejelasan status pengerjaan atau alasan penolakan. | **Audit Trail Status Timeline Real-time** (`pending` &rarr; `diproses` &rarr; `selesai` / `ditolak`) dengan catatan resmi petugas dinas. |
| **Ketimpangan Urgensi Penanganan** | Petugas kesulitan memilah laporan mana yang paling mendesak dan berdampak luas. | **Priority Scoring & Community Upvoting** untuk menentukan skala urgensi penanganan secara objektif. |

---

## Fitur Utama

### 1. Portal Warga (Pelapor)
* **Formulir Pelaporan Cepat**: Pengunggahan judul, deskripsi rinci, pemilihan wilayah bertingkat (Kota &rarr; Kecamatan), titik patokan, dan bukti foto kerusakan (hingga 4 gambar).
* **Klasifikasi Otomatis (Rule-Based Auto-Categorization)**: Analisis kata kunci (*string matching*) secara lokal pada teks deskripsi untuk menyarankan kategori dinas yang relevan secara instan saat warga mengetik.
* **Opsi Pelaporan Anonim**: Menjamin kerahasiaan identitas nama dan profil warga pada tampilan feed publik.
* **Sistem Dukungan Warga (Public Upvoting)**: Setiap warga terverifikasi dapat memberikan satu suara dukungan untuk menaikkan urgensi penanganan aduan.
* **Linimasa Riwayat Pengerjaan**: Audit log transparan yang memperlihatkan setiap tahapan proses perbaikan beserta catatan resmi dari dinas terkait.
* **Diskusi Berulir (Threaded Discussion)**: Ruang tanggapan interaktif dua arah antara warga dan petugas lapangan pada detail aduan.

### 2. Dasbor Operasional Petugas (Admin OPD)
* **Pusat Kendali Terpusat**: Manajemen status laporan dengan filter multi-kriteria (wilayah kabupaten/kota, kecamatan, kategori, dan status penanganan).
* **Verifikasi & Pembaruan Status**: Validasi dan perubahan status laporan (`pending`, `diproses`, `selesai`, `ditolak`) disertai input catatan resmi dinas yang langsung tercatat di tabel log histori.
* **Pemetaan Disposisi Instansi**: Rekomendasi dinas penanggung jawab teknis (Dinas PUPRKP, DLHK, PLN UP3, Dinas Perhubungan, dsb.) berdasarkan kategori dan tingkat urgensi laporan.
* **Metrik Statistik Wilayah**: Pemantauan agregat total aduan masuk, persentase penanganan, dan distribusi laporan prioritas tinggi.

---

## Arsitektur Sistem

Aplikasi dibangun menggunakan **Next.js 16 App Router** dengan pendekatan **Clean Layered Architecture** untuk memisahkan tanggung jawab kode secara modular:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER (UI / UX)                      │
│   Next.js App Router, React 19 Client/Server Components, Tailwind v4   │
│   (Explore Feed, Create Report Form, Report Detail, Admin Dashboard)   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Invokes
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    APPLICATION & BUSINESS LOGIC LAYER                   │
│   Next.js Server Actions (lib/actions/*) & Domain Services (lib/services/*)│
│   • reportService   • voteService   • commentService   • statusLogService│
│   • Keyword Auto-Categorization Engine   • Priority Scoring Math        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Queries
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS & REPOSITORY LAYER                     │
│   Repository Layer (lib/repositories/*) & Supabase Client (@supabase/ssr)│
│   • reportRepository • locationRepository • commentRepository • voteRepo │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Database / Auth / Storage
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE CLOUD PLATFORM                         │
│   • PostgreSQL 15+ Database dengan Row Level Security (RLS)             │
│   • Supabase GoTrue Auth (Session Cookies & JWT)                        │
│   • Supabase Storage (Bucket: report_attachments, avatars)              │
│   • Supabase Realtime Engine (Pub/Sub replication)                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Logika Bisnis & Formula Prioritas

### 1. Perhitungan Skor Prioritas
Skor prioritas dihitung secara otomatis saat laporan dibuat atau menerima dukungan dari warga:

$$\text{Priority Score} = \text{Bobot Kategori} + \text{Vote Count} + \text{Similar Count}$$

| Kategori Masalah | Bobot Dasar (*Weight*) | Instansi Rujukan Utama |
| :--- | :---: | :--- |
| Keamanan & Kriminal | 10 | Polresta / Polres Setempat |
| Pungli & Gratifikasi | 9 | Inspektorat Daerah DIY / Satgas Saber Pungli |
| Kesehatan | 8 | Dinas Kesehatan DIY / RSUD |
| Infrastruktur & Jalan | 7 | Dinas Pekerjaan Umum, Perumahan & ESDM DIY |
| Sampah & Lingkungan | 6 | Dinas Lingkungan Hidup dan Kehutanan DIY |
| Pelayanan Publik | 5 | Ombudsman RI Perwakilan DIY / Biro Organisasi |
| Penerangan Jalan | 4 | Dishub DIY / PLN UP3 Yogyakarta |
| Fasilitas Pendidikan | 3 | Dinas Pendidikan, Pemuda, dan Olahraga DIY |
| Fasilitas Umum / Lainnya | 1 | Dinas Sosial DIY / OPD Terkait |

**Ambang Batas Status Prioritas:**
* Skor $0 - 5$: Prioritas **Rendah**
* Skor $6 - 15$: Prioritas **Sedang**
* Skor $> 15$: Prioritas **Tinggi**

### 2. Klasifikasi Otomatis Berbasis Kata Kunci
Evaluasi teks judul dan deskripsi aduan dijalankan secara deterministik di sisi klien tanpa latensi jaringan eksternal:
* Memetakan leksikon kata kunci (seperti *jalan*, *aspal*, *berlubang*, *longsor* &rarr; *Infrastruktur*).
* Menyediakan fleksibilitas bagi pelapor untuk mengubah kategori secara manual (*override*).

---

## Basis Data & Keamanan

Data dikelola di **PostgreSQL 15+** Supabase dengan skema relasional terstruktur:
* `profiles`: Data demografi warga terverifikasi NIK, peran pengguna (`user` | `admin`), dan kontak.
* `reports`: Entitas utama aduan masyarakat, status pengerjaan, skor prioritas, dan koordinat wilayah DIY.
* `categories`, `cities`, `districts`: Data master wilayah 5 Kota/Kabupaten DIY dan 9 kategori resmi.
* `report_votes`: Pencatatan dukungan satu-user-satu-laporan dengan constraint unik `(report_id, user_id)`.
* `report_status_logs`: Rekam jejak audit trail seluruh perubahan status beserta catatan resmi admin pengubah.
* `comments`: Diskusi berulir antarpengguna dengan relasi mandiri `parent_id`.
* `report_attachments`: Relasi berkas bukti foto yang tersimpan di bucket Supabase Storage.

**Row Level Security (RLS):**
* Akses baca laporan publik terbuka untuk umum.
* Pembuatan laporan, komentar, dan vote terproteksi autentikasi akun.
* Operasi pembaruan status dan penambahan log audit dibatasi ketat hanya untuk akun dengan `role = 'admin'`.

---

## Panduan Instalasi Lokal

### Prasyarat Sistem
* [Node.js](https://nodejs.org/) versi 20.x atau lebih baru
* [pnpm](https://pnpm.io/) versi 9.x atau lebih baru
* Akun dan proyek [Supabase](https://supabase.com/) aktif

### Langkah Instalasi

1. **Kloning Repositori**
   ```bash
   git clone https://github.com/ilsetiawan1/laporin-aja-bro.git
   cd laporin-aja-bro
   ```

2. **Instalasi Dependensi**
   ```bash
   pnpm install
   ```

3. **Konfigurasi Environment Variables**
   Buat file `.env.local` di direktori utama:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...
   ```

4. **Inisialisasi Skema Basis Data**
   Jalankan query DDL yang tersedia di file [`supabase/schema.sql`](file:///e:/project-nextjs/laporin-aja-bro/supabase/schema.sql) pada SQL Editor di dasbor Supabase Anda.

5. **Jalankan Server Pengembangan**
   ```bash
   pnpm dev
   ```
   Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## Struktur Direktori

```
laporin-aja-bro/
├── app/                  # Next.js App Router (Routes & Layouts)
│   ├── (auth)/           # Rute autentikasi akun
│   ├── admin/            # Dasbor operasional & moderasi petugas
│   ├── dashboard/        # Dasbor pelacakan aduan warga
│   ├── lapor/            # Formulir pengajuan aduan publik
│   ├── reports/          # Feed penelusuran & halaman detail laporan
│   └── status/           # Pelacakan status instan
├── components/           # Komponen Antarmuka Modular
│   ├── admin/            # Komponen operasional admin
│   ├── auth/             # Modal dan wizard pendaftaran NIK
│   ├── landing/          # Komponen halaman beranda & hero
│   ├── reports/          # Komponen kartu, form, timeline, dan voting
│   └── ui/               # Primitif UI (Navbar, Combobox, Button, Lightbox)
├── docs/                 # Dokumentasi Resmi & Spesifikasi Teknis
│   ├── PRD.md            # Product Requirements Document
│   └── TSD.md            # Technical Specifications Document
├── lib/                  # Logika Bisnis & Integrasi
│   ├── actions/          # Next.js Server Actions (Mutasi DB)
│   ├── repositories/     # Data Access Layer (Supabase Queries)
│   ├── services/         # Domain Logic Layer
│   ├── supabase/         # Konfigurasi Supabase Client & Server
│   └── utils/            # Auto-categorize & priority calculator
├── supabase/             # Migration Scripts & Master Schema DDL
└── types/                # Definisi TypeScript Interfaces & Enums
```

---

## Tim Pengembang & Lisensi

Dikembangkan oleh **Tim UTY** untuk kompetisi **TechSprint IT 2026**:
* **Muhammad Ilham Setiawan** ([@ilsetiawan1](https://github.com/ilsetiawan1))
* **Opik Sendy** ([@opiksendy](https://github.com/opiksendy))

Didistribusikan di bawah lisensi [MIT](LICENSE). Platform ini didedikasikan untuk kemajuan transparansi dan partisipasi publik di Daerah Istimewa Yogyakarta.
