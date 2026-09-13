# Product Requirements Document (PRD) — Laporin Aja Bro

> **Dokumen Kontrol:**
> * **Nama Proyek:** Laporin Aja Bro (Platform Pelaporan Fasilitas & Layanan Publik DIY)
> * **Penulis / Pengembang:** Muhammad Ilham Setiawan
> * **Versi Dokumen:** v1.0
> * **Status Implementasi:** Selesai & Terimplementasi di Production
> * **URL Produksi:** [https://laporin-aja-bro.vercel.app](https://laporin-aja-bro.vercel.app)
> * **Target Pengguna:** Warga Masyarakat Daerah Istimewa Yogyakarta (DIY) & Petugas Admin / Instansi OPD

---

## 1. Ringkasan Eksekutif (*Executive Summary*)

**Laporin Aja Bro** adalah platform *civic-tech* berbasis web modern yang dirancang untuk memangkas hambatan birokrasi dan ketidaktransparanan dalam proses pengaduan fasilitas serta layanan publik di wilayah Daerah Istimewa Yogyakarta (DIY).

Aplikasi ini mendemokratisasi pelaporan warga dengan menyediakan fitur **Pelaporan Cepat (dengan opsi Anonim)**, **Auto-Categorization & AI-Assisted Summary**, **Sistem Voting Urgensi Warga**, serta **Papan Kendali Admin & Status Timeline Transparan**. Warga dapat mengunggah bukti foto kerusakan secara *real-time*, memantau proses tindak lanjut instansi terkait secara terbuka, dan berdiskusi pada kolom tanggapan publik.

---

## 2. Latar Belakang Masalah (*Problem Statement*)

| No | Masalah Nyata (*Pain Point*) | Dampak pada Warga & Pemerintah | Solusi di "Laporin Aja Bro" |
| :---: | :--- | :--- | :--- |
| **1** | **Birokrasi Pelaporan Rumit & Tersebar** | Warga bingung harus mengadu ke kanal/dinas mana ketika menemukan jalan rusak, sampah liar, atau lampu padam di DIY. | **Pusat Pelaporan Tunggal Terpadu** dengan master data wilayah (5 Kota/Kabupaten DIY + Kecamatan) dan 9 kategori terstandarisasi. |
| **2** | **Kekhawatiran Privasi & Intimidasi** | Warga enggan melaporkan masalah sensitif (seperti pungli atau gangguan keamanan) karena takut identitasnya terekspos. | **Opsi Pelaporan Anonim (`is_anonymous`)** yang menyamarkan nama dan profil pelapor di hadapan publik. |
| **3** | **Minimnya Transparansi Tindak Lanjut** | Aduan warga sering masuk ke "kotak hitam" tanpa kejelasan apakah laporan sedang disurvei, diperbaiki, atau ditolak. | **Audit Trail Status Timeline Real-time** (`pending` $\rightarrow$ `diproses` $\rightarrow$ `selesai` / `ditolak`) dengan catatan resmi petugas admin. |
| **4** | **Ketimpangan Skala Prioritas Penanganan** | Instansi kesulitan memilah aduan mana yang paling mendesak dan berdampak luas bagi masyarakat. | **Priority Scoring & Public Voting System** di mana warga dapat memberikan *upvote* pada laporan yang mendesak. |

---

## 3. Profil Pengguna (*User Personas*)

### Persona 1: Warga DIY / Pelapor (*Citizen*)
* **Karakteristik:** Masyarakat umum, pengguna jalan, dan warga residensial di DIY yang menemukan masalah fasilitas publik.
* **Kebutuhan:**
  * Ingin membuat laporan dengan cepat lewat *smartphone* disertai bukti foto dan penanda lokasi detail.
  * Ingin opsi menyembunyikan identitas asli (*anonymous report*) demi keamanan personal.
  * Ingin memantau status perkembangan perbaikan secara transparan.

### Persona 2: Admin Dinas / Petugas Instansi Pemda (*Public Service Admin*)
* **Karakteristik:** Tim verifikator dan petugas tindak lanjut lapangan dari dinas terkait (Dinas PUPR, DLH, Satpol PP, Dishub, dsb).
* **Kebutuhan:**
  * Memiliki dasbor moderasi terpusat untuk memfilter laporan berdasarkan status, wilayah (Kabupaten/Kecamatan), dan kategori.
  * Memperbarui status pengerjaan laporan disertai catatan resmi tindak lanjut lapangan.
  * Memantau ringkasan analitik dan metrik prioritas aduan warga.

---

## 4. Kebutuhan Fungsional (*Functional Requirements*)

### FR-01: Autentikasi & Profil Pengguna Berbasis NIK
* Sistem menyediakan registrasi akun warga dengan validasi NIK (16 digit), nama lengkap, email, nomor HP, jenis kelamin, tanggal lahir, dan domisili (Kota/Kecamatan).
* Sistem mencegah duplikasi akun dengan mengecek keunikan NIK dan nomor HP sebelum pembuatan kredensial Supabase Auth.
* Sistem mendukung autentikasi dua peran (*Role-Based*): `user` (warga) dan `admin` (petugas dinas).

### FR-02: Pembuatan & Publikasi Aduan Publik (*Report Creation*)
* Pengguna dapat membuat laporan baru dengan mengunggah judul, deskripsi rinci, kategori (9 kategori resmi), kota/kabupaten, kecamatan, alamat spesifik, dan lampiran foto (maksimal 5MB per gambar ke Supabase Storage `report_attachments`).
* Pengguna dapat mencentang opsi **Anonim (`is_anonymous = true`)**.
* Sistem mendukung *Rule-Based Auto-Categorization* yang menganalisis kata kunci dalam judul/deskripsi untuk menyarankan kategori yang tepat secara otomatis.

### FR-03: Peringkat Prioritas & Dukungan Warga (*Public Upvoting*)
* Setiap warga terautentikasi dapat memberikan dukungan (*vote*) sebanyak 1 kali pada laporan publik yang dirasa mendesak.
* Sistem secara otomatis menghitung *Priority Score*:
  $$\text{Priority Score} = \text{Vote Count} + \text{Similar Count}$$
  * Score $0 - 5$: Prioritas **Rendah**
  * Score $6 - 15$: Prioritas **Sedang**
  * Score $> 15$: Prioritas **Tinggi**

### FR-04: Rekam Jejak Status & Linimasa (*Status Timeline & Audit Trail*)
* Setiap perubahan status oleh admin tercatat pada tabel log histori (`report_status_logs`) mencakup status baru, catatan petugas (`note`), nama admin pengubah (`changed_by`), dan waktu perubahan (`created_at`).
* Warga dapat melihat linimasa progres pengerjaan secara visual di halaman detail aduan.

### FR-05: Kolom Diskusi & Tanggapan Berulir (*Threaded Comments*)
* Warga dan petugas dapat berdiskusi pada kolom komentar laporan.
* Mendukung komentar berulir (*nested reply*) untuk membalas tanggapan spesifik.

### FR-06: Dasbor Moderasi & Manajemen Admin
* Halaman admin terproteksi khusus role `admin` (`/admin`).
* Menyediakan filter komprehensif berdasarkan kota, status, dan kategori.
* Admin dapat mengubah status laporan menjadi `diproses`, `selesai`, atau `ditolak` dengan input catatan resmi.

---

## 5. Kebutuhan Non-Fungsional (*Non-Functional Requirements*)

* **NFR-01 (Keamanan & Row Level Security):** Data dilindungi kebijakan *Row Level Security (RLS)* di Supabase. Operasi mutasi status dan log hanya dapat dilakukan oleh user dengan `role = 'admin'`.
* **NFR-02 (Performa & Optimasi Aset):** Foto aduan disimpan pada bucket publik Supabase Storage dengan optimasi gambar dan *caching headers*.
* **NFR-03 (Desain Mobile-First & Responsif):** Tampilan antarmuka dioptimalkan untuk akses *smartphone* menggunakan Tailwind CSS v4, *bottom-nav*, dan animasi mikro Framer Motion yang halus.
* **NFR-04 (Traceability Dokumen):** Seluruh arsitektur, PRD, TSD, diagram ERD, dan spesifikasi API dikelola dalam repositori Git folder `docs/` sebagai *Single Source of Truth*.
