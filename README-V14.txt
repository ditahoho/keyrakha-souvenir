KEYRAKHA SOUVENIR — V14 THEME MANAGER

Fitur baru:
- Theme Manager di Admin > Pengaturan Website.
- 40 preset tema + 1 Custom.
- Tema tidak langsung diterapkan saat dipilih.
- Klik "Preview Tema" untuk melihat simulasi di Admin.
- Website publik baru berubah setelah "Simpan Pengaturan".
- Custom Theme menyediakan color picker untuk Primary, Secondary, Accent, Background, Surface, Text, dan Muted.
- Tema tersimpan di tabel settings Supabase dan otomatis dipakai seluruh halaman publik setelah refresh.

WAJIB SEBELUM MENGGUNAKAN V14:
1. Supabase > SQL Editor > New Query.
2. Jalankan file 07-theme-manager-v14-migration.sql satu kali.
3. Upload file V14 ke GitHub main.
4. PERTAHANKAN js/supabase-config.js milik website production Anda jika file V14 masih berisi placeholder.
5. Tunggu Vercel selesai redeploy.

Default theme V14: Earth Tone, yang mempertahankan karakter Cognac + Olive + Ivory dari desain sebelumnya.
