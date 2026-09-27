-- Run after schema.sql. Safe to rerun; existing restaurant data is preserved.
begin;

-- Create the restaurant and its owner membership atomically. Clients cannot
-- claim arbitrary restaurants by inserting their own membership anymore.
drop policy if exists "Authenticated users can create restaurants" on public.restaurants;
drop policy if exists "Users can create own restaurant membership" on public.restaurant_users;

create or replace function public.create_restaurant(p_name text, p_slug text, p_whatsapp text)
returns public.restaurants
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_restaurant public.restaurants;
begin
  if auth.uid() is null then raise exception 'Sign in to create a restaurant'; end if;
  if length(trim(p_name)) = 0 or p_name is null
    or p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    or p_slug in ('dashboard','login','signup','api','auth','demo-restaurant')
    or p_whatsapp is null or p_whatsapp !~ '^\+?[0-9]{7,15}$' then
    raise exception 'Enter a restaurant name, valid menu URL and international WhatsApp number';
  end if;
  insert into public.restaurants (name, slug, whatsapp_number)
  values (trim(p_name), p_slug, p_whatsapp) returning * into new_restaurant;
  insert into public.restaurant_users (restaurant_id, user_id, role)
  values (new_restaurant.id, auth.uid(), 'owner');
  return new_restaurant;
end;
$$;
revoke all on function public.create_restaurant(text,text,text) from public, anon;
grant execute on function public.create_restaurant(text,text,text) to authenticated;

drop policy if exists "Members can read their inactive restaurants" on public.restaurants;
create policy "Members can read their inactive restaurants" on public.restaurants
for select to authenticated using (
  exists (select 1 from public.restaurant_users ru where ru.restaurant_id = restaurants.id and ru.user_id = auth.uid())
);

-- Ensure a product's category belongs to the same restaurant, even for direct API writes.
create or replace function public.check_product_category()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.category_id is not null and not exists (
    select 1 from public.categories c where c.id = new.category_id and c.restaurant_id = new.restaurant_id
  ) then raise exception 'Category must belong to this restaurant'; end if;
  return new;
end;
$$;
drop trigger if exists check_product_category on public.products;
create trigger check_product_category before insert or update on public.products
for each row execute function public.check_product_category();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('restaurant-media', 'restaurant-media', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Public URLs serve menu photos. Writes are limited to a member's restaurant folder.
drop policy if exists "Members upload restaurant media" on storage.objects;
create policy "Members upload restaurant media" on storage.objects for insert to authenticated
with check (bucket_id = 'restaurant-media' and exists (
  select 1 from public.restaurant_users ru where ru.user_id = auth.uid()
    and ru.restaurant_id::text = (storage.foldername(name))[1]
));
drop policy if exists "Members read restaurant media" on storage.objects;
create policy "Members read restaurant media" on storage.objects for select to authenticated
using (bucket_id = 'restaurant-media' and exists (
  select 1 from public.restaurant_users ru where ru.user_id = auth.uid()
    and ru.restaurant_id::text = (storage.foldername(name))[1]
));
drop policy if exists "Members remove restaurant media" on storage.objects;
create policy "Members remove restaurant media" on storage.objects for delete to authenticated
using (bucket_id = 'restaurant-media' and exists (
  select 1 from public.restaurant_users ru where ru.user_id = auth.uid()
    and ru.restaurant_id::text = (storage.foldername(name))[1]
));
commit;
