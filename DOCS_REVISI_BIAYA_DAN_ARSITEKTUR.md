# Dokumentasi Teknis: Biaya Layanan, Caching SSR, dan Keamanan Sistem
**Proyek:** Katalog Digital UMKM Desa Dadapayu  
**Status:** Dokumen Arsitektur & Pedoman Keberlanjutan

---

## 1. Batas Free Tier Resmi dan Mitigasi Biaya

Sesuai arahan, sistem ini tidak berasumsi bahwa layanan cloud akan "selalu gratis tanpa batas". Berikut adalah ketentuan resmi batas gratis (Free Tier) dan potensi biaya jika kuota terlampaui:

### A. Cloudflare Pages & Workers
- **Batas Gratis Resmi:**
  - *Bandwidth & Requests:* Unlimited untuk static assets.
  - *Cloudflare Workers / SSR Requests:* **100.000 requests per hari**.
  - *Build Minutes:* 500 menit build per bulan.
- **Risiko Biaya & Mitigasi:**
  - Di luar 100.000 request/hari, Cloudflare Workers free plan akan memblokir request baru (HTTP 1015/Rate Limit) dan **TIDAK langsung memotong tagihan kartu kredit** kecuali akun di-upgrade ke Workers Paid ($5/bulan).
  - *Mitigasi:* Cache API lokal Cloudflare dapat mengurangi pembacaan Firestore untuk halaman publik selama TTL. Cache API ini tetap menjalankan Worker pada setiap request, jadi tidak mengurangi hitungan request Worker.

### B. Google Cloud / Cloud Firestore
- **Batas Gratis Resmi (Spark Plan - No Credit Card Required):**
  - *Reads:* **50.000 dokumen per hari**.
  - *Writes:* **20.000 dokumen per hari**.
  - *Deletes:* **20.000 dokumen per hari**.
  - *Stored Data:* **1 GB**.
- **Risiko Biaya & Mitigasi:**
  - Pada Firebase Spark Plan (gratis tanpa kartu kredit), jika kuota harian habis, layanan akan mengembalikan error kuota (Firestore unavailable) hingga kuota di-reset tengah malam waktu Pasifik (PST), **tanpa tagihan finansial**.
  - *Mitigasi:* Katalog desa memiliki ~20-100 UMKM. Dengan edge caching 1-2 menit, 1 read dari Firestore dapat melayani ratusan pengunjung website.

### C. Cloudinary
- **Batas Gratis Resmi:**
  - **25 Kredit Bulanan** (1 kredit = 1.000 transformasi gambar ATAU 1 GB storage ATAU 1 GB net bandwidth).
- **Risiko Biaya & Mitigasi:**
  - Akun free tier akan menolak upload baru atau menurunkan kecepatan jika kredit habis hingga awal bulan berikutnya.
  - *Mitigasi:*
    - Setiap gambar yang diunggah dikompresi otomatis dengan format modern (`f_auto, q_auto`).
    - Dimensi foto dibatasi maksimal lebar 1200px sebelum disimpan.
    - Menghindari transformasi berulang secara on-the-fly.

---

## 2. Strategi Caching SSR & Kecepatan Pembaruan Data

Agar perubahan data yang dilakukan perangkat desa tidak tertahan terlalu lama oleh cache browser maupun edge CDN:

1. **Cache API Cloudflare Workers:**
   - Middleware hanya menyimpan `GET` untuk homepage, katalog, kategori, detail UMKM terbit, dan sitemap. Request yang membawa cookie/Authorization, seluruh `/admin/*`, dan `/api/*` dilewati.
   - Cache API menyimpan HTML/XML selama 60 detik dan menambahkan `X-UMKM-Edge-Cache: MISS|HIT|BYPASS` untuk pemeriksaan runtime. Browser tetap menerima `Cache-Control: public, max-age=0, must-revalidate`.
   - Cache API Cloudflare tidak mendukung `stale-while-revalidate`; karena itu cache ini memakai TTL 60 detik tanpa klaim stale-while-revalidate.
   - Cache API bersifat lokal per data center. Mutasi admin tidak bisa menghapus cache di semua data center melalui binding Pages saat ini, sehingga halaman publik dapat tertinggal sampai 60 detik pada data center yang memiliki entry.
   - **Validasi produksi:** status header HIT/MISS pada preview lokal tidak membuktikan cache pada edge deployed. Validasi deployed harus dilakukan setelah deploy dengan request berulang pada hostname Cloudflare dan memeriksa header status.
2. **Dashboard Admin Tanpa Cache:**
   - Semua halaman `/admin/*` menggunakan header:
     ```http
     Cache-Control: no-store, no-cache, must-revalidate
     ```
   - Admin selalu melihat data Firestore detik itu juga (real-time).

---

## 3. Pengetatan Keamanan Firebase & Cloudinary

1. **Firestore Security Rules:**
   - Hak baca publik: Hanya diizinkan jika `resource.data.status == 'published'`.
   - Hak tulis (create, update, delete): Hanya diizinkan jika user memiliki sesi autentikasi valid (`request.auth != null`) DAN UID-nya terdaftar di koleksi `admins`.
   - Validasi struktur field: Menolak input dokumen yang tidak memiliki field wajib atau nomor WA/maps tidak valid.
2. **Operasi Cloudinary Terenkripsi:**
   - Frontend tidak menyimpan `CLOUDINARY_API_SECRET`.
   - Upload dilakukan melalui *signed upload params* yang digenerate oleh serverless endpoint `/api/cloudinary/sign` setelah memverifikasi token admin.
   - Penghapusan foto dilakukan oleh serverless endpoint `/api/cloudinary/delete` dengan verifikasi ganda (ID token Firebase Admin).

---

## 4. Filosofi Desain Dashboard untuk Perangkat Desa Non-Teknis

1. **Bahasa Indonesia Sehari-hari:** Menghindari istilah teknis (seperti "payload", "slug", "CDN", "endpoint", "schema"). Menggunakan istilah: "Nama Usaha", "Tautan Lokasi Maps", "Status Tampilan (Terbit / Konsep / Disembunyikan)".
2. **Form Bertahap & Jelas:** Input dikelompokkan dengan ikon dan instruksi singkat.
3. **Konfirmasi Tindakan Berisiko:** Menampilkan modal konfirmasi dengan teks jelas sebelum menghapus UMKM atau kategori.
4. **Pencegahan Data Yatim (Orphaned Data):** Kategori yang masih digunakan oleh UMKM aktif tidak dapat dihapus sebelum UMKM terkait dipindahkan ke kategori lain.
