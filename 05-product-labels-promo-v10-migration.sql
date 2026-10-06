-- Keyrakha Souvenir V10
-- Tambahan label produk dan fitur promo

alter table public.products
  add column if not exists best_seller boolean not null default false,
  add column if not exists is_new boolean not null default false,
  add column if not exists promo_enabled boolean not null default false,
  add column if not exists promo_price numeric(12,2),
  add column if not exists promo_start date,
  add column if not exists promo_end date;

-- Validasi harga promo agar tidak negatif.
alter table public.products drop constraint if exists products_promo_price_nonnegative;
alter table public.products add constraint products_promo_price_nonnegative
  check (promo_price is null or promo_price >= 0);

-- Validasi periode promo.
alter table public.products drop constraint if exists products_promo_period_valid;
alter table public.products add constraint products_promo_period_valid
  check (promo_start is null or promo_end is null or promo_end >= promo_start);
