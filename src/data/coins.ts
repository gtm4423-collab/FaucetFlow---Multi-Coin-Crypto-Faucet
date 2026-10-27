import { CoinConfig, CoinType, OfferwallTask } from '../types';

export const MIN_WITHDRAW_USD = 0.20; // Minimum withdrawal threshold set to 0.20$ USD

export const SPONSOR_LINKS = {
  primary: 'https://dutiful-hate.com/b/3IVF0.PW3eptv/bdmoVWJFZHD/0z3wNOTnUY2sMYTyQxxGL/TJc/1/NbTwYJx/NIDEU-',
  smartlink2: 'https://unsightlystrain.com/dOmBF/zxd.GxNJvjZeGRUe/sehmI9du/ZmUFlikiPETFce1yNCTJYDxSMJTdcptiNBzbU/1FN/jOEHyBM-Qf',
  smartlink3: 'https://unsightlystrain.com/d.mLFMzNdlGTN/vgZiGAUH/neomF9Ju/ZJUolSkuPnTEcZ1/NXTOYwxDM/Tccpt/NgzpU/1jNIjFEEy/M-S_ZusLa/Wm1kpMdKDr0ixU',
  all: [
    'https://dutiful-hate.com/b/3IVF0.PW3eptv/bdmoVWJFZHD/0z3wNOTnUY2sMYTyQxxGL/TJc/1/NbTwYJx/NIDEU-',
    'https://unsightlystrain.com/dOmBF/zxd.GxNJvjZeGRUe/sehmI9du/ZmUFlikiPETFce1yNCTJYDxSMJTdcptiNBzbU/1FN/jOEHyBM-Qf',
    'https://unsightlystrain.com/d.mLFMzNdlGTN/vgZiGAUH/neomF9Ju/ZJUolSkuPnTEcZ1/NXTOYwxDM/Tccpt/NgzpU/1jNIjFEEy/M-S_ZusLa/Wm1kpMdKDr0ixU',
  ],
};

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

export const FLEX_MEDIA_OFFER_URL = 'https://flexmediax.link/go/MTUyfDM1OTkx';
export const BESTPLAY_OFFER_URL = 'https://flexmediax.link/go/MTUyfDM1MTAz';
export const BESTPLAY_3APPS_OFFER_URL = 'https://flexmediax.link/go/MTUyfDM1OTYx';

export const OFFERWALL_TASKS: OfferwallTask[] = [
  // BestPlay Tier-2: Download 3 Apps (Mega Payout Offer)
  {
    id: 'bestplay-3apps-offer',
    offerwall: 'flexmedia',
    title: 'BestPlay: Download & Play 3 Apps/Games',
    description: 'Install BestPlay on Android, play casual games, and download 3 sponsored games inside BestPlay to unlock top-tier reward.',
    category: 'App Install',
    rewardCoin: 'USDT',
    rewardAmount: 4.80000000,
    points: 4800,
    estMinutes: 10,
    partnerName: 'BestPlay Special · Flex Media',
    difficulty: 'Medium',
    linkUrl: BESTPLAY_3APPS_OFFER_URL,
  },
  // BestPlay Featured Super Offer (High Payout)
  {
    id: 'bestplay-offer',
    offerwall: 'flexmedia',
    title: 'BestPlay: Play & Earn Games (Android)',
    description: 'Download BestPlay, launch casual games, and play for 5+ minutes to claim high offerwall points and crypto rewards.',
    category: 'App Install',
    rewardCoin: 'USDT',
    rewardAmount: 2.60000000,
    points: 2600,
    estMinutes: 5,
    partnerName: 'BestPlay · Flex Media',
    difficulty: 'Easy',
    linkUrl: BESTPLAY_OFFER_URL,
  },
  // Flex Media Offerwall (Primary Partner Campaign)
  {
    id: 'flex-primary',
    offerwall: 'flexmedia',
    title: 'Flex Media Premier Campaign (Featured Top Offer)',
    description: 'Engage with the official Flex Media sponsored campaign to unlock high-yield crypto faucet earnings instantly.',
    category: 'Sponsor Offer',
    rewardCoin: 'USDT',
    rewardAmount: 0.25000000,
    estMinutes: 2,
    partnerName: 'Flex Media Network',
    difficulty: 'Instant',
    linkUrl: FLEX_MEDIA_OFFER_URL,
  },
  {
    id: 'flex-doge-bounty',
    offerwall: 'flexmedia',
    title: 'Flex Media Quick Discovery Quest',
    description: 'Visit verified Flex Media partner offer link and claim fast Dogecoin reward for your account.',
    category: 'Micro Task',
    rewardCoin: 'DOGE',
    rewardAmount: 1.50000000,
    estMinutes: 1,
    partnerName: 'Flex Media',
    difficulty: 'Easy',
    linkUrl: FLEX_MEDIA_OFFER_URL,
  },
  {
    id: 'flex-ltc-survey',
    offerwall: 'flexmedia',
    title: 'Flex Media Tech & Finance Consumer Poll',
    description: 'Complete a quick verified survey through the Flex Media gateway to earn instantaneous LTC credit.',
    category: 'Survey',
    rewardCoin: 'LTC',
    rewardAmount: 0.00250000,
    estMinutes: 3,
    partnerName: 'Flex Media Surveys',
    difficulty: 'Easy',
    linkUrl: FLEX_MEDIA_OFFER_URL,
  },
  {
    id: 'flex-btc-quest',
    offerwall: 'flexmedia',
    title: 'Flex Media Web3 App Discovery Quest',
    description: 'Discover trending apps via Flex Media and claim Bitcoin satoshis directly to your wallet ledger.',
    category: 'App Install',
    rewardCoin: 'BTC',
    rewardAmount: 0.00000500,
    estMinutes: 4,
    partnerName: 'Flex Media Apps',
    difficulty: 'Medium',
    linkUrl: FLEX_MEDIA_OFFER_URL,
  },
  {
    id: 'flex-usdt-boost',
    offerwall: 'flexmedia',
    title: 'Flex Media Daily Engagement Booster',
    description: 'Daily bonus task for active faucet users. Visit sponsor page to get +0.10 USDT instantly.',
    category: 'Micro Task',
    rewardCoin: 'USDT',
    rewardAmount: 0.10000000,
    estMinutes: 1,
    partnerName: 'Flex Media Booster',
    difficulty: 'Instant',
    linkUrl: FLEX_MEDIA_OFFER_URL,
  },
  {
    id: 'flex-game-quest',
    offerwall: 'flexmedia',
    title: 'Flex Media Mobile Gaming Campaign',
    description: 'Explore verified gaming partners and earn bonus Dogecoin cryptocurrency with zero waiting delay.',
    category: 'Game Quest',
    rewardCoin: 'DOGE',
    rewardAmount: 2.00000000,
    estMinutes: 5,
    partnerName: 'Flex Media Gaming',
    difficulty: 'Medium',
    linkUrl: FLEX_MEDIA_OFFER_URL,
  },
];
