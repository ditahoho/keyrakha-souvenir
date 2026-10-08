KEYRAKHA V17 - Accessibility + Social Preview

Perubahan: lima halaman publik, css/accessibility.css, js/accessibility.js, assets/og-keyrakha-v17.png. Admin/CMS/API/SQL tidak diubah.

PENTING: Pastikan domain keyrakha.com sudah terhubung dan HTTPS aktif di Vercel sebelum deploy, karena canonical/OG/schema URL kini memakai domain tersebut. Bila domain belum aktif, gunakan domain Vercel dahulu dalam metadata.

Catatan: File js/supabase-config.js tidak ada dalam ZIP V16 yang diunggah; pertahankan file konfigurasi yang sudah berjalan di repo/deployment. Jangan simpan secret/service-role di frontend.

Uji: halaman publik desktop/mobile; panel aksesibilitas, keyboard/Escape, reload untuk preferensi; gambar preview dengan debugger sosial; login superadmin/editor dan CRUD produk. Tidak ada SQL migration.
