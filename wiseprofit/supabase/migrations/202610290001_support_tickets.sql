-- WiseProfit support tickets and replies. Apply in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.support_tickets (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 user_email text,
 category text not null check (char_length(category) <= 80),
 subject text not null check (char_length(trim(subject)) between 1 and 120),
 detail text not null check (char_length(trim(detail)) between 1 and 3000),
 status text not null default 'open' check (status in ('open','in_progress','waiting_user','resolved','closed')),
 priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
 ai_summary text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.support_messages (
 id uuid primary key default gen_random_uuid(),
 ticket_id uuid not null references public.support_tickets(id) on delete cascade,
 sender_id uuid references auth.users(id) on delete set null,
 sender_role text not null check (sender_role in ('user','developer','ai','system')),
 body text not null check (char_length(trim(body)) between 1 and 5000),
 created_at timestamptz not null default now()
);
create index if not exists support_tickets_user_created_idx on public.support_tickets(user_id, created_at desc);
create index if not exists support_tickets_status_created_idx on public.support_tickets(status, created_at desc);
create index if not exists support_messages_ticket_created_idx on public.support_messages(ticket_id, created_at asc);
create or replace function public.set_support_ticket_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists support_tickets_updated_at on public.support_tickets;
create trigger support_tickets_updated_at before update on public.support_tickets for each row execute function public.set_support_ticket_updated_at();
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
drop policy if exists "ticket owners and support admins can read tickets" on public.support_tickets;
create policy "ticket owners and support admins can read tickets" on public.support_tickets for select to authenticated
using (auth.uid() = user_id or (auth.jwt() -> 'app_metadata' ->> 'role') = 'support_admin');
drop policy if exists "signed-in users can create own tickets" on public.support_tickets;
create policy "signed-in users can create own tickets" on public.support_tickets for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "support admins can update tickets" on public.support_tickets;
create policy "support admins can update tickets" on public.support_tickets for update to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'support_admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'support_admin');
drop policy if exists "ticket participants can read messages" on public.support_messages;
create policy "ticket participants can read messages" on public.support_messages for select to authenticated
using (exists (select 1 from public.support_tickets t where t.id = ticket_id and (t.user_id = auth.uid() or (auth.jwt() -> 'app_metadata' ->> 'role') = 'support_admin')));
drop policy if exists "ticket owners can send messages" on public.support_messages;
create policy "ticket owners can send messages" on public.support_messages for insert to authenticated
with check (sender_role = 'user' and sender_id = auth.uid() and exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid()));
drop policy if exists "support admins can reply" on public.support_messages;
create policy "support admins can reply" on public.support_messages for insert to authenticated
with check (sender_role = 'developer' and sender_id = auth.uid() and (auth.jwt() -> 'app_metadata' ->> 'role') = 'support_admin');
