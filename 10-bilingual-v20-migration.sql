-- V20: non-destructive bilingual content columns. Run once in Supabase SQL Editor.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_title_en text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_description_en text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS about_en text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name_en text;
