import { CoinConfig, CoinType, OfferwallTask } from '../types';

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

export const RAW_SQL_SCHEMA = `-- ====================================================================
-- FaucetFlow Complete PostgreSQL Schema for Supabase
-- Includes: Multi-Coin Balances, 60s Cooldown Advisory Lock,
-- 10% Referral Bonus Ledger, and Security Definer RPCs
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
`;

export const OFFERWALL_TASKS: OfferwallTask[] = [
  // Offerwall 1: Timewall (Surveys & Micro Tasks)
  {
    id: 'tw-1',
    offerwall: 'timewall',
    title: 'Daily High-Yield Consumer Survey',
    description: 'Complete a brief 8-minute consumer questionnaire on technology and finance.',
    category: 'Survey',
    rewardCoin: 'USDT',
    rewardAmount: 0.15000000,
    estMinutes: 8,
    partnerName: 'Timewall Surveys',
    difficulty: 'Easy',
  },
  {
    id: 'tw-2',
    offerwall: 'timewall',
    title: 'Crypto Market Sentiment Poll',
    description: 'Answer 5 quick multiple choice questions regarding Bitcoin and web3 adoption.',
    category: 'Survey',
    rewardCoin: 'DOGE',
    rewardAmount: 0.85000000,
    estMinutes: 3,
    partnerName: 'Timewall Polls',
    difficulty: 'Easy',
  },
  {
    id: 'tw-3',
    offerwall: 'timewall',
    title: 'Visit & Engage Partner Website',
    description: 'Browse the partner article for 45 seconds and verify completion.',
    category: 'Micro Task',
    rewardCoin: 'LTC',
    rewardAmount: 0.00120000,
    estMinutes: 1,
    partnerName: 'Timewall Clicks',
    difficulty: 'Easy',
  },
  {
    id: 'tw-4',
    offerwall: 'timewall',
    title: 'Product Review Evaluation',
    description: 'Rate 3 software apps and leave verified user feedback.',
    category: 'Micro Task',
    rewardCoin: 'BTC',
    rewardAmount: 0.00000250,
    estMinutes: 5,
    partnerName: 'Timewall Tasks',
    difficulty: 'Medium',
  },

  // Offerwall 2: Monlix (Apps, Games & Quests)
  {
    id: 'mx-1',
    offerwall: 'monlix',
    title: 'Kingdom Clash: Reach Castle Level 5',
    description: 'Install the strategy game on Android/iOS, complete tutorial, and upgrade castle to Lv. 5.',
    category: 'Game Quest',
    rewardCoin: 'USDT',
    rewardAmount: 0.35000000,
    estMinutes: 12,
    partnerName: 'Monlix Gaming',
    difficulty: 'Medium',
  },
  {
    id: 'mx-2',
    offerwall: 'monlix',
    title: 'Opera Crypto Browser: Install & Open',
    description: 'Download the lightweight Web3 browser and launch the application once.',
    category: 'App Install',
    rewardCoin: 'DOGE',
    rewardAmount: 1.50000000,
    estMinutes: 2,
    partnerName: 'Monlix Apps',
    difficulty: 'Easy',
  },
  {
    id: 'mx-3',
    offerwall: 'monlix',
    title: 'Merge Dragons: Level 10 Completion',
    description: 'Play puzzle stages to unlock the mystical garden level 10 rewards.',
    category: 'Game Quest',
    rewardCoin: 'BTC',
    rewardAmount: 0.00000450,
    estMinutes: 15,
    partnerName: 'Monlix Gaming',
    difficulty: 'High',
  },
  {
    id: 'mx-4',
    offerwall: 'monlix',
    title: 'CoinStats Tracker: Create Free Account',
    description: 'Install mobile app and sign up with email to track cryptocurrency portfolios.',
    category: 'App Install',
    rewardCoin: 'LTC',
    rewardAmount: 0.00280000,
    estMinutes: 3,
    partnerName: 'Monlix Offers',
    difficulty: 'Easy',
  },
];
