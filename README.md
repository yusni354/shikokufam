# Komunitas ID-JP — Database Anggota

Aplikasi web (PWA) untuk mengelola data anggota komunitas: login dengan Google atau email, data anggota, absensi, forum, peta (Google My Maps), dan tombol tanya admin. Akun baru otomatis bisa masuk tanpa persetujuan admin. Tanpa proses build: cukup berkas statis, jadi bisa langsung di-deploy di Vercel.

## Susunan berkas

```
index.html            halaman utama (memuat semua skrip)
config.js             URL + public key Supabase (publishable/anon)  <-- WAJIB DIISI
manifest.webmanifest  pengaturan PWA (nama, ikon, warna)
sw.js                 service worker (tetap terbuka saat sinyal lemah)
vercel.json           pengaturan hosting Vercel
style.css             seluruh tampilan
core.js               state, helper, daftar menu
supabase.js           koneksi Supabase + penyimpanan data/foto
auth.js               login Google/email dan mulai aplikasi
router.js             pindah halaman, menu samping, bar bawah
views-*.js            halaman: dashboard, anggota, formulir, absen+forum, peta, admin
mascot.js             maskot (bisa digeser, ketuk = tanya admin)
maskot.webp           gambar maskot
icon-*.png            ikon aplikasi
schema.sql            tabel + aturan keamanan (dijalankan sekali di Supabase)
```

## Langkah 1 — Siapkan Supabase (login + database), gratis

1. Daftar di https://supabase.com lalu **New project** (pilih wilayah terdekat, mis. Tokyo/Singapore). Catat password database.
2. Buka **SQL Editor** → **New query** → tempel seluruh isi `schema.sql` → **Run**. Jika skema sebelumnya sudah dipasang, jalankan lagi versi terbaru ini agar pendaftar lama yang masih menunggu persetujuan juga bisa masuk.
3. **Project Settings → API**: salin **Project URL** dan **publishable key** (`sb_publishable_...`). Jika proyek masih memakai key lama, gunakan **anon public key**.
4. Buka `config.js`, ganti kedua nilainya.
   > Publishable key dan anon public key memang dirancang untuk frontend. Keamanan data dijaga aturan RLS di `schema.sql`. **Jangan pernah** memasukkan `sb_secret_` atau `service_role` key ke repo.
5. **Authentication → Sign In / Providers → Google**: aktifkan Google, lalu masukkan **Client ID** dan **Client Secret** dari kredensial OAuth Google Cloud. Tambahkan URL callback yang ditampilkan Supabase di konfigurasi OAuth Google Cloud.
6. **Authentication → URL Configuration**: isi **Site URL** dengan alamat aplikasi dan tambahkan alamat tersebut ke **Redirect URLs** (misalnya `https://komunitas-id-jp.vercel.app/**`).
7. **Authentication → Sign In / Providers → Email**: pengaturan ini hanya diperlukan untuk login/daftar dengan email. Google dapat langsung membuat sesi login.

## Langkah 2 — Unggah ke GitHub

Lewat web (paling mudah): buat repositori baru di github.com → **uploading an existing file** → seret **isi folder ini** (bukan folder induknya) → **Commit changes**.

Atau lewat terminal pada clone repositori ini:
```bash
git add .
git commit -m "Siapkan aplikasi komunitas"
git push origin main
```

## Langkah 3 — Deploy di Vercel

1. Masuk https://vercel.com dengan akun GitHub → **Add New → Project** → pilih repositori tadi → **Import**.
2. **Framework Preset: Other**. Kosongkan *Build Command* dan *Output Directory*. Root Directory biarkan `./`.
3. **Deploy**. Anda mendapat alamat seperti `https://komunitas-id-jp.vercel.app`.
4. Kembali ke Supabase → **Authentication → URL Configuration**: isi **Site URL** dengan alamat Vercel tadi (tambahkan juga di *Redirect URLs*).

Setiap kali Anda mengubah berkas dan melakukan *commit* ke GitHub, Vercel otomatis memperbarui situs.

## Langkah 4 — Atur akun admin

Di Supabase **SQL Editor**, daftarkan email admin (ganti alamat contoh dengan email Anda):
   ```sql
   insert into public.admin_allowlist (email)
   values (lower('EMAIL-ADMIN@contoh.com'))
   on conflict (email) do nothing;
   ```

Email dalam allowlist otomatis mendapat role admin saat mendaftar. Jika akun email tersebut sudah terdaftar, jalankan juga:
   ```sql
   update public.profiles set role = 'admin'
   where lower(email) = lower('EMAIL-ADMIN@contoh.com');
   ```

Pengguna baru yang login dengan Google atau mendaftar dengan email otomatis mendapat role anggota. Tidak perlu persetujuan admin. Email admin dalam allowlist tetap mendapat role admin.

## Langkah 5 — Pasang di HP

- **Android (Chrome):** buka situs → menu ⋮ → **Instal aplikasi** (atau *Tambahkan ke layar utama*).
- **iPhone (Safari):** tombol **Bagikan** → **Tambah ke Layar Utama**.

## Peran pengguna

| Peran | Bisa |
|---|---|
| Anggota | melihat data, absen (Hadir), forum, kirim pertanyaan ke admin |
| Admin | semuanya: kelola anggota, kegiatan, import, peta, pesan masuk |

## Mengatur nomor WhatsApp admin

Di `mascot.js`, isi `ADMIN_WA` (format `6281234567890`) agar tombol *Chat WhatsApp Admin* muncul.

## Catatan

- Foto diri dan surat sambung disimpan di bucket `media` yang **dapat dibuka lewat tautan** (nama berkas acak, tidak bisa ditebak). Unggah hanya oleh admin.
- Supabase paket gratis menjeda proyek yang tidak aktif seminggu; buka sekali di dashboard untuk mengaktifkan lagi.
- Pencarian daftar memakai batas 1000 baris per koleksi (cukup untuk komunitas ini).
- Fitur **Isi Otomatis** (butuh AI) tidak ada di versi ini.
- Data dari versi Artifact tidak pindah otomatis; masukkan lewat **Import Database** (CSV `nama,wilayah`) atau formulir.
