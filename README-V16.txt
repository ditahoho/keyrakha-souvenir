KEYRAKHA SOUVENIR V16 — Admin Roles & Experience Upgrade

Perubahan utama:
- Theme Manager ikut mengubah warna Admin/CMS setelah Save Changes.
- Preview Tema juga dapat dipreview langsung pada tampilan Admin tanpa menyimpan.
- Perbaikan badge harga hero yang sebelumnya menutup judul produk.
- Card produk desktop melakukan fade foto utama -> foto galeri saat hover.
- Menghapus tulisan versi internal dari UI backup/restore.
- Welcome screen setelah login: "Selamat datang, [nama]".
- Role Superadmin + Editor Produk.
- Superadmin dapat membuat user Editor Produk dan mengaktifkan/nonaktifkan akses.
- Editor Produk hanya dapat CRUD produk dan upload media produk; menu sensitif disembunyikan dan RLS tetap membatasi server-side.

WAJIB SEBELUM DEPLOY:
1. Jalankan 09-user-roles-v16-migration.sql satu kali di Supabase SQL Editor.
2. Di Vercel > Project > Settings > Environment Variables tambahkan:
   KEYRAKHA_SUPABASE_URL = Project URL Supabase
   KEYRAKHA_SUPABASE_PUBLISHABLE_KEY = Publishable key Supabase
   KEYRAKHA_SUPABASE_SERVICE_ROLE_KEY = Secret/service_role key Supabase
   PENTING: service_role hanya disimpan sebagai Environment Variable Vercel. JANGAN dimasukkan ke GitHub atau frontend.
3. Redeploy Vercel setelah environment variables tersimpan.
4. File js/supabase-config.js sengaja tidak disertakan dalam ZIP V16 agar konfigurasi production Anda tidak tertimpa.

Superadmin awal tetap admin@keyrakha.com.
User yang dibuat dari menu Pengguna & Akses mendapat role Editor Produk.
