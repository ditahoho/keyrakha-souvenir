-- V15 Production Security: role admin khusus
-- Jalankan satu kali setelah memastikan akun admin@keyrakha.com sudah ada di Authentication > Users.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

insert into public.admin_users (user_id, email)
select id, email from auth.users where lower(email) = 'admin@keyrakha.com'
on conflict (user_id) do update set email = excluded.email;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users a where a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Hapus policy lama yang memberi semua authenticated user hak admin.
drop policy if exists "Authenticated users can insert categories" on public.categories;
drop policy if exists "Authenticated users can update categories" on public.categories;
drop policy if exists "Authenticated users can delete categories" on public.categories;
drop policy if exists "Authenticated users can read all products" on public.products;
drop policy if exists "Authenticated users can insert products" on public.products;
drop policy if exists "Authenticated users can update products" on public.products;
drop policy if exists "Authenticated users can delete products" on public.products;
drop policy if exists "Authenticated users can update settings" on public.settings;

-- Policy admin yang baru.
drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories" on public.categories for insert to authenticated with check (public.is_admin());
drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories" on public.categories for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories" on public.categories for delete to authenticated using (public.is_admin());

drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products" on public.products for select to authenticated using (public.is_admin());
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products" on public.products for insert to authenticated with check (public.is_admin());
drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products for delete to authenticated using (public.is_admin());

drop policy if exists "Admins can update settings" on public.settings;
create policy "Admins can update settings" on public.settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Storage: hanya admin yang boleh mengubah foto produk.
drop policy if exists "Authenticated users can upload product images" on storage.objects;
drop policy if exists "Authenticated users can update product images" on storage.objects;
drop policy if exists "Authenticated users can delete product images" on storage.objects;
drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects for insert to authenticated with check (bucket_id='products' and public.is_admin());
drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images" on storage.objects for update to authenticated using (bucket_id='products' and public.is_admin()) with check (bucket_id='products' and public.is_admin());
drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images" on storage.objects for delete to authenticated using (bucket_id='products' and public.is_admin());
