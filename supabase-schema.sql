-- EComPrime schema (PostgreSQL / Supabase)
-- Apply in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  role text not null default 'customer' check (role in ('admin', 'seller', 'staff', 'cs', 'customer')),
  address text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  slug text unique not null,
  name text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2) check (original_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  rating numeric(3,2) not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_type text not null check (variant_type in ('size', 'color')),
  label text not null,
  value text not null,
  stock integer not null default 0 check (stock >= 0)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  profile_id uuid references public.profiles(id) on delete set null,
  customer_email text not null,
  customer_name text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'delivered', 'canceled')),
  subtotal numeric(10,2) not null default 0,
  shipping_cost numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  shipping_address text not null,
  city text not null,
  zip_code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  line_total numeric(10,2) not null check (line_total >= 0)
);

create table if not exists public.order_tracking (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null check (status in ('pending', 'paid', 'shipped', 'delivered', 'canceled')),
  label text not null,
  occurred_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  subject text not null,
  headline text not null,
  body text not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_tracking enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Public read catalog" on public.products;
create policy "Public read catalog"
on public.products for select
using (true);

drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories"
on public.categories for select
using (true);

drop policy if exists "Public read product images" on public.product_images;
create policy "Public read product images"
on public.product_images for select
using (true);

drop policy if exists "Public read product variants" on public.product_variants;
create policy "Public read product variants"
on public.product_variants for select
using (true);

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
using (auth.email() = email);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.email() = email)
with check (auth.email() = email);

drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders"
on public.orders for select
using (auth.email() = customer_email);

drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items"
on public.order_items for select
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.customer_email = auth.email()
  )
);

drop policy if exists "Users can view own tracking" on public.order_tracking;
create policy "Users can view own tracking"
on public.order_tracking for select
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_tracking.order_id
      and orders.customer_email = auth.email()
  )
);

-- Admin policies: service role or dedicated admin JWT claims should bypass via backend.
-- For quick start, administrative writes should be executed from secure server routes.
