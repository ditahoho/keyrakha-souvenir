-- V13: multiple product images stored as JSON array on products
alter table public.products
add column if not exists gallery_urls jsonb not null default '[]'::jsonb;

-- Normalize any null values just in case.
update public.products set gallery_urls = '[]'::jsonb where gallery_urls is null;
