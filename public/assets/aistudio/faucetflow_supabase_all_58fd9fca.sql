-- FaucetFlow schema for Supabase PostgreSQL.
-- Run this in Supabase SQL Editor. Test with non-production reward values first.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.balances (
  user_id uuid not null references auth.users(id) on delete cascade,
  coin text not null check (coin in ('BTC','LTC','DOGE','USDT')),
  amount numeric(28,12) not null default 0 check (amount >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, coin)
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coin text not null check (coin in ('BTC','LTC','DOGE','USDT')),
  amount numeric(28,12) not null check (amount > 0),
  claimed_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.balances enable row level security;
alter table public.claims enable row level security;

drop policy if exists "profiles are viewable by owner" on public.profiles;
create policy "profiles are viewable by owner" on public.profiles
for select to authenticated using (auth.uid() = id);

drop policy if exists "balances are viewable by owner" on public.balances;
create policy "balances are viewable by owner" on public.balances
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "claims are viewable by owner" on public.claims;
create policy "claims are viewable by owner" on public.claims
for select to authenticated using (auth.uid() = user_id);

-- No client insert/update/delete policies are intentionally provided for balances or claims.
-- All reward mutations must go through the SECURITY DEFINER RPC below.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  safe_username text;
begin
  safe_username := nullif(trim(new.raw_user_meta_data ->> 'username'), '');
  insert into public.profiles (id, username)
  values (new.id, safe_username)
  on conflict (id) do nothing;

  insert into public.balances (user_id, coin, amount)
  values
    (new.id, 'BTC', 0),
    (new.id, 'LTC', 0),
    (new.id, 'DOGE', 0),
    (new.id, 'USDT', 0)
  on conflict (user_id, coin) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- SECURITY NOTE: This uses deliberately tiny DEMO rewards and a 60-second cooldown.
-- Set real amounts only after defining funding, abuse prevention, legal/tax and payout policies.
create or replace function public.claim_reward(p_coin text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  reward numeric(28,12);
  last_claim timestamptz;
begin
  if uid is null then
    raise exception 'Please sign in before claiming.';
  end if;
  if p_coin not in ('BTC','LTC','DOGE','USDT') then
    raise exception 'Unsupported coin.';
  end if;

  -- Serializes claim attempts for the same user to prevent cooldown race conditions.
  perform pg_advisory_xact_lock(hashtextextended(uid::text || ':' || p_coin, 0));

  select max(claimed_at) into last_claim
  from public.claims where user_id = uid and coin = p_coin;

  if last_claim is not null and last_claim > now() - interval '60 seconds' then
    raise exception 'Please wait before making another claim for this coin.';
  end if;

  reward := case p_coin
    when 'BTC' then 0.00000001
    when 'LTC' then 0.00000100
    when 'DOGE' then 0.00001000
    when 'USDT' then 0.00010000
  end;

  insert into public.balances(user_id, coin, amount)
  values(uid, p_coin, reward)
  on conflict(user_id, coin)
  do update set amount = public.balances.amount + excluded.amount, updated_at = now();

  insert into public.claims(user_id, coin, amount) values(uid, p_coin, reward);
  return jsonb_build_object('coin', p_coin, 'amount', reward, 'claimed_at', now());
end;
$$;

revoke all on function public.claim_reward(text) from public;
grant execute on function public.claim_reward(text) to authenticated;

grant select on public.profiles, public.balances, public.claims to authenticated;
-- IMPORTANT: Do not expose the Supabase service-role key in client code.

-- Admin panel access controls. Run this section after the base schema.
-- Promote an administrator manually using the SQL shown in README.md.
create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_roles enable row level security;

drop policy if exists "admins can read their own role" on public.admin_roles;
create policy "admins can read their own role" on public.admin_roles
for select to authenticated using (auth.uid() = user_id);
grant select on public.admin_roles to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_roles ar where ar.user_id = auth.uid()
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Existing owner-only read policies are replaced with owner OR admin policies.
drop policy if exists "profiles are viewable by owner" on public.profiles;
drop policy if exists "profiles are viewable by owner or admin" on public.profiles;
create policy "profiles are viewable by owner or admin" on public.profiles
for select to authenticated using (auth.uid() = id or public.is_admin());

drop policy if exists "balances are viewable by owner" on public.balances;
drop policy if exists "balances are viewable by owner or admin" on public.balances;
create policy "balances are viewable by owner or admin" on public.balances
for select to authenticated using (auth.uid() = user_id or public.is_admin());

drop policy if exists "claims are viewable by owner" on public.claims;
drop policy if exists "claims are viewable by owner or admin" on public.claims;
create policy "claims are viewable by owner or admin" on public.claims
for select to authenticated using (auth.uid() = user_id or public.is_admin());

-- Return auth email to the admin UI only after checking the caller's role.
create or replace function public.admin_list_users()
returns table (id uuid, email text, username text, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;
  return query
    select u.id, u.email::text, p.username, u.created_at
    from auth.users u
    left join public.profiles p on p.id = u.id
    order by u.created_at desc
    limit 1000;
end;
$$;
revoke all on function public.admin_list_users() from public;
grant execute on function public.admin_list_users() to authenticated;


-- Secure admin activity logging (run after the existing FaucetFlow schema).
create table if not exists public.admin_activity_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('dashboard_view','users_view','claims_view','activity_logs_view','data_refresh')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_logs_created_at_idx
  on public.admin_activity_logs (created_at desc);
create index if not exists admin_activity_logs_actor_idx
  on public.admin_activity_logs (actor_user_id, created_at desc);

alter table public.admin_activity_logs enable row level security;
-- No direct table policies: reads/writes must go through checked RPCs.
revoke all on table public.admin_activity_logs from anon, authenticated;

create or replace function public.admin_log_activity(p_action text, p_details jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  safe_details jsonb := coalesce(p_details, '{}'::jsonb);
begin
  if uid is null or not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;
  if p_action not in ('dashboard_view','users_view','claims_view','activity_logs_view','data_refresh') then
    raise exception 'Unsupported activity action.' using errcode = '22023';
  end if;
  if jsonb_typeof(safe_details) <> 'object' or length(safe_details::text) > 1000 then
    raise exception 'Activity details must be a small JSON object.' using errcode = '22023';
  end if;

  insert into public.admin_activity_logs (actor_user_id, action, details)
  values (uid, p_action, safe_details);
end;
$$;
revoke all on function public.admin_log_activity(text, jsonb) from public, anon;
grant execute on function public.admin_log_activity(text, jsonb) to authenticated;

create or replace function public.admin_list_activity_logs()
returns table (
  id bigint,
  actor_user_id uuid,
  actor_email text,
  action text,
  details jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;
  return query
    select l.id, l.actor_user_id, u.email::text, l.action, l.details, l.created_at
    from public.admin_activity_logs l
    left join auth.users u on u.id = l.actor_user_id
    order by l.created_at desc
    limit 200;
end;
$$;
revoke all on function public.admin_list_activity_logs() from public, anon;
grant execute on function public.admin_list_activity_logs() to authenticated;
