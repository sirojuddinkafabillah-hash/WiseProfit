# WiseProfit — migrasi Supabase

## Perubahan di arsip ini
- Nama aplikasi dan paket diubah menjadi **WiseProfit**.
- Login email/password dan OAuth Google menggunakan **Supabase Auth**.
- Data profil/modal awal, inventori, dan penarikan menggunakan **Supabase PostgreSQL**.
- Pembaruan real-time inventori dan penarikan menggunakan Supabase Realtime.
- Kebijakan Row Level Security (RLS) membatasi baris berdasarkan `auth.uid()`.
- Kode Firebase, konfigurasi Firebase, Firestore rules, server Express lama, dan kode MongoDB lama dihapus dari paket.
- Arsip ini tidak menyertakan file backup data toko atau file ZIP bersarang.

## Setup yang wajib dilakukan
1. Buka Supabase project yang sudah ada.
2. Buka **SQL Editor**, jalankan seluruh isi `supabase/schema.sql`.
3. Di **Authentication → Providers**, aktifkan Email. Untuk Google login, aktifkan Google provider dan lengkapi OAuth credentials.
4. Di **Authentication → URL Configuration**, tambahkan URL lokal dan URL Vercel ke Redirect URLs.
5. Deploy aplikasi sebagai proyek Vite dan atur environment variables `VITE_SUPABASE_URL` serta `VITE_SUPABASE_PUBLISHABLE_KEY`. Nilai publishable key dapat berada di frontend; jangan pernah menaruh secret/service-role key di frontend.

## Batasan yang perlu diketahui
- Akun Firebase lama tidak otomatis berpindah ke Supabase Auth. Pengguna harus membuat akun Supabase atau login melalui provider yang telah dikonfigurasi.
- MFA lama dari Firebase belum dimigrasikan. Jika MFA diperlukan, konfigurasi dan uji melalui Supabase Auth.
- Reset kata sandi memerlukan konfigurasi email Supabase.
- Build produksi belum dapat dijalankan di lingkungan persiapan ini karena dependensi npm tidak tersedia dan akses registry npm mengalami timeout. Jalankan `npm install` dan `npm run build` sebelum deployment.
