-- ====================================================================
-- FaucetFlow Complete PostgreSQL Schema for Supabase
-- Includes: Multi-Coin Balances, 60s Cooldown Advisory Lock,
-- 10% Referral Bonus Ledger, and Administrator Audit Security
-- ====================================================================

-- 1. Enable Cryptographic Extensions
create extension if not exists pgcrypto;

-- 2. User Profiles Table (With Optional Referrer Attribution)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  referrer_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 3. Multi-Coin Balances Table (BTC, LTC, DOGE, USDT)
create table if not exists public.balances (
  user_id uuid not null references auth.users(id) on delete cascade,
  coin text not null check (coin in ('BTC','LTC','DOGE','USDT')),
  amount numeric(28,12) not null default 0 check (amount >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, coin)
);

-- 4. Reward Claims Ledger Table
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coin text not null check (coin in ('BTC','LTC','DOGE','USDT')),
  amount numeric(28,12) not null check (amount > 0),
  claimed_at timestamptz not null default now()
);

-- 4b. 10% Referral Claims Ledger Table
create table if not exists public.referral_claims (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referee_id uuid not null references auth.users(id) on delete cascade,
  coin text not null check (coin in ('BTC','LTC','DOGE','USDT')),
  amount numeric(28,12) not null check (amount > 0),
  claimed_at timestamptz not null default now()
);

-- 5. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.balances enable row level security;
alter table public.claims enable row level security;
alter table public.referral_claims enable row level security;

-- 6. Read Policies (Owner or Admin)
drop policy if exists "profiles are viewable by owner or admin" on public.profiles;
create policy "profiles are viewable by owner or admin" on public.profiles
for select to authenticated using (auth.uid() = id or public.is_admin());

drop policy if exists "balances are viewable by owner or admin" on public.balances;
create policy "balances are viewable by owner or admin" on public.balances
for select to authenticated using (auth.uid() = user_id or public.is_admin());

drop policy if exists "claims are viewable by owner or admin" on public.claims;
create policy "claims are viewable by owner or admin" on public.claims
for select to authenticated using (auth.uid() = user_id or public.is_admin());

drop policy if exists "referral claims are viewable by referrer or admin" on public.referral_claims;
create policy "referral claims are viewable by referrer or admin" on public.referral_claims
for select to authenticated using (auth.uid() = referrer_id or auth.uid() = referee_id or public.is_admin());

-- Notice: Direct client insert/update/delete policies are intentionally prohibited.
-- All balance mutations must execute via the SECURITY DEFINER RPC functions below.

-- 7. Trigger: Automatically initialize profile & balances on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  safe_username text;
  safe_referrer_id uuid;
begin
  safe_username := nullif(trim(new.raw_user_meta_data ->> 'username'), '');
  safe_referrer_id := nullif(trim(new.raw_user_meta_data ->> 'referrer_id'), '')::uuid;

  insert into public.profiles (id, username, referrer_id)
  values (new.id, safe_username, safe_referrer_id)
  on conflict (id) do update set
    username = coalesce(excluded.username, public.profiles.username),
    referrer_id = coalesce(excluded.referrer_id, public.profiles.referrer_id);

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

-- 8. Core Faucet Claim RPC Function (with 60-Second Cooldown, Advisory Locks & 10% Referral Bonus)
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
  ref_id uuid;
  ref_bonus numeric(28,12);
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

  -- 1. Payout reward to the claimant
  insert into public.balances(user_id, coin, amount)
  values(uid, p_coin, reward)
  on conflict(user_id, coin)
  do update set amount = public.balances.amount + excluded.amount, updated_at = now();

  insert into public.claims(user_id, coin, amount) values(uid, p_coin, reward);

  -- 2. 10% Referral Commission Payout to Referrer
  select referrer_id into ref_id from public.profiles where id = uid;
  if ref_id is not null and ref_id <> uid then
    ref_bonus := round(reward * 0.10, 12);
    if ref_bonus > 0 then
      insert into public.balances(user_id, coin, amount)
      values(ref_id, p_coin, ref_bonus)
      on conflict(user_id, coin)
      do update set amount = public.balances.amount + excluded.amount, updated_at = now();

      insert into public.referral_claims(referrer_id, referee_id, coin, amount)
      values(ref_id, uid, p_coin, ref_bonus);
    end if;
  end if;

  return jsonb_build_object('coin', p_coin, 'amount', reward, 'claimed_at', now());
end;
$$;

revoke all on function public.claim_reward(text) from public;
grant execute on function public.claim_reward(text) to authenticated;
grant select on public.profiles, public.balances, public.claims, public.referral_claims to authenticated;

-- 9. Admin Roles & Access Control
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
