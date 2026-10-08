KEYRAKHA V20 - CMS BILINGUAL MANUAL (ID/EN)

1. Backup database first.
2. Run 10-bilingual-v20-migration.sql in Supabase SQL Editor BEFORE deploying.
3. Deploy files to GitHub; preserve existing js/supabase-config.js.
4. CMS > Produk: fill English name and description separately. CMS > Pengaturan: fill English hero title, hero description, About.
5. Public website uses *_en fields when EN selected, falls back to Indonesian if English field empty.
6. No external translation API. Translations are manually authored and edited.
7. This build does not guarantee 100% translation of every dynamic message, category or accessibility UI; those require further end-to-end review.
8. Validate Admin product CRUD, theme, accessibility, role permissions after deployment.
