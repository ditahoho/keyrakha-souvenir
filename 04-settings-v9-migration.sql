-- Jalankan sekali di Supabase SQL Editor sebelum memakai semua field Pengaturan Website V9.
-- Query ini aman dijalankan ulang karena menggunakan IF NOT EXISTS.

alter table public.settings
  add column if not exists whatsapp_message text,
  add column if not exists facebook text,
  add column if not exists tiktok text;

update public.settings
set whatsapp_message = coalesce(whatsapp_message, 'Halo Keyrakha Souvenir, saya ingin bertanya mengenai produk souvenir.')
where whatsapp_message is null;
