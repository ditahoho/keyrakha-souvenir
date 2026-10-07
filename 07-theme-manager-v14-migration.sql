-- V14 Theme Manager
-- Jalankan satu kali di Supabase SQL Editor.

alter table public.settings
  add column if not exists theme_preset text not null default 'earth-tone',
  add column if not exists theme_primary text default '#55624A',
  add column if not exists theme_secondary text default '#7B6B57',
  add column if not exists theme_accent text default '#A85F38',
  add column if not exists theme_background text default '#FAF7F2',
  add column if not exists theme_surface text default '#E8E1D8',
  add column if not exists theme_text text default '#29201C',
  add column if not exists theme_muted text default '#766B61';

update public.settings
set
  theme_preset = coalesce(theme_preset, 'earth-tone'),
  theme_primary = coalesce(theme_primary, '#55624A'),
  theme_secondary = coalesce(theme_secondary, '#7B6B57'),
  theme_accent = coalesce(theme_accent, '#A85F38'),
  theme_background = coalesce(theme_background, '#FAF7F2'),
  theme_surface = coalesce(theme_surface, '#E8E1D8'),
  theme_text = coalesce(theme_text, '#29201C'),
  theme_muted = coalesce(theme_muted, '#766B61');
