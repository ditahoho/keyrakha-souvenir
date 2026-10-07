-- V16 - Superadmin + Product Editor roles
-- Run once in Supabase SQL Editor after V15 security migration.

alter table public.admin_users
  add column if not exists name text,
  add column if not exists role text not null default 'editor',
  add column if not exists active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

alter table public.admin_users drop constraint if exists admin_users_role_check;
alter table public.admin_users
  add constraint admin_users_role_check check (role in ('superadmin','editor'));

update public.admin_users
set
  name = coalesce(nullif(name,''), split_part(email,'@',1)),
  role = case when lower(email) = 'admin@keyrakha.com' then 'superadmin' else coalesce(role,'editor') end,
  active = true,
  updated_at = now()
where user_id is not null;

create or replace function public.get_admin_profile()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'user_id', a.user_id,
    'email', a.email,
    'name', coalesce(nullif(a.name,''), split_part(a.email,'@',1)),
    'role', a.role,
    'active', a.active
  )
  from public.admin_users a
  where a.user_id = auth.uid() and a.active = true
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.active = true and a.role in ('superadmin','editor')
  );
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.active = true and a.role = 'superadmin'
  );
$$;

revoke all on function public.get_admin_profile() from public;
revoke all on function public.is_admin() from public;
revoke all on function public.is_superadmin() from public;
grant execute on function public.get_admin_profile() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_superadmin() to authenticated;

-- admin_users: user can see own profile; superadmin can manage access records.
drop policy if exists "Admin users can read own profile" on public.admin_users;
create policy "Admin users can read own profile"
on public.admin_users for select to authenticated
using (user_id = auth.uid() or public.is_superadmin());

drop policy if exists "Superadmin can insert admin users" on public.admin_users;
create policy "Superadmin can insert admin users"
on public.admin_users for insert to authenticated
with check (public.is_superadmin());

drop policy if exists "Superadmin can update admin users" on public.admin_users;
create policy "Superadmin can update admin users"
on public.admin_users for update to authenticated
using (public.is_superadmin()) with check (public.is_superadmin());

drop policy if exists "Superadmin can delete admin users" on public.admin_users;
create policy "Superadmin can delete admin users"
on public.admin_users for delete to authenticated
using (public.is_superadmin());

-- Products: superadmin and editor may CRUD products.
drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products" on public.products for select to authenticated using (public.is_admin());
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products" on public.products for insert to authenticated with check (public.is_admin());
drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products for delete to authenticated using (public.is_admin());

-- Categories and website settings: superadmin only.
drop policy if exists "Admins can insert categories" on public.categories;
drop policy if exists "Admins can update categories" on public.categories;
drop policy if exists "Admins can delete categories" on public.categories;
drop policy if exists "Superadmins can insert categories" on public.categories;
create policy "Superadmins can insert categories" on public.categories for insert to authenticated with check (public.is_superadmin());
drop policy if exists "Superadmins can update categories" on public.categories;
create policy "Superadmins can update categories" on public.categories for update to authenticated using (public.is_superadmin()) with check (public.is_superadmin());
drop policy if exists "Superadmins can delete categories" on public.categories;
create policy "Superadmins can delete categories" on public.categories for delete to authenticated using (public.is_superadmin());

drop policy if exists "Admins can update settings" on public.settings;
drop policy if exists "Superadmins can update settings" on public.settings;
create policy "Superadmins can update settings" on public.settings for update to authenticated using (public.is_superadmin()) with check (public.is_superadmin());

-- Product images: both superadmin and editor may manage product media.
drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects for insert to authenticated with check (bucket_id='products' and public.is_admin());
drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images" on storage.objects for update to authenticated using (bucket_id='products' and public.is_admin()) with check (bucket_id='products' and public.is_admin());
drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images" on storage.objects for delete to authenticated using (bucket_id='products' and public.is_admin());
