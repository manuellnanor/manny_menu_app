-- Initial setup only. After this file, run migrations/20260927_restaurant_dashboard.sql
-- to enable dashboard uploads and secure restaurant ownership creation.
create extension if not exists "uuid-ossp";

create table if not exists public.restaurants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  cover_url text,
  whatsapp_number text not null,
  currency text not null default 'GHS',
  primary_color text not null default '#18181b',
  secondary_color text not null default '#ffffff',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.restaurant_users (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  unique (restaurant_id, user_id)
);

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  price numeric(12,2) not null default 0,
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  order_number text not null,
  customer_name text not null,
  customer_phone text not null,
  subtotal numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  payment_method text not null default 'whatsapp',
  payment_status text not null default 'unpaid',
  order_status text not null default 'pending',
  order_type text not null default 'pickup',
  delivery_address text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0
);

alter table public.restaurants enable row level security;
alter table public.restaurant_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Public can read active restaurants"
on public.restaurants
for select
using (is_active = true);

create policy "Public can read active categories"
on public.categories
for select
using (is_active = true);

create policy "Public can read available products"
on public.products
for select
using (is_available = true);

create policy "Authenticated users can create restaurants"
on public.restaurants
for insert
to authenticated
with check (true);

create policy "Users can read own restaurant memberships"
on public.restaurant_users
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can create own restaurant membership"
on public.restaurant_users
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Restaurant members can update their restaurant"
on public.restaurants
for update
to authenticated
using (
  exists (
    select 1
    from public.restaurant_users ru
    where ru.restaurant_id = restaurants.id
      and ru.user_id = auth.uid()
  )
);

create policy "Restaurant members can manage categories"
on public.categories
for all
to authenticated
using (
  exists (
    select 1
    from public.restaurant_users ru
    where ru.restaurant_id = categories.restaurant_id
      and ru.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurant_users ru
    where ru.restaurant_id = categories.restaurant_id
      and ru.user_id = auth.uid()
  )
);

create policy "Restaurant members can manage products"
on public.products
for all
to authenticated
using (
  exists (
    select 1
    from public.restaurant_users ru
    where ru.restaurant_id = products.restaurant_id
      and ru.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurant_users ru
    where ru.restaurant_id = products.restaurant_id
      and ru.user_id = auth.uid()
  )
);

-- Public checkout requires server-side inserts. In production, use the service role
-- inside a protected server route or write a security-definer database function.
-- These policies intentionally do not expose public insert access to orders.
