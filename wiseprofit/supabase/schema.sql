-- WiseProfit Supabase schema. Run this file in Supabase Dashboard > SQL Editor.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  modal_awal numeric not null default 50000 check (modal_awal >= 0),
  global_save_percent_monthly numeric not null default 50 check (global_save_percent_monthly between 0 and 100),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  primary key (user_id, id)
);

create table if not exists public.withdrawals (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  primary key (user_id, id)
);

alter table public.profiles enable row level security;
alter table public.inventory_items enable row level security;
alter table public.withdrawals enable row level security;

drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile" on public.profiles for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users manage own inventory" on public.inventory_items;
create policy "Users manage own inventory" on public.inventory_items for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users manage own withdrawals" on public.withdrawals;
create policy "Users manage own withdrawals" on public.withdrawals for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.inventory_items to authenticated;
grant select, insert, update, delete on public.withdrawals to authenticated;

-- Enable Postgres Changes so the app can subscribe to inventory and withdrawals.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'inventory_items') then
    alter publication supabase_realtime add table public.inventory_items;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'withdrawals') then
    alter publication supabase_realtime add table public.withdrawals;
  end if;
end $$;
