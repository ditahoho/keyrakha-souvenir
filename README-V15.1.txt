V15.1 Hotfix

Memperbaiki:
- Admin dashboard tidak memuat data pada /admin karena admin.js memakai relative path.
- Clean URL Vercel + cleanUrls menggunakan destination tanpa .html.
- Asset CSS/JS memakai absolute path agar halaman /produk/:slug tetap memuat asset dengan benar.

Tidak ada migration SQL baru.
Pertahankan js/supabase-config.js production Anda.
