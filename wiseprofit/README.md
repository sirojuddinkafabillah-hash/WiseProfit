# WiseProfit

Aplikasi web untuk pengelolaan barang dagangan, laba, ekuitas, arus kas, dan penarikan kas. Frontend menggunakan React + Vite; autentikasi dan penyimpanan cloud menggunakan Supabase Auth + PostgreSQL.

## Menjalankan lokal

1. Install Node.js 22 atau versi LTS yang kompatibel.
2. Salin `.env.example` menjadi `.env.local`.
3. Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` dari Supabase Dashboard. Publishable key aman digunakan pada browser, tetapi bukan pengganti kebijakan RLS.
4. Buka Supabase Dashboard → SQL Editor, lalu jalankan seluruh isi `supabase/schema.sql`.
5. Di Authentication → Providers, aktifkan Email. Untuk login Google, aktifkan Google provider dan isi OAuth credentials. Di Authentication → URL Configuration, tambahkan URL lokal/deployment ke Site URL dan Redirect URLs.
6. Jalankan `npm install`, lalu `npm run dev`.

## Deploy ke Vercel

Import repository WiseProfit ke Vercel, pilih framework Vite, dan tambahkan environment variables `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY`. Deploy ulang setelah mengatur environment variables.

## Data dan keamanan

- Tabel `profiles`, `inventory_items`, dan `withdrawals` memiliki Row Level Security (RLS) dengan kebijakan berbasis `auth.uid()`.
- Jangan pernah menaruh Supabase Secret/service-role key di frontend atau repository.
- Firebase dan jalur penyimpanan MongoDB lama dihapus dari konfigurasi proyek ini. Akun Firebase yang sudah ada tidak otomatis menjadi akun Supabase; pengguna perlu mendaftar/masuk melalui Supabase.
- MFA Firebase lama belum dimigrasikan. Aktifkan dan uji MFA di Supabase Auth jika diperlukan.
- Data cadangan lokal tidak disertakan dalam arsip sumber publik.
