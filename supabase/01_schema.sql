-- 富地房屋：資料表、存取規則（RLS）、照片儲存空間
-- 在 Supabase Dashboard → SQL Editor 貼上整份執行一次。可重複執行（已存在的物件會略過或覆蓋）。

-- ─────────────────────────────────────────────
-- 1. 員工名單：只有名單內的帳號能管理物件
-- ─────────────────────────────────────────────
create table if not exists public.staff (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.staff enable row level security;

drop policy if exists "staff can read own row" on public.staff;
create policy "staff can read own row" on public.staff
  for select to authenticated
  using (user_id = (select auth.uid()));

-- security definer：讓 RLS 判斷時能讀 staff 表，但呼叫者本身不需要 staff 表的權限
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

-- ─────────────────────────────────────────────
-- 2. 物件
-- ─────────────────────────────────────────────
create table if not exists public.listings (
  id               uuid primary key default gen_random_uuid(),
  title            text not null check (char_length(btrim(title)) between 1 and 100),
  community_name   text,
  city             text not null,
  district         text not null,
  address          text not null default '',
  total_price      numeric(10, 1) not null check (total_price > 0),      -- 萬元
  registered_area  numeric(8, 2)  not null check (registered_area > 0),  -- 權狀坪數
  main_area        numeric(8, 2)  not null default 0,                    -- 主建物坪數
  rooms            smallint not null default 0,
  living_rooms     smallint not null default 0,
  bathrooms        smallint not null default 0,
  floor            smallint not null default 0,
  total_floors     smallint not null default 0,
  age              smallint not null default 0,
  building_type    text not null check (building_type in ('電梯大樓', '華廈', '公寓', '透天厝', '套房', '店面')),
  parking          text not null default '無' check (parking in ('無', '坡道平面', '機械', '其他')),
  management_fee   integer,                                               -- 元/月
  facing           text,
  tags             text[] not null default '{}',
  description      text not null default '',
  photos           text[] not null default '{}',
  contact_name     text not null default '',
  contact_phone    text not null default '',
  contact_line_id  text,
  status           text not null default '下架' check (status in ('上架', '下架', '已成交')),
  featured         boolean not null default false,
  views            integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists listings_status_created_idx on public.listings (status, created_at desc);

-- 內容有變才更新 updated_at；只有瀏覽數變動時不動（避免「最新」排序被瀏覽數打亂）
create or replace function public.listings_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (to_jsonb(new) - 'views' - 'updated_at') is distinct from (to_jsonb(old) - 'views' - 'updated_at') then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists listings_touch_updated_at on public.listings;
create trigger listings_touch_updated_at
  before update on public.listings
  for each row execute function public.listings_touch_updated_at();

alter table public.listings enable row level security;

-- 所有人（含未登入客戶）只看得到「上架」；員工看得到全部
drop policy if exists "public reads live listings" on public.listings;
create policy "public reads live listings" on public.listings
  for select to anon, authenticated
  using (status = '上架' or (select public.is_staff()));

drop policy if exists "staff inserts listings" on public.listings;
create policy "staff inserts listings" on public.listings
  for insert to authenticated
  with check ((select public.is_staff()));

drop policy if exists "staff updates listings" on public.listings;
create policy "staff updates listings" on public.listings
  for update to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));

drop policy if exists "staff deletes listings" on public.listings;
create policy "staff deletes listings" on public.listings
  for delete to authenticated
  using ((select public.is_staff()));

-- 瀏覽數 +1：客戶沒有 update 權限，所以走這支函式，而且只能對上架物件加 1
create or replace function public.increment_listing_views(listing_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.listings set views = views + 1 where id = listing_id and status = '上架';
$$;

revoke all on function public.increment_listing_views(uuid) from public;
grant execute on function public.increment_listing_views(uuid) to anon, authenticated;

-- ─────────────────────────────────────────────
-- 3. 照片儲存空間（公開讀取，只有員工能上傳／刪除）
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "staff uploads listing photos" on storage.objects;
create policy "staff uploads listing photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'listing-photos' and (select public.is_staff()));

drop policy if exists "staff updates listing photos" on storage.objects;
create policy "staff updates listing photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'listing-photos' and (select public.is_staff()));

drop policy if exists "staff deletes listing photos" on storage.objects;
create policy "staff deletes listing photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'listing-photos' and (select public.is_staff()));
