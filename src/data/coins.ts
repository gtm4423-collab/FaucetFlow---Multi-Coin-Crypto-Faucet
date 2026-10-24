import { CoinConfig, CoinType } from '../types';

export const ADMIN_MASTER_PASSWORD = 'Ssshahin375@@#';

export const MIN_WITHDRAW_USD = 0.20; // Minimum withdrawal threshold set to 0.20$ USD

export const COIN_CONFIGS: Record<CoinType, CoinConfig> = {
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    decimals: 8,
    rewardAmount: 0.00000001, // 1 Satoshi
    rewardDisplay: '0.00000001 BTC',
    usdPrice: 94500.0,
    minWithdraw: 0.00000212, // Exactly $0.20 USD equivalent ($0.20 / $94,500)
    minWithdrawUsd: 0.20,
    networkFee: 0.00000020,
    color: '#F7931A',
    accentBg: 'rgba(247, 147, 26, 0.12)',
    iconSymbol: '₿',
    cooldownSeconds: 60,
  },
  LTC: {
    symbol: 'LTC',
    name: 'Litecoin',
    decimals: 8,
    rewardAmount: 0.00000100, // 100 Litoshi
    rewardDisplay: '0.00000100 LTC',
    usdPrice: 88.5,
    minWithdraw: 0.00226, // Exactly $0.20 USD equivalent ($0.20 / $88.50)
    minWithdrawUsd: 0.20,
    networkFee: 0.0001,
    color: '#345D9D',
    accentBg: 'rgba(52, 93, 157, 0.12)',
    iconSymbol: 'Ł',
    cooldownSeconds: 60,
  },
  DOGE: {
    symbol: 'DOGE',
    name: 'Dogecoin',
    decimals: 8,
    rewardAmount: 0.00001000, // 0.00001 DOGE
    rewardDisplay: '0.00001000 DOGE',
    usdPrice: 0.185,
    minWithdraw: 1.08, // Exactly $0.20 USD equivalent ($0.20 / $0.185)
    minWithdrawUsd: 0.20,
    networkFee: 0.05,
    color: '#C2A633',
    accentBg: 'rgba(194, 166, 51, 0.12)',
    iconSymbol: 'Ð',
    cooldownSeconds: 60,
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    rewardAmount: 0.00010000, // 0.0001 USDT
    rewardDisplay: '0.00010000 USDT',
    usdPrice: 1.0,
    minWithdraw: 0.20, // Exactly $0.20 USD (0.2 USDT)
    minWithdrawUsd: 0.20,
    networkFee: 0.02,
    color: '#26A17B',
    accentBg: 'rgba(38, 161, 123, 0.12)',
    iconSymbol: '₮',
    cooldownSeconds: 60,
  },
};

export const RAW_SQL_SCHEMA = `-- FaucetFlow schema for Supabase PostgreSQL.
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

-- Admin panel access controls.
create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_roles enable row level security;

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

-- Admin activity logging
create table if not exists public.admin_activity_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('dashboard_view','users_view','claims_view','activity_logs_view','data_refresh')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

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
$$;`;
