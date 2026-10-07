KEYRAKHA SOUVENIR — V15 PRODUCTION READY

Fitur utama V15:
- Clean URL: /produk, /produk/nama-produk, /tentang, /kontak, /admin.
- Dashboard admin lebih informatif.
- Export produk ke CSV.
- Backup JSON + restore/merge sederhana.
- Role admin khusus via tabel admin_users + function is_admin().
- Policy RLS/Storage diperketat: authenticated biasa tidak otomatis menjadi admin.
- Halaman 404 custom.
- Loading bar dan polish responsif/mobile.

WAJIB SEBELUM UPLOAD KE GITHUB:
1. Jalankan 08-admin-role-security-v15-migration.sql SATU KALI di Supabase SQL Editor.
2. Pastikan akun admin@keyrakha.com sudah ada di Authentication > Users sebelum migration dijalankan.
3. Setelah migration sukses, logout lalu login ulang ke /admin untuk memastikan role admin aktif.
4. Jangan menimpa js/supabase-config.js production jika ZIP masih berisi placeholder.

CATATAN CLEAN URL:
- Vercel membaca vercel.json dan menangani rewrite/redirect.
- URL lama seperti /products.html diarahkan ke /produk.
- Link produk baru berbentuk /produk/slug-produk.

BACKUP:
- CSV untuk arsip/Excel.
- JSON menyimpan kategori, produk, dan settings.
- Restore bersifat merge/upsert berdasarkan slug, bukan menghapus semua data.
