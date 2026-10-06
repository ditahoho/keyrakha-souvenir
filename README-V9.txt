KEYRAKHA SOUVENIR — V9 ADMIN CMS
=================================

BARU DI V9
- Modal Tambah/Edit Produk sekarang selalu berada di tengah layar.
- CRUD Kategori dari Admin.
- Pengaturan Website dari Admin:
  * Nama bisnis
  * Hero title & description
  * Tentang Kami
  * WhatsApp
  * Pesan WhatsApp default
  * Email
  * Alamat
  * Instagram
  * TikTok
  * Facebook
- Alamat halaman Contact dan Google Maps mengikuti Settings.
- Hero homepage, About, footer, kontak, dan sosial membaca data Supabase.

PENTING — JALANKAN MIGRATION SEKALI
1. Supabase > SQL Editor > New query.
2. Buka file: 04-settings-v9-migration.sql
3. Copy seluruh SQL dan klik Run.
4. Setelah Success, buka admin/index.html dan refresh.

KONFIGURASI SUPABASE
Pastikan js/supabase-config.js berisi Project URL + Publishable Key milik Anda.
JANGAN gunakan Secret Key / service_role di browser.

ADMIN
Buka: admin/login.html
Login memakai akun Supabase Authentication yang sudah dibuat.
