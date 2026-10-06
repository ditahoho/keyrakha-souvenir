KEYRAKHA SOUVENIR V7 - SUPABASE READY
======================================

1. Buka file:
   js/supabase-config.js

2. Ganti:
   TEMPEL_PROJECT_URL_DI_SINI
   dengan Project URL dari Supabase.

3. Ganti:
   TEMPEL_PUBLISHABLE_KEY_DI_SINI
   dengan Publishable Key (sb_publishable_...) dari Supabase.

4. JANGAN pernah memasukkan Secret Key / service_role ke project frontend.

5. Pastikan Data API Supabase mengekspos tabel:
   - categories
   - products
   - settings

6. Karena tabel products masih kosong, katalog akan menampilkan empty state sampai produk dibuat.

Fitur V7:
- Settings (WhatsApp/alamat/about) dibaca dari Supabase.
- Katalog dibaca dari tabel products + categories.
- Filter kategori dibuat dari tabel categories.
- Detail produk membaca products berdasarkan ?id=.
- Produk terkait diambil berdasarkan category_id.
- Featured products homepage diambil dari products dengan featured=true.
- image_url akan menampilkan foto asli dari Supabase Storage bila tersedia.
