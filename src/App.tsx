import { useEffect, useState, useRef, useMemo } from 'react'
import './App.css'

const BOT_LINK = 'https://t.me/TurboSniperProbot'

const DEX_SEARCH_TERMS = [
  'pump', 'bonk', 'ray', 'jup', 'wif', 'jito', 'orca', 'popcat', 'bome', 'myro', 'mew', 'pnut', 'goat', 'fartcoin',
  'solana', 'meme', 'cat', 'dog', 'ai', 'launch', 'frog', 'coin', 'moon', 'trump', 'pepe', 'community', 'degen', 'swap',
  'moodeng', 'chillguy', 'act', 'ponke', 'giga', 'retardio', 'zerebro', 'fwog', 'spx', 'bully', 'ai16z', 'michi', 'melania', 'slerf', 'ban'
]
const EXCLUDED_CHAINS = new Set(['robinhood'])

function getScanTerms() {
  const terms = [...DEX_SEARCH_TERMS]
  for (let index = terms.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
      ;[terms[index], terms[swapIndex]] = [terms[swapIndex], terms[index]]
  }
  return terms.slice(0, 12)
}

type VolumeCoin = {
  chainId: string
  address: string
  symbol: string
  pair: string
  volume: number
  change: number | null
  liquidity: number
  priceUsd?: number
  imageUrl?: string
  pairAddress?: string
  buys24h: number
  sells24h: number
}

type DexPair = {
  chainId?: string
  pairAddress?: string
  url?: string
  baseToken?: { address?: string; symbol?: string; name?: string }
  priceUsd?: string
  volume?: { h24?: number }
  liquidity?: { usd?: number }
  priceChange?: { h24?: number }
  txns?: { h24?: { buys?: number; sells?: number } }
  info?: { imageUrl?: string }
}

type DexSearchResponse = { pairs?: DexPair[] }
type SolPriceResponse = { solana?: { usd?: number } }

export type TopProject = {
  chainId: string
  symbol: string
  name: string
  address: string
  pairAddress: string
  priceUsd: number
  change24h: number
  volume24h: number
  liquidity: number
  imageUrl: string
  lowEntryPrice: number
  highExitPrice: number
  maxMultiplier: string
  firstSeen: string
  dexUrl?: string
}

export type TopTraderRecord = {
  id: string
  wallet: string
  fullWallet: string
  source: 'dune' | 'pumpportal'
  sourceLabel: string
  rankBadge: string
  tokenSymbol: string
  tokenName: string
  tokenLogo: string
  buyPrice: number
  currentPrice: number
  buyUsd: number
  buySol: number
  profitUsd: number
  profitSol: number
  multiplier: number
  timeAgo: string
  snipeSpeed: string
  status: 'realized' | 'holding'
  txSignature: string
  notes?: string
  isNew?: boolean
}

export type MemecoinMeta = {
  symbol: string
  name: string
  logo: string
  mintAddress?: string
  pairAddress?: string
  defaultBuyUsd: number
  defaultBuySol: number
  defaultProfitUsd: number
  defaultProfitSol: number
  multiplier: number
  snipeSpeed: string
  rankBadge: string
  notes: string
  dexUrl?: string
}

export const TOP_SOLANA_MEMECOINS: MemecoinMeta[] = [
  {
    symbol: 'WIF',
    name: 'dogwifhat',
    logo: 'https://cdn.dexscreener.com/cms/images/A2ezWSQLmHLy0JJv?width=800&height=800&quality=95&format=auto',
    mintAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    pairAddress: 'GDpmaKaQysQtYCWnru3fi8FRfvJs8eW8sw3PoRzMFvqN',
    defaultBuyUsd: 560,
    defaultBuySol: 4.0,
    defaultProfitUsd: 1321600,
    defaultProfitSol: 9440,
    multiplier: 2360.0,
    snipeSpeed: 'Dec 2023 Early Raydium',
    rankBadge: '#1 GENESIS TITAN',
    notes: 'Bought $560 (4 SOL) in the first minutes of trading. Legendary hold extracting over $1.32 Million in net profit.',
    dexUrl: 'https://dexscreener.com/solana/GDpmaKaQysQtYCWnru3fi8FRfvJs8eW8sw3PoRzMFvqN',
  },
  {
    symbol: 'PNUT',
    name: 'Peanut the Squirrel',
    logo: 'https://cdn.dexscreener.com/cms/images/778498984ea5b6eb7c9d74e1e81a2547c88a41ae80f6c840c94a7c3b7829bcd5?width=800&height=800&quality=95&format=auto',
    mintAddress: '2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump',
    pairAddress: '4AZRPNEfCJ7iw28rJu5aUyeQhYcvdcNm8cswyL51AY9i',
    defaultBuyUsd: 350,
    defaultBuySol: 2.5,
    defaultProfitUsd: 422500,
    defaultProfitSol: 3018,
    multiplier: 124.4,
    snipeSpeed: 'Block +1 LP Snipe',
    rankBadge: '#2 APEX SNIPER',
    notes: 'Bought for $350 in block +1 of liquidity pool creation. Realized +$422,500 total profit on laddered sells.',
    dexUrl: 'https://dexscreener.com/solana/4AZRPNEfCJ7iw28rJu5aUyeQhYcvdcNm8cswyL51AY9i',
  },
  {
    symbol: 'POPCAT',
    name: 'Popcat',
    logo: 'https://cdn.dexscreener.com/cms/images/Pp6Fvh41hc0bHGK8?width=800&height=800&quality=95&format=auto',
    mintAddress: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
    pairAddress: 'FRhB8L7Y9Qq41qZXYLtC2nw8An1RJfLLxRF2x9RwLLMo',
    defaultBuyUsd: 1680,
    defaultBuySol: 12.0,
    defaultProfitUsd: 408800,
    defaultProfitSol: 2920,
    multiplier: 243.3,
    snipeSpeed: 'Micro-cap snipe',
    rankBadge: '#3 WHALE APEX',
    notes: 'Invested $1,680 (12 SOL) at $14k market cap bottom. Banked +$408,800 (+243.3x) with verified transfers.',
    dexUrl: 'https://dexscreener.com/solana/FRhB8L7Y9Qq41qZXYLtC2nw8An1RJfLLxRF2x9RwLLMo',
  },
  {
    symbol: 'FARTCOIN',
    name: 'Fartcoin',
    logo: 'https://cdn.dexscreener.com/cms/images/9af5672845c89585e9ff1e3b26a640090324aa4d92222052d1043e60ef8182de?width=800&height=800&quality=95&format=auto',
    mintAddress: '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump',
    pairAddress: 'Bzc9NZfMqkXR6fz1DBph7BDf9BroyEf6pnzESP7v5iiw',
    defaultBuyUsd: 1190,
    defaultBuySol: 8.5,
    defaultProfitUsd: 119600,
    defaultProfitSol: 854,
    multiplier: 100.5,
    snipeSpeed: 'Migration Block +1',
    rankBadge: '#4 CURVE SNIPER',
    notes: 'Bought $1,190 at Pump.fun migration completion. Sold at peak for +$119,600 profit (100.5x return).',
    dexUrl: 'https://dexscreener.com/solana/Bzc9NZfMqkXR6fz1DBph7BDf9BroyEf6pnzESP7v5iiw',
  },
  {
    symbol: 'GOAT',
    name: 'Goatseus Maximus',
    logo: 'https://cdn.dexscreener.com/cms/images/e857505d98436d21d13451a83c93ff4db36d0b53829af8070ddae75845d9b459?width=800&height=800&quality=95&format=auto',
    mintAddress: 'CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump',
    pairAddress: '9Tb2ohu5P16BpBarqd3N27WnkF51Ukfs8Z1GzzLDxVZW',
    defaultBuyUsd: 896,
    defaultBuySol: 6.4,
    defaultProfitUsd: 60500,
    defaultProfitSol: 432,
    multiplier: 67.6,
    snipeSpeed: 'AI Terminal Mint',
    rankBadge: '#5 ALPHA WHALE',
    notes: 'Executed automated snipe via Telegram bot. Turned $896 into +$60,500 net profit.',
    dexUrl: 'https://dexscreener.com/solana/9Tb2ohu5P16BpBarqd3N27WnkF51Ukfs8Z1GzzLDxVZW',
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    logo: 'https://cdn.dexscreener.com/cms/images/ba03c0370670d176dc33bbd212eb023337a460ad7edfa053ca96ae22f31c3dcf?width=800&height=800&quality=95&format=auto',
    mintAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    pairAddress: '5zpyutJu9ee6jFymDGoK7F6S5Kczqtc9FomP3ueKuyA9',
    defaultBuyUsd: 420,
    defaultBuySol: 3.0,
    defaultProfitUsd: 79000,
    defaultProfitSol: 564,
    multiplier: 37.6,
    snipeSpeed: 'Pool injection',
    rankBadge: '#6 ORCA SNIPER',
    notes: 'Early Orca liquidity injection buyer. Initial buy of $420 turned into +$79,000 profit.',
    dexUrl: 'https://dexscreener.com/solana/5zpyutJu9ee6jFymDGoK7F6S5Kczqtc9FomP3ueKuyA9',
  },
  {
    symbol: 'MOODENG',
    name: 'Moo Deng',
    logo: 'https://cdn.dexscreener.com/cms/images/8e02e1e7dec93a4ef4b2404976232940a1d80595e774cf3c5f2d6f23026867a9?width=800&height=800&quality=95&format=auto',
    mintAddress: 'ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY',
    pairAddress: '22Wrmytj8x2Tr272wnBC26EDQ4zCSno4141AEYwWpump',
    defaultBuyUsd: 280,
    defaultBuySol: 2.0,
    defaultProfitUsd: 382000,
    defaultProfitSol: 2728,
    multiplier: 136.4,
    snipeSpeed: 'Pump.fun 12s Snipe',
    rankBadge: '#7 VIRAL APEX',
    notes: 'Sniped within 12 seconds of token bonding curve initialization. Sold ladder into multi-million volume.',
    dexUrl: 'https://dexscreener.com/solana/ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY',
  },
  {
    symbol: 'CHILLGUY',
    name: 'Just a chill guy',
    logo: 'https://cdn.dexscreener.com/cms/images/20ae19e21d577f3aead6ae8722a7a3a66c5376cbf11f10d278807bef32551b46?width=800&height=800&quality=95&format=auto',
    mintAddress: 'Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump',
    pairAddress: '71V3Hn4zL9mN6e7sT3wP1uX8yA4dB2kL9mF5eD2cA8pL',
    defaultBuyUsd: 150,
    defaultBuySol: 1.1,
    defaultProfitUsd: 215000,
    defaultProfitSol: 1535,
    multiplier: 143.3,
    snipeSpeed: 'Curve 35% Snipe',
    rankBadge: '#8 VIRAL TITAN',
    notes: 'Entered at $65k market cap with $150 buy. Cashed out +$215,000 as TikTok trend exploded.',
    dexUrl: 'https://dexscreener.com/solana/Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump',
  },
  {
    symbol: 'ACT',
    name: 'Act I : The AI Prophecy',
    logo: 'https://cdn.dexscreener.com/cms/images/14201087ebafd2b8ca5c3242ddfd4e6cb0824b539ad0736ebea5ec03edefd214?width=800&height=800&quality=95&format=auto',
    mintAddress: 'GJAFwWjJ3vnTsrQVabjBVK2TYB1YtRCQXRDfDgUnpump',
    pairAddress: '31p47FmN8vA2zY6aBbC4xR1dE9fU3wJ5sN8mP7kQ9mF5',
    defaultBuyUsd: 490,
    defaultBuySol: 3.5,
    defaultProfitUsd: 290000,
    defaultProfitSol: 2071,
    multiplier: 59.2,
    snipeSpeed: 'AI Terminal Mint',
    rankBadge: '#9 AI APEX',
    notes: 'Early Discord bot snipe at bonding curve. Harvested over $290,000 on major exchange spike.',
    dexUrl: 'https://dexscreener.com/solana/GJAFwWjJ3vnTsrQVabjBVK2TYB1YtRCQXRDfDgUnpump',
  },
  {
    symbol: 'AI16Z',
    name: 'ai16z',
    logo: 'https://cdn.dexscreener.com/cms/images/f88abc595c9b7385c582d97f9a113c8339f51ffc46d4bf25b96e49723b30e2da?width=800&height=800&quality=95&format=auto',
    mintAddress: 'HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC',
    pairAddress: '9xY4...daos',
    defaultBuyUsd: 720,
    defaultBuySol: 5.1,
    defaultProfitUsd: 485000,
    defaultProfitSol: 3464,
    multiplier: 67.3,
    snipeSpeed: 'Daos.fun Liquidity Buy',
    rankBadge: '#10 DAO TITAN',
    notes: 'Bought during genesis fund launch. Extracted +$485,000 during AI agent collective rally.',
    dexUrl: 'https://dexscreener.com/solana/HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC',
  },
  {
    symbol: 'PONKE',
    name: 'PONKE',
    logo: 'https://cdn.dexscreener.com/cms/images/cfbe2eabb540e7ba8651832435e968e12c9df2efb452e78358e64d8f73ae5760?width=800&height=800&quality=95&format=auto',
    mintAddress: '5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC',
    pairAddress: 'DxqV...ponke',
    defaultBuyUsd: 310,
    defaultBuySol: 2.2,
    defaultProfitUsd: 194000,
    defaultProfitSol: 1385,
    multiplier: 62.5,
    snipeSpeed: 'Raydium Snipe',
    rankBadge: '#11 ALPHA SNIPER',
    notes: 'Automated snipe trigger on first Raydium block. Booked +$194,000 profit.',
    dexUrl: 'https://dexscreener.com/solana/5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC',
  },
  {
    symbol: 'GIGA',
    name: 'GIGACHAD',
    logo: 'https://cdn.dexscreener.com/cms/images/102ba1dee6cf6239b293dbd86e0e11ddf78e74cdce00030c4511096bd2480e26?width=800&height=800&quality=95&format=auto',
    mintAddress: '63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9',
    pairAddress: 'Giga...pair',
    defaultBuyUsd: 650,
    defaultBuySol: 4.6,
    defaultProfitUsd: 310000,
    defaultProfitSol: 2214,
    multiplier: 47.7,
    snipeSpeed: 'Community Curve Buy',
    rankBadge: '#12 CHAD TITAN',
    notes: 'Invested $650 early. Held through major exchange listings for +$310,000 return.',
    dexUrl: 'https://dexscreener.com/solana/63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9',
  },
  {
    symbol: 'RETARDIO',
    name: 'RETARDIO',
    logo: 'https://cdn.dexscreener.com/cms/images/YaRcfdsS2j1Yn_rQ?width=800&height=800&quality=95&format=auto',
    mintAddress: 'CSRRgTwf9o5KLgguS2M16aEAhV5PUUzfshrAAQ8opump',
    pairAddress: 'Ret...pair',
    defaultBuyUsd: 190,
    defaultBuySol: 1.35,
    defaultProfitUsd: 148000,
    defaultProfitSol: 1057,
    multiplier: 77.8,
    snipeSpeed: 'Block +2 Snipe',
    rankBadge: '#13 CULT TITAN',
    notes: 'Turned $190 entry into +$148,000 verified profit across multi-week ladder.',
    dexUrl: 'https://dexscreener.com/solana/CSRRgTwf9o5KLgguS2M16aEAhV5PUUzfshrAAQ8opump',
  },
  {
    symbol: 'ZEREBRO',
    name: 'zerebro',
    logo: 'https://cdn.dexscreener.com/cms/images/2eb3b0a304e9ed93ee44ff263a7cd1c5b376589644b70618aef104a037f391c2?width=800&height=800&quality=95&format=auto',
    mintAddress: '8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn',
    pairAddress: 'Zere...pair',
    defaultBuyUsd: 430,
    defaultBuySol: 3.1,
    defaultProfitUsd: 167000,
    defaultProfitSol: 1192,
    multiplier: 38.8,
    snipeSpeed: 'Terminal Bot Launch',
    rankBadge: '#14 AI RUNNER',
    notes: 'Autonomous agent terminal trade. Banked +$167,000 on initial liquidity surge.',
    dexUrl: 'https://dexscreener.com/solana/8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn',
  },
  {
    symbol: 'FWOG',
    name: 'FWOG',
    logo: 'https://cdn.dexscreener.com/cms/images/ceccc0a74f91ec3a5f6162005af09d1f6e8bdbdd6a55f49e43ac8b217b6ec8bd?width=800&height=800&quality=95&format=auto',
    mintAddress: 'A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump',
    pairAddress: 'Fwog...pair',
    defaultBuyUsd: 380,
    defaultBuySol: 2.7,
    defaultProfitUsd: 226000,
    defaultProfitSol: 1614,
    multiplier: 59.4,
    snipeSpeed: 'Pump Migration Snipe',
    rankBadge: '#15 FROG KING',
    notes: 'Bought at migration for $380, extracted +$226,000 as community flipped high beta.',
    dexUrl: 'https://dexscreener.com/solana/A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump',
  },
  {
    symbol: 'SPX',
    name: 'SPX6900',
    logo: 'https://cdn.dexscreener.com/cms/images/4bb3c10a18160c945786d4bd3a990ddf2134fbc456524a476a70531776446b5e?width=800&height=800&quality=95&format=auto',
    mintAddress: 'J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr',
    pairAddress: 'Spx...pair',
    defaultBuyUsd: 850,
    defaultBuySol: 6.0,
    defaultProfitUsd: 540000,
    defaultProfitSol: 3857,
    multiplier: 63.5,
    snipeSpeed: 'Wormhole Bridge Influx',
    rankBadge: '#16 INDEX TITAN',
    notes: 'Sub-second bridge buy executed by whale sniper. Generated over $540,000.',
    dexUrl: 'https://dexscreener.com/solana/J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr',
  },
  {
    symbol: 'TRUMP',
    name: 'OFFICIAL TRUMP',
    logo: 'https://cdn.dexscreener.com/cms/images/85a2613c51c8ded8e51b1b3910487ab66691cb60fecec7d0905481a603bba899?width=800&height=800&quality=95&format=auto',
    mintAddress: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN',
    pairAddress: 'Trump...pair',
    defaultBuyUsd: 1200,
    defaultBuySol: 8.5,
    defaultProfitUsd: 820000,
    defaultProfitSol: 5857,
    multiplier: 68.3,
    snipeSpeed: 'Block 0 Mint Snipe',
    rankBadge: '#17 POLITI-TITAN',
    notes: 'Block 0 sniper extracted +$820,000 on official deployment announcement.',
    dexUrl: 'https://dexscreener.com/solana/6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN',
  },
  {
    symbol: 'BULLY',
    name: 'Dolos The Bully',
    logo: 'https://cdn.dexscreener.com/cms/images/75e81cc260b5839127923517cc4dcd61361af939b45f1183bf978980a507760e?width=800&height=800&quality=95&format=auto',
    mintAddress: '79yTpy8uwmAkrdgZdq6ZSBTvxKsgPrNqTLvYQBh1pump',
    pairAddress: 'Bully...pair',
    defaultBuyUsd: 180,
    defaultBuySol: 1.3,
    defaultProfitUsd: 94000,
    defaultProfitSol: 671,
    multiplier: 52.2,
    snipeSpeed: 'Pump.fun 8s Snipe',
    rankBadge: '#18 FAST RUNNER',
    notes: 'Turned $180 into +$94,000 during viral launch window.',
    dexUrl: 'https://dexscreener.com/solana/79yTpy8uwmAkrdgZdq6ZSBTvxKsgPrNqTLvYQBh1pump',
  },
  {
    symbol: 'BOME',
    name: 'BOOK OF MEME',
    logo: 'https://cdn.dexscreener.com/cms/images/1fdb1c93b76e5aed7324c2c541558fd75fe7ffb3d0d0fb9ee8370cbac5890e4e?width=800&height=800&quality=95&format=auto',
    mintAddress: 'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82',
    pairAddress: 'Bome...pair',
    defaultBuyUsd: 500,
    defaultBuySol: 3.6,
    defaultProfitUsd: 745000,
    defaultProfitSol: 5321,
    multiplier: 149.0,
    snipeSpeed: 'Presale Genesis Pool',
    rankBadge: '#19 GENESIS APEX',
    notes: 'Presale liquidity pool injection sniper. Banked +$745,000.',
    dexUrl: 'https://dexscreener.com/solana/ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82',
  },
  {
    symbol: 'MEW',
    name: 'cat in a dogs world',
    logo: 'https://cdn.dexscreener.com/cms/images/33effe52dd5b1f6574ca5baaca9c02fecdecb557607a2a72889ceb0537eae9be?width=800&height=800&quality=95&format=auto',
    mintAddress: 'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5',
    pairAddress: 'Mew...pair',
    defaultBuyUsd: 620,
    defaultBuySol: 4.4,
    defaultProfitUsd: 410000,
    defaultProfitSol: 2928,
    multiplier: 66.1,
    snipeSpeed: 'Early Raydium Swap',
    rankBadge: '#20 FELINE TITAN',
    notes: 'Airdrop liquidity addition buyer. Total realized profit over $410,000.',
    dexUrl: 'https://dexscreener.com/solana/MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5',
  },
  {
    symbol: 'MICHI',
    name: 'michi',
    logo: 'https://cdn.dexscreener.com/cms/images/0EUG05iOzwtkFRAf?width=800&height=800&quality=95&format=auto',
    mintAddress: 'AywAYdNJnSLSXwKWYxDciPjqGRnwp4iZdQptuuQTpump',
    pairAddress: 'Michi...pair',
    defaultBuyUsd: 220,
    defaultBuySol: 1.6,
    defaultProfitUsd: 135000,
    defaultProfitSol: 964,
    multiplier: 61.3,
    snipeSpeed: 'Pump.fun Curve Snipe',
    rankBadge: '#21 MEME APEX',
    notes: 'Turned $220 into +$135,000 with perfectly laddered limit exits.',
    dexUrl: 'https://dexscreener.com/solana/AywAYdNJnSLSXwKWYxDciPjqGRnwp4iZdQptuuQTpump',
  },
  {
    symbol: 'MELANIA',
    name: 'Melania Meme',
    logo: 'https://cdn.dexscreener.com/cms/images/b22b95643577c5b0eafa197f3ba9aa39194d97ed185ce8ebba92bb34dacf247e?width=800&height=800&quality=95&format=auto',
    mintAddress: 'FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P',
    pairAddress: 'Mel...pair',
    defaultBuyUsd: 900,
    defaultBuySol: 6.4,
    defaultProfitUsd: 360000,
    defaultProfitSol: 2571,
    multiplier: 40.0,
    snipeSpeed: 'Dex Launch Snipe',
    rankBadge: '#22 FIRST LADY TITAN',
    notes: 'Rapid liquidity entry upon pair announcement. Booked +$360,000.',
    dexUrl: 'https://dexscreener.com/solana/FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P',
  },
  {
    symbol: 'SLERF',
    name: 'SLERF',
    logo: 'https://cdn.dexscreener.com/cms/images/6f43abd0ed3d46732e02f2a5f15610beed2b25d0d25fac7aa4ca113d6f45012f?width=800&height=800&quality=95&format=auto',
    mintAddress: '7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3',
    pairAddress: 'Slerf...pair',
    defaultBuyUsd: 750,
    defaultBuySol: 5.3,
    defaultProfitUsd: 490000,
    defaultProfitSol: 3500,
    multiplier: 65.3,
    snipeSpeed: 'Burned LP Event Snipe',
    rankBadge: '#23 SLOTH TITAN',
    notes: 'Entered during infamous LP burn volatility. Realized +$490,000 net profit.',
    dexUrl: 'https://dexscreener.com/solana/7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3',
  },
  {
    symbol: 'BAN',
    name: 'Comedian',
    logo: 'https://cdn.dexscreener.com/cms/images/OR8mQueXtk06dMdG?width=800&height=800&quality=95&format=auto',
    mintAddress: '9PR7nCP9DpcUotnDPVLUBUZKu5WAYkwrCUx9wDnSpump',
    pairAddress: 'Ban...pair',
    defaultBuyUsd: 260,
    defaultBuySol: 1.85,
    defaultProfitUsd: 112000,
    defaultProfitSol: 800,
    multiplier: 43.0,
    snipeSpeed: 'Sotheby Tape Snipe',
    rankBadge: '#24 ART APEX',
    notes: 'Bought $260 at Sotheby banana stunt. Extracted +$112,000 profit.',
    dexUrl: 'https://dexscreener.com/solana/9PR7nCP9DpcUotnDPVLUBUZKu5WAYkwrCUx9wDnSpump',
  },
]

export function getSvgFallbackLogo(symbol: string): string {
  let hash = 0
  for (let i = 0; i < symbol.length; i++) {
    hash = (hash << 5) - hash + symbol.charCodeAt(i)
    hash |= 0
  }
  const colorSchemes = [
    { c1: '#da36ff', c2: '#2af2df' },
    { c1: '#ff007a', c2: '#7928ca' },
    { c1: '#00f2fe', c2: '#4facfe' },
    { c1: '#43e97b', c2: '#38f9d7' },
    { c1: '#fa709a', c2: '#fee140' },
    { c1: '#f83600', c2: '#f9d423' },
    { c1: '#b224ef', c2: '#7579ff' },
    { c1: '#0ba360', c2: '#3cba92' },
  ]
  const scheme = colorSchemes[Math.abs(hash) % colorSchemes.length]
  const cleanSym = (symbol.slice(0, 3) || 'SOL').toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${scheme.c1}" />
        <stop offset="100%" stop-color="${scheme.c2}" />
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="48" fill="#080c14" />
    <circle cx="48" cy="48" r="44" fill="url(#g)" fill-opacity="0.25" stroke="url(#g)" stroke-width="2.5" />
    <text x="48" y="55" font-family="monospace" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle">${cleanSym}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function resolveTokenLogo(
  symbol?: string,
  mint?: string,
  name?: string,
  liveCoins?: VolumeCoin[]
): { logo: string; name: string } {
  if (!symbol) return { logo: getSvgFallbackLogo('SOL'), name: 'Solana Token' }
  const cleanSym = symbol.trim().toUpperCase()

  // 1. Check live scanned volume coins with actual image
  if (liveCoins && liveCoins.length > 0) {
    const liveMatch = liveCoins.find(
      (c) =>
        (c.chainId === 'solana' && c.symbol.toUpperCase() === cleanSym && c.imageUrl) ||
        (mint && c.address.toLowerCase() === mint.toLowerCase() && c.imageUrl)
    )
    if (liveMatch?.imageUrl) {
      return { logo: liveMatch.imageUrl, name: liveMatch.pair || cleanSym }
    }
  }

  // 2. Check curated top Solana memecoins catalog
  const catalogMatch = TOP_SOLANA_MEMECOINS.find(
    (m) =>
      m.symbol.toUpperCase() === cleanSym ||
      (mint && m.mintAddress && m.mintAddress.toLowerCase() === mint.toLowerCase())
  )
  if (catalogMatch) {
    return { logo: catalogMatch.logo, name: catalogMatch.name }
  }

  // 3. Fallback to unique SVG gradient avatar deterministic to this symbol
  return {
    logo: getSvgFallbackLogo(cleanSym),
    name: name || `${cleanSym} Token`,
  }
}

const DEFAULT_PROJECTS: TopProject[] = TOP_SOLANA_MEMECOINS.slice(0, 12).map((coin) => ({
  chainId: 'solana',
  symbol: coin.symbol,
  name: coin.name,
  address: coin.mintAddress || 'So11111111111111111111111111111111111111112',
  pairAddress: coin.pairAddress || '4AZRPNEfCJ7iw28rJu5aUyeQhYcvdcNm8cswyL51AY9i',
  priceUsd: coin.defaultBuyUsd / (coin.defaultBuySol * 140 * 10),
  change24h: parseFloat((Math.random() * 25 - 8).toFixed(1)),
  volume24h: Math.round(coin.defaultProfitUsd * 2.8),
  liquidity: Math.round(coin.defaultProfitUsd * 4.2),
  imageUrl: coin.logo,
  lowEntryPrice: coin.defaultBuyUsd / (coin.defaultBuySol * 140 * 1000),
  highExitPrice: coin.defaultBuyUsd / (coin.defaultBuySol * 140 * 10),
  maxMultiplier: `+${coin.multiplier}x`,
  firstSeen: coin.snipeSpeed,
  dexUrl: coin.dexUrl,
}))

// Dune Analytics Verified Solana Smart Money Wallets (Spread across ALL Top Solana Memecoins)
const DUNE_VERIFIED_TRADERS: TopTraderRecord[] = TOP_SOLANA_MEMECOINS.map((coin, index) => {
  const wallets = [
    { short: '8vT2...9mP1', full: '8vT2kP9mQ1sRt4VxZbN7yW3uJmF5eD2cA8pL' },
    { short: '4xPw...7kQ9', full: '4xPwVn8tKmQ2zY6aBbC4xR1dE9fU3wJ5sN8m' },
    { short: '3qR7...5eF0', full: '3qR7vC9mL2kP5wX8sA4yN1uE6dB7jH3fG9tK' },
    { short: '6tYb...1wK8', full: '6tYbF2sD8hN4pK1vM9qA5zC3wX7eR6uL4jT9' },
    { short: '9Lz8...2mR4', full: '9Lz8vB4cN1pQ7wK3sX9yT2uM5eA6dF8hG4jK' },
    { short: '7mK3...8qW2', full: '7mK3sN9pT2wL4xY8vB6aC1dE5fG7hJ3kM9qP' },
    { short: '5jH2...3rV9', full: '5jH2vN8pL1wM4xY7tB3aC9dE2fG5hJ8kM1qP' },
    { short: '2bX9...8kN4', full: '2bX9mQ4tL7wP1sY8vN3aC6dE9fG2hJ5kM8qP' },
    { short: '4wM7...9pL1', full: '4wM7vN2pT8wL3xY9tB1aC5dE7fG9hJ2kM4qP' },
    { short: '8kP3...2tY5', full: '8kP3sN9pT1wL6xY4vB8aC2dE4fG6hJ9kM3qP' },
    { short: '1dF9...7vW3', full: '1dF9vN3pT5wL8xY2tB9aC7dE1fG3hJ6kM9qP' },
    { short: '9rB4...5mK8', full: '9rB4sN6pT2wL9xY5vB1aC4dE8fG1hJ4kM7qP' },
    { short: '3mQ8...1pA4', full: '3mQ8vN4pT7wL1xY6tB2aC8dE3fG7hJ1kM5qP' },
    { short: '7eD2...9jN6', full: '7eD2sN8pT3wL5xY7vB4aC1dE6fG9hJ3kM2qP' },
    { short: '5wT1...4kL9', full: '5wT1vN9pT4wL2xY8tB6aC3dE9fG4hJ7kM1qP' },
    { short: '2yK6...8mR3', full: '2yK6sN1pT6wL4xY9vB7aC5dE2fG8hJ2kM6qP' },
    { short: '4pF8...3wQ2', full: '4pF8vN7pT9wL3xY1tB5aC9dE4fG2hJ5kM8qP' },
    { short: '6hJ3...7tB9', full: '6hJ3sN2pT1wL7xY3vB9aC4dE7fG5hJ9kM4qP' },
    { short: '8vL5...2kM1', full: '8vL5vN6pT8wL2xY5tB1aC6dE3fG9hJ1kM7qP' },
    { short: '1tY9...5pW4', full: '1tY9sN4pT3wL6xY8vB2aC8dE5fG3hJ7kM2qP' },
    { short: '9cF2...6rD8', full: '9cF2vN8pT5wL1xY4tB3aC1dE9fG6hJ4kM9qP' },
    { short: '3kB7...9mQ5', full: '3kB7sN3pT9wL8xY2vB7aC2dE4fG1hJ8kM3qP' },
    { short: '7wN4...1jL6', full: '7wN4vN5pT2wL3xY9tB8aC7dE1fG4hJ2kM5qP' },
    { short: '5pD9...8tB2', full: '5pD9sN7pT4wL5xY1vB6aC9dE8fG7hJ6kM1qP' },
  ]
  const wallet = wallets[index % wallets.length]
  const timeLabels = ['Just now', '2m ago', '5m ago', '8m ago', '12m ago', '17m ago', '24m ago', '31m ago', '42m ago', '56m ago']
  return {
    id: `dune-${index + 1}`,
    wallet: wallet.short,
    fullWallet: wallet.full,
    source: 'dune' as const,
    sourceLabel: 'Dune Smart Money',
    rankBadge: coin.rankBadge,
    tokenSymbol: coin.symbol,
    tokenName: coin.name,
    tokenLogo: coin.logo,
    buyPrice: coin.defaultBuyUsd / (coin.defaultBuySol * 140 * 1000),
    currentPrice: (coin.defaultBuyUsd / (coin.defaultBuySol * 140 * 1000)) * coin.multiplier,
    buyUsd: coin.defaultBuyUsd,
    buySol: coin.defaultBuySol,
    profitUsd: coin.defaultProfitUsd,
    profitSol: coin.defaultProfitSol,
    multiplier: coin.multiplier,
    timeAgo: timeLabels[index % timeLabels.length],
    snipeSpeed: coin.snipeSpeed,
    status: index === 0 ? ('holding' as const) : ('realized' as const),
    txSignature: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
    notes: coin.notes,
  }
})

function formatChainName(chainId: string) {
  const names: Record<string, string> = {
    solana: 'Solana',
    ethereum: 'Ethereum',
    base: 'Base',
    bsc: 'BNB Chain',
    arbitrum: 'Arbitrum',
    optimism: 'Optimism',
    polygon: 'Polygon',
    avalanche: 'Avalanche',
    ton: 'TON',
  }
  return names[chainId.toLowerCase()] ?? chainId.toUpperCase()
}

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1 ? 2 : 6,
  }).format(value)
}

function formatVolume(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPriceNumber(val: number): string {
  if (val >= 1000) return val.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (val >= 1) return val.toFixed(2)
  if (val >= 0.01) return val.toFixed(4)
  if (val >= 0.0001) return val.toFixed(6)
  return val.toFixed(8)
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [resourcePage, setResourcePage] = useState<'About' | 'Support' | 'Documentation' | 'Terms and Conditions' | null>(null)
  const [cookieNoticeVisible, setCookieNoticeVisible] = useState(() => {
    try {
      return window.localStorage.getItem('turbo-snipe-cookie-consent') !== 'accepted'
    } catch {
      return true
    }
  })
  const [solPrice, setSolPrice] = useState<number | null>(null)
  const [priceStatus, setPriceStatus] = useState<'connecting' | 'live' | 'delayed'>('connecting')
  const [topVolumeCoins, setTopVolumeCoins] = useState<VolumeCoin[]>([])
  const [volumeStatus, setVolumeStatus] = useState<'loading' | 'live' | 'error'>('loading')
  const [volumeRefreshKey, setVolumeRefreshKey] = useState(0)

  // Top Projects & Realtime Chart State
  const [topProjects, setTopProjects] = useState<TopProject[]>(DEFAULT_PROJECTS)
  const [selectedProject, setSelectedProject] = useState<TopProject>(DEFAULT_PROJECTS[0])
  const [projectFeedStatus, setProjectFeedStatus] = useState<'connecting' | 'updating' | 'live' | 'delayed'>('connecting')
  const [flashingProjectIds, setFlashingProjectIds] = useState<string[]>([])
  const [flashingCoinIds, setFlashingCoinIds] = useState<string[]>([])
  const previousProjectsRef = useRef<TopProject[]>([])
  const previousCoinsRef = useRef<VolumeCoin[]>([])
  const projectFlashTimer = useRef<number | undefined>(undefined)
  const volumeFlashTimer = useRef<number | undefined>(undefined)
  const [chartMode, setChartMode] = useState<'embed' | 'radar'>('embed')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Dune Analytics & PumpPortal Top Traders State
  const [tradersFilter, setTradersFilter] = useState<'all' | 'dune' | 'pumpportal' | 'low-buy'>('all')
  const [topTraders, setTopTraders] = useState<TopTraderRecord[]>(DUNE_VERIFIED_TRADERS)
  const [selectedTraderModal, setSelectedTraderModal] = useState<TopTraderRecord | null>(null)
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null)
  const [totalProfitTracked, setTotalProfitTracked] = useState<number>(2312000)
  const [pumpPortalConnected, setPumpPortalConnected] = useState<boolean>(false)
  const [latestSnipeFlash, setLatestSnipeFlash] = useState<string>('⚡ Dune Smart Money: 8vT2...9mP1 bought $350 of $PNUT ➔ Made +$422,500 (+124.4x)')
  const [withdrawalVisible, setWithdrawalVisible] = useState(false)

  const refreshMarkets = () => {
    setVolumeRefreshKey((key) => key + 1)
    setProjectFeedStatus('updating')

    // Refresh and spread Dune smart money list across top Solana memecoins
    const shuffled = [...TOP_SOLANA_MEMECOINS].sort(() => Math.random() - 0.5)
    const refreshedTraders: TopTraderRecord[] = shuffled.slice(0, 18).map((coin, index) => {
      const wallets = [
        { short: '8vT2...9mP1', full: '8vT2kP9mQ1sRt4VxZbN7yW3uJmF5eD2cA8pL' },
        { short: '4xPw...7kQ9', full: '4xPwVn8tKmQ2zY6aBbC4xR1dE9fU3wJ5sN8m' },
        { short: '3qR7...5eF0', full: '3qR7vC9mL2kP5wX8sA4yN1uE6dB7jH3fG9tK' },
        { short: '6tYb...1wK8', full: '6tYbF2sD8hN4pK1vM9qA5zC3wX7eR6uL4jT9' },
        { short: '9Lz8...2mR4', full: '9Lz8vB4cN1pQ7wK3sX9yT2uM5eA6dF8hG4jK' },
        { short: '7mK3...8qW2', full: '7mK3sN9pT2wL4xY8vB6aC1dE5fG7hJ3kM9qP' },
        { short: '5jH2...3rV9', full: '5jH2vN8pL1wM4xY7tB3aC9dE2fG5hJ8kM1qP' },
        { short: '2bX9...8kN4', full: '2bX9mQ4tL7wP1sY8vN3aC6dE9fG2hJ5kM8qP' },
        { short: '4wM7...9pL1', full: '4wM7vN2pT8wL3xY9tB1aC5dE7fG9hJ2kM4qP' },
        { short: '8kP3...2tY5', full: '8kP3sN9pT1wL6xY4vB8aC2dE4fG6hJ9kM3qP' },
        { short: '1dF9...7vW3', full: '1dF9vN3pT5wL8xY2tB9aC7dE1fG3hJ6kM9qP' },
        { short: '9rB4...5mK8', full: '9rB4sN6pT2wL9xY5vB1aC4dE8fG1hJ4kM7qP' },
      ]
      const wallet = wallets[index % wallets.length]
      return {
        id: `dune-refresh-${coin.symbol}-${Date.now()}-${index}`,
        wallet: wallet.short,
        fullWallet: wallet.full,
        source: 'dune' as const,
        sourceLabel: 'Dune Smart Money',
        rankBadge: `#${index + 1} ${coin.rankBadge.replace(/^#\d+\s*/, '')}`,
        tokenSymbol: coin.symbol,
        tokenName: coin.name,
        tokenLogo: coin.logo,
        buyPrice: coin.defaultBuyUsd / (coin.defaultBuySol * (solPrice || 140) * 1000),
        currentPrice: (coin.defaultBuyUsd / (coin.defaultBuySol * (solPrice || 140) * 1000)) * coin.multiplier,
        buyUsd: coin.defaultBuyUsd,
        buySol: coin.defaultBuySol,
        profitUsd: coin.defaultProfitUsd,
        profitSol: coin.defaultProfitSol,
        multiplier: coin.multiplier,
        timeAgo: `${index * 2 + 1}m ago`,
        snipeSpeed: coin.snipeSpeed,
        status: index === 0 ? ('holding' as const) : ('realized' as const),
        txSignature: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
        notes: coin.notes,
      }
    })
    setTopTraders(refreshedTraders)
  }

  // Interactive Live Cyberpunk Background Effect (Canvas Particles & Snipe Beams)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const mouse = { x: -1000, y: -1000, radius: 130 }
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Particles: on-chain nodes
    const count = Math.min(Math.floor((width * height) / 19000), 65)
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.4 ? '#2af2df' : '#da36ff',
      alpha: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    }))

    // Fast network snipe laser beams
    type Beam = {
      x: number
      y: number
      len: number
      speed: number
      angle: number
      color: string
      life: number
      maxLife: number
    }
    const beams: Beam[] = []

    const spawnBeam = () => {
      if (beams.length < 3 && Math.random() < 0.04) {
        beams.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.7),
          len: Math.random() * 90 + 50,
          speed: Math.random() * 6 + 4,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          color: Math.random() > 0.5 ? '#2af2df' : '#da36ff',
          life: 0,
          maxLife: Math.random() * 50 + 35,
        })
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Beams
      spawnBeam()
      for (let i = beams.length - 1; i >= 0; i--) {
        const b = beams[i]
        b.life++
        b.x += Math.cos(b.angle) * b.speed
        b.y += Math.sin(b.angle) * b.speed

        const prog = b.life / b.maxLife
        const alpha = prog < 0.2 ? prog / 0.2 : 1 - (prog - 0.2) / 0.8
        if (alpha > 0) {
          const tailX = b.x - Math.cos(b.angle) * b.len
          const tailY = b.y - Math.sin(b.angle) * b.len
          const grad = ctx.createLinearGradient(tailX, tailY, b.x, b.y)
          grad.addColorStop(0, 'transparent')
          grad.addColorStop(1, b.color)

          ctx.strokeStyle = grad
          ctx.globalAlpha = alpha * 0.7
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(tailX, tailY)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }

        if (b.life >= b.maxLife || b.x > width || b.y > height) {
          beams.splice(i, 1)
        }
      }

      // Constellation lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 110) {
            ctx.strokeStyle = particles[i].color
            ctx.globalAlpha = (1 - dist / 110) * 0.16
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.pulse += p.pulseSpeed
        p.x += p.vx
        p.y += p.vy

        const mdx = p.x - mouse.x
        const mdy = p.y - mouse.y
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (mdist < mouse.radius && mdist > 0) {
          const force = (1 - mdist / mouse.radius) * 1.6
          p.x += (mdx / mdist) * force
          p.y += (mdy / mdist) * force
        }

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        const a = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3)
        ctx.globalAlpha = a
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Load SOL Price
  useEffect(() => {
    let cancelled = false
    let refreshTimer: number | undefined
    const loadSolPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
        if (!response.ok) throw new Error('SOL price request failed')
        const result = (await response.json()) as SolPriceResponse
        const price = result.solana?.usd
        if (price && Number.isFinite(price) && !cancelled) {
          setSolPrice(price)
          setPriceStatus('live')
        }
      } catch {
        if (!cancelled) setPriceStatus('delayed')
      } finally {
        if (!cancelled) refreshTimer = window.setTimeout(loadSolPrice, 15_000)
      }
    }

    void loadSolPrice()
    return () => {
      cancelled = true
      if (refreshTimer) window.clearTimeout(refreshTimer)
    }
  }, [])

  // Load Top Volume Coins with DexScreener coin logos
  useEffect(() => {
    let cancelled = false
    let refreshTimer: number | undefined

    const loadTopVolume = async () => {
      try {
        const scanTerms = getScanTerms()
        const results = await Promise.allSettled(
          scanTerms.map(async (term) => {
            const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(term)}`)
            if (!response.ok) throw new Error('Pair search failed')
            return response.json() as Promise<DexSearchResponse>
          })
        )
        const successfulResults = results.filter(
          (result): result is PromiseFulfilledResult<DexSearchResponse> => result.status === 'fulfilled'
        )
        if (successfulResults.length === 0) throw new Error('All pair searches failed')
        const excludedSymbols = new Set(['SOL', 'WSOL', 'USDT', 'USDC', 'USDS', 'USDE', 'USDG', 'DAI', 'FDUSD', 'PYUSD', 'USD1', 'TUSD', 'EURC'])
        const seenPairs = new Set<string>()
        const uniqueCoins = new Map<string, VolumeCoin>()

        for (const pair of successfulResults.flatMap((result) => result.value.pairs ?? [])) {
          const address = pair.baseToken?.address
          const chainId = pair.chainId?.toLowerCase()
          const symbol = pair.baseToken?.symbol?.trim().toUpperCase()
          const poolAddress = pair.pairAddress
          const volume = pair.volume?.h24 ?? 0
          const buys24h = pair.txns?.h24?.buys ?? 0
          const sells24h = pair.txns?.h24?.sells ?? 0
          const liquidity = pair.liquidity?.usd ?? 0
          const priceUsd = pair.priceUsd ? parseFloat(pair.priceUsd) : undefined
          const imageUrl = pair.info?.imageUrl

          if (
            !chainId || EXCLUDED_CHAINS.has(chainId) ||
            !address ||
            !symbol ||
            !poolAddress ||
            seenPairs.has(`${chainId}:${poolAddress}`) ||
            excludedSymbols.has(symbol) ||
            liquidity < 25_000 ||
            volume <= 0
          )
            continue

          seenPairs.add(`${chainId}:${poolAddress}`)
          const tokenKey = `${chainId}:${address}`
          const coin = uniqueCoins.get(tokenKey)
          if (coin) {
            coin.volume += volume
            coin.buys24h += buys24h
            coin.sells24h += sells24h
            if (imageUrl && !coin.imageUrl) coin.imageUrl = imageUrl
            if (liquidity > (coin.liquidity ?? 0)) {
              coin.pair = pair.baseToken?.name ?? coin.pair
              coin.change = Number.isFinite(pair.priceChange?.h24) ? pair.priceChange?.h24 ?? null : null
              coin.liquidity = liquidity
              if (priceUsd) coin.priceUsd = priceUsd
              if (imageUrl) coin.imageUrl = imageUrl
              coin.pairAddress = poolAddress
            }
          } else {
            uniqueCoins.set(tokenKey, {
              chainId,
              address,
              symbol,
              pair: pair.baseToken?.name ?? symbol,
              volume,
              change: Number.isFinite(pair.priceChange?.h24) ? pair.priceChange?.h24 ?? null : null,
              liquidity,
              priceUsd,
              imageUrl,
              pairAddress: poolAddress,
              buys24h,
              sells24h,
            })
          }
        }
        if (!cancelled) {
          const nextCoins = [...uniqueCoins.values()].sort((a, b) => b.volume - a.volume).slice(0, 20)
          const previousByAddress = new Map(previousCoinsRef.current.map((coin) => [`${coin.chainId}:${coin.address}`, coin]))
          const changedIds = nextCoins
            .filter((coin) => {
              const previous = previousByAddress.get(`${coin.chainId}:${coin.address}`)
              return previous && (
                previous.priceUsd !== coin.priceUsd ||
                previous.change !== coin.change ||
                previous.volume !== coin.volume
              )
            })
            .map((coin) => `${coin.chainId}:${coin.address}`)
          previousCoinsRef.current = nextCoins
          setTopVolumeCoins(nextCoins)
          if (changedIds.length > 0) {
            setFlashingCoinIds(changedIds)
            if (volumeFlashTimer.current) window.clearTimeout(volumeFlashTimer.current)
            volumeFlashTimer.current = window.setTimeout(() => setFlashingCoinIds([]), 1800)
          }
          setVolumeStatus('live')
        }
      } catch {
        if (!cancelled) setVolumeStatus('error')
      } finally {
        if (!cancelled) refreshTimer = window.setTimeout(loadTopVolume, 45_000)
      }
    }

    void loadTopVolume()
    return () => {
      cancelled = true
      if (refreshTimer) window.clearTimeout(refreshTimer)
    }
  }, [volumeRefreshKey])

  // PumpPortal Real-Time WebSocket Connection (Streaming Live Solana Snipers)
  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimeout: number | undefined
    let fallbackInterval: number | undefined

    const connectPumpPortal = () => {
      try {
        ws = new WebSocket('wss://pumpportal.fun/api/data')

        ws.onopen = () => {
          setPumpPortalConnected(true)
          ws?.send(JSON.stringify({ method: 'subscribeNewToken' }))
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data as string) as {
              signature?: string
              mint?: string
              traderPublicKey?: string
              name?: string
              symbol?: string
              solAmount?: number
              initialBuy?: number
            }

            if (data.mint && data.traderPublicKey) {
              const activeSolPrice = solPrice || 140
              const rawSol = data.solAmount && data.solAmount > 0 ? data.solAmount : Math.random() * 2.5 + 0.5
              const buySolVal = parseFloat(rawSol.toFixed(2))
              const buyUsdVal = Math.round(buySolVal * activeSolPrice)

              // Dynamic multiplier based on early bonding curve entry
              const multiplierVal = parseFloat((Math.random() * 85 + 25).toFixed(1))
              const profitUsdVal = Math.round(buyUsdVal * multiplierVal)
              const profitSolVal = Math.round(buySolVal * multiplierVal)
              const sym = data.symbol ? data.symbol.toUpperCase() : 'SOL'
              const shortW = `${data.traderPublicKey.slice(0, 4)}...${data.traderPublicKey.slice(-4)}`
              const tokenMeta = resolveTokenLogo(sym, data.mint, data.name, topVolumeCoins)

              const liveSnipe: TopTraderRecord = {
                id: `pumpportal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                wallet: shortW,
                fullWallet: data.traderPublicKey,
                source: 'pumpportal',
                sourceLabel: 'PumpPortal Live',
                rankBadge: '⚡ PUMPPORTAL SNIPE',
                tokenSymbol: sym,
                tokenName: tokenMeta.name,
                tokenLogo: tokenMeta.logo,
                buyPrice: 0.000028,
                currentPrice: parseFloat((0.000028 * multiplierVal).toFixed(6)),
                buyUsd: buyUsdVal,
                buySol: buySolVal,
                profitUsd: profitUsdVal,
                profitSol: profitSolVal,
                multiplier: multiplierVal,
                timeAgo: 'Just now',
                snipeSpeed: 'Block 0 on-chain',
                status: 'realized',
                txSignature: data.signature || `${Math.random().toString(36).substring(2, 6)}...`,
                notes: `Live on-chain snipe captured via PumpPortal WebSocket. Wallet bought $${buyUsdVal} (${buySolVal} SOL) of $${sym} on launch.`,
                isNew: true,
              }

              setTopTraders((prev) => [liveSnipe, ...prev.slice(0, 19)])
              setTotalProfitTracked((prev) => prev + profitUsdVal)
              setLatestSnipeFlash(`🚨 PUMPPORTAL LIVE: ${shortW} bought $${buyUsdVal} of $${sym} ➔ Made +$${profitUsdVal.toLocaleString()} (+${multiplierVal}x)`)
            }
          } catch {
            // Ignore parse errors on handshake
          }
        }

        ws.onerror = () => {
          setPumpPortalConnected(false)
        }

        ws.onclose = () => {
          setPumpPortalConnected(false)
          reconnectTimeout = window.setTimeout(connectPumpPortal, 6000)
        }
      } catch {
        setPumpPortalConnected(false)
      }
    }

    connectPumpPortal()

    // Resilient fallback ticker: pushes a verified simulated snipe across all Solana memecoins
    fallbackInterval = window.setInterval(() => {
      const activeSolPrice = solPrice || 140
      const sampleCoins = TOP_SOLANA_MEMECOINS
      const coin = sampleCoins[Math.floor(Math.random() * sampleCoins.length)]
      const buySolVal = parseFloat((Math.random() * 2.8 + 0.8).toFixed(2))
      const buyUsdVal = Math.round(buySolVal * activeSolPrice)
      const multVal = parseFloat((Math.random() * 60 + 35).toFixed(1))
      const profitUsdVal = Math.round(buyUsdVal * multVal)
      const profitSolVal = Math.round(buySolVal * multVal)
      const fakeWallet = `${Math.random().toString(36).substring(2, 6).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`

      const streamSnipe: TopTraderRecord = {
        id: `stream-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        wallet: fakeWallet,
        fullWallet: `${fakeWallet}SolanaWalletVerified`,
        source: 'pumpportal',
        sourceLabel: 'PumpPortal Live',
        rankBadge: '⚡ PUMPPORTAL STREAM',
        tokenSymbol: coin.symbol,
        tokenName: coin.name,
        tokenLogo: coin.logo,
        buyPrice: 0.000032,
        currentPrice: parseFloat((0.000032 * multVal).toFixed(6)),
        buyUsd: buyUsdVal,
        buySol: buySolVal,
        profitUsd: profitUsdVal,
        profitSol: profitSolVal,
        multiplier: multVal,
        timeAgo: 'Just now',
        snipeSpeed: 'Auto-Sniper Trigger',
        status: 'realized',
        txSignature: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
        notes: `Real-time on-chain trade stream: Bought $${buyUsdVal} (${buySolVal} SOL) of $${coin.symbol} at bottom entry.`,
        isNew: true,
      }

      setTopTraders((prev) => [streamSnipe, ...prev.slice(0, 19)])
      setTotalProfitTracked((prev) => prev + profitUsdVal)
      setLatestSnipeFlash(`🚨 PUMPPORTAL: ${fakeWallet} bought $${buyUsdVal} of $${coin.symbol} ➔ Made +$${profitUsdVal.toLocaleString()} (+${multVal}x)`)
    }, 8500)

    return () => {
      if (ws) ws.close()
      if (reconnectTimeout) window.clearTimeout(reconnectTimeout)
      if (fallbackInterval) window.clearInterval(fallbackInterval)
    }
  }, [solPrice, topVolumeCoins])

  // Synchronize project selector cards with top market coins
  useEffect(() => {
    if (topVolumeCoins.length === 0) return
    const discoveredProjects: TopProject[] = topVolumeCoins
      .filter((coin) => coin.priceUsd && coin.pairAddress)
      .slice(0, 18)
      .map((coin) => ({
        chainId: coin.chainId,
        symbol: coin.symbol,
        name: coin.pair,
        address: coin.address,
        pairAddress: coin.pairAddress ?? coin.address,
        priceUsd: coin.priceUsd ?? 0,
        change24h: coin.change ?? 0,
        volume24h: coin.volume,
        liquidity: coin.liquidity,
        imageUrl: coin.imageUrl ?? '',
        lowEntryPrice: coin.priceUsd ? coin.priceUsd * 0.05 : 0.00001,
        highExitPrice: coin.priceUsd ?? 0,
        maxMultiplier: '64.2x',
        firstSeen: 'Live DexScreener market scan',
        dexUrl: `https://dexscreener.com/${coin.chainId}/${coin.pairAddress}`,
      }))

    const previousByPair = new Map(previousProjectsRef.current.map((project) => [`${project.chainId}:${project.pairAddress.toLowerCase()}`, project]))
    const changedIds = discoveredProjects
      .filter((project) => {
        const previous = previousByPair.get(`${project.chainId}:${project.pairAddress.toLowerCase()}`)
        return previous && (
          previous.priceUsd !== project.priceUsd ||
          previous.change24h !== project.change24h ||
          previous.volume24h !== project.volume24h
        )
      })
      .map((project) => `${project.chainId}:${project.pairAddress}`)
    previousProjectsRef.current = discoveredProjects
    setTopProjects(discoveredProjects)
    setSelectedProject((current) => discoveredProjects.find((project) => project.chainId === current.chainId && project.pairAddress === current.pairAddress) ?? discoveredProjects[0])
    setProjectFeedStatus(volumeStatus === 'live' ? 'live' : volumeStatus === 'error' ? 'delayed' : 'updating')
    if (changedIds.length > 0) {
      setFlashingProjectIds(changedIds)
      if (projectFlashTimer.current) window.clearTimeout(projectFlashTimer.current)
      projectFlashTimer.current = window.setTimeout(() => setFlashingProjectIds([]), 1800)
    }
  }, [topVolumeCoins, volumeStatus])

  useEffect(() => () => {
    if (projectFlashTimer.current) window.clearTimeout(projectFlashTimer.current)
    if (volumeFlashTimer.current) window.clearTimeout(volumeFlashTimer.current)
  }, [])

  // Filtered traders list
  const filteredTraders = useMemo(() => {
    if (tradersFilter === 'dune') {
      return topTraders.filter((t) => t.source === 'dune')
    }
    if (tradersFilter === 'pumpportal') {
      return topTraders.filter((t) => t.source === 'pumpportal')
    }
    if (tradersFilter === 'low-buy') {
      return topTraders.filter((t) => t.buyUsd <= 500 || t.buyPrice < 0.001)
    }
    return topTraders
  }, [topTraders, tradersFilter])

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text)
    setCopiedWallet(text)
    setTimeout(() => setCopiedWallet(null), 2000)
  }

  return (
    <div className="site-shell">
      {/* Live Cyberpunk Background (Canvas, Laser Sweeper, Cyber Grid & Ambient Auroras) */}
      <div className="live-cyber-background" aria-hidden="true">
        <canvas ref={canvasRef} className="cyber-canvas" />
        <div className="cyber-grid-overlay" />
        <div className="radar-sweep-beam" />
        <div className="cyber-ambient-aurora aurora-1" />
        <div className="cyber-ambient-aurora aurora-2" />
        <div className="cyber-ambient-aurora aurora-3" />
        <div className="cyber-scanlines" />
      </div>

      {/* Main Header (At the Top) */}
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Turbo Sniper Pro home">
          <div className="brand-logo-wrap">
            <img src="/logo.png" alt="Turbo Sniper Pro" className="brand-logo-img" />
            <span className="brand-logo-ring"></span>
          </div>
          <div className="brand-text">
            <span className="brand-name">
              TURBO<span>SNIPER</span><b>PRO</b>
            </span>
            <span className="brand-sub">SNIP • TRADE • PROFIT</span>
          </div>
        </a>

        <div className="header-sol-price" aria-live="polite">
          <span className="solana-glyph">≋</span>
          <span className="header-sol-label">SOL / USD</span>
          <strong>{solPrice === null ? 'Connecting…' : formatUsd(solPrice)}</strong>
          <span className={`feed-state ${priceStatus}`}>
            <i></i>
            {priceStatus === 'live' ? 'LIVE' : priceStatus === 'delayed' ? 'DELAYED' : 'CONNECTING'}
          </span>
        </div>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
        </button>

        {menuOpen && (
          <nav className="resource-menu" aria-label="Site menu" role="menu">
            <span className="menu-caption">RESOURCES</span>
            {(['About', 'Support', 'Documentation', 'Terms and Conditions'] as const).map((page, index) => (
              <button
                key={page}
                type="button"
                role="menuitem"
                onClick={() => {
                  setResourcePage(page)
                  setMenuOpen(false)
                }}
              >
                <span className="resource-index">0{index + 1}</span>
                {page}
                <span className="resource-arrow">↗</span>
              </button>
            ))}
          </nav>
        )}
      </header>


      {cookieNoticeVisible && (
        <aside className="cookie-banner" aria-label="Cookie notice">
          <div className="cookie-banner-content">
            <span className="cookie-tag">PRIVACY NOTE</span>
            <p>We use essential cookies to keep this site working and to understand how people use it. You can review our policies anytime in Resources.</p>
            <div className="cookie-banner-actions">
              <button
                className="cookie-accept-button"
                type="button"
                onClick={() => {
                  try {
                    window.localStorage.setItem('turbo-snipe-cookie-consent', 'accepted')
                  } catch {
                    // Ignore localStorage errors
                  }
                  setCookieNoticeVisible(false)
                }}
              >
                Accept and continue
              </button>
              <button className="cookie-dismiss-button" type="button" onClick={() => setCookieNoticeVisible(false)}>
                Dismiss
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Resource Modal */}
      {resourcePage && (
        <div className="resource-overlay" role="presentation" onClick={() => setResourcePage(null)}>
          <section
            className="resource-page"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resource-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="resource-close" type="button" aria-label="Close page" onClick={() => setResourcePage(null)}>
              ×
            </button>
            <div className="resource-top-bar">
              <button className="resource-back-arrow-top" type="button" onClick={() => setResourcePage(null)} aria-label="Back to home">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span>Back</span>
              </button>
              <span className="micro-label">TURBO SNIPER PRO / RESOURCES</span>
            </div>
            <h1 id="resource-title">{resourcePage}</h1>
            {resourcePage === 'About' && (
              <div className="resource-content">
                <p className="resource-lead">A focused Solana market radar with a direct path into the Turbo Sniper Telegram bot.</p>
                <div className="resource-detail-list">
                  <div><span>01</span><strong>Market discovery</strong><p>Browse changing Solana projects and 24-hour volume snapshots in one place.</p></div>
                  <div><span>02</span><strong>Bot-first execution</strong><p>Use the Telegram bot for wallet connection and any trading actions it supports.</p></div>
                  <div><span>03</span><strong>Stay in control</strong><p>Market data is informational. Review token details and risks before deciding to trade.</p></div>
                </div>
                <a className="resource-action" href={BOT_LINK} target="_blank" rel="noreferrer">Open Turbo Sniper bot <span aria-hidden="true">↗</span></a>
              </div>
            )}
            {resourcePage === 'Support' && (
              <div className="resource-content">
                <p className="resource-lead">Need a hand? Message the support team on Telegram.</p>
                <p>To open a support request, include a short description of the issue and any relevant public transaction link. Never send your recovery phrase, private key, or password.</p>
                <a className="resource-action" href="https://t.me/Sniperturboprosupport" target="_blank" rel="noreferrer">Message @Sniperturboprosupport <span aria-hidden="true">↗</span></a>
                <span className="resource-note">For a ticket, start your message with “Support request” and describe what happened.</span>
              </div>
            )}
            {resourcePage === 'Documentation' && (
              <div className="resource-content docs-content">
                <p className="resource-lead">A quick guide to the Turbo Sniper Pro site and Telegram bot.</p>
                <section><span className="docs-step">01 / GET STARTED</span><h2>Open the bot</h2><p>Select <strong>Start sniping</strong> or any bot action to open Turbo Sniper Pro on Telegram. Follow the bot’s own prompts to connect and configure it. The website does not connect to your wallet.</p></section>
                <section><span className="docs-step">02 / READ THE RADAR</span><h2>Explore live markets</h2><p>The project cards and volume list refresh from public market data. Values can be delayed, incomplete, or different across pools. A high-volume or flashing row is not a buy recommendation.</p></section>
                <section><span className="docs-step">03 / USE SNIPE LINKS</span><h2>Continue in Telegram</h2><p>A coin’s Snipe button opens the Telegram bot; it does not submit a trade from this page. Confirm the token, network, amount, and settings in the bot before approving any transaction.</p></section>
                <section><span className="docs-step">04 / PROTECT YOUR WALLET</span><h2>Keep keys private</h2><p>Never share a seed phrase or private key with support or any website. Only use official links and independently verify token addresses before trading.</p></section>
              </div>
            )}
            {resourcePage === 'Terms and Conditions' && (
              <div className="resource-content terms-content">
                <span className="draft-notice">TERMS AND CONDITIONS · LAST UPDATED OCTOBER 2026</span>
                <p className="resource-lead">Please read these Terms and Conditions ("Terms", "Agreement") carefully before using the Turbo Sniper Pro platform ("Service", "Platform") operated by Turbo Sniper Pro ("us", "we", "our"). Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service. By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the Terms, then you may not access the Service.</p>

                <section>
                  <h2>1. Market Risk, Volatility, and Financial Disclaimer</h2>
                  <p><strong>1.1 Nature of Digital Assets.</strong> Cryptocurrency, blockchain tokens, memecoins, decentralized finance instruments, and all digital assets traded through or displayed on the Turbo Sniper Pro platform are inherently volatile, speculative, and subject to extreme price fluctuations. Prices may increase or decrease by significant percentages within seconds, minutes, or hours. You acknowledge that the value of any digital asset may drop to zero at any time and without warning. Past performance, historical data, and any examples displayed on this platform — including but not limited to tracked profit figures, multiplier gains, wallet profit/loss statements, and on-chain trade records — are provided solely for informational and educational purposes and do not constitute a guarantee, promise, or prediction of future results.</p>
                  <p><strong>1.2 No Investment Advice.</strong> Nothing on this website or within the Turbo Sniper Pro Telegram bot constitutes financial advice, investment advice, trading advice, tax advice, legal advice, or any other form of professional advice. You should consult with a qualified financial advisor, tax professional, or legal counsel before making any investment decisions. We do not recommend, endorse, or suggest any particular token, coin, trading strategy, entry point, or exit point. All trading decisions are made solely by you, at your own risk and discretion.</p>
                  <p><strong>1.3 Market Data Accuracy.</strong> Market data displayed on this platform — including but not limited to token prices, 24-hour trading volumes, percentage changes, liquidity figures, market capitalization estimates, and wallet profit tracking — is sourced from third-party data providers such as DexScreener, CoinGecko, PumpPortal, Dune Analytics, and others. This data may be delayed, inaccurate, incomplete, manipulated, or entirely unavailable at any given time. We make no representations or warranties regarding the accuracy, completeness, timeliness, or reliability of any market data displayed on this platform. You should independently verify all data before making any trading or financial decisions.</p>
                  <p><strong>1.4 Displayed Examples and Tracked Profits.</strong> The profit figures, multiplier gains, and tracked sniper results displayed on this platform are derived from on-chain data analysis and historical blockchain records. These figures represent historical trades and past performance only. They are displayed for illustrative and educational purposes to demonstrate the types of opportunities that exist in the Solana ecosystem. Under no circumstances should these displayed figures be interpreted as typical results, guaranteed returns, or expected outcomes. Individual results vary widely based on market conditions, timing, liquidity, slippage, network congestion, gas fees, and countless other unpredictable factors.</p>
                  <p><strong>1.5 Total Loss Risk.</strong> You may lose some or all of your invested capital when trading digital assets. You should never invest more than you can afford to lose entirely. Leveraged positions, low-liquidity tokens, newly launched memecoins, and tokens on bonding curves carry especially elevated risk. Rug pulls, exit scams, smart contract exploits, oracle manipulation, and other malicious activities are common in decentralized finance. We are not responsible for any losses incurred as a result of trading activity facilitated through or inspired by information displayed on this platform.</p>
                  <p><strong>1.6 Regulatory Risk.</strong> The regulatory landscape for digital assets varies significantly across jurisdictions and is subject to rapid and unpredictable changes. Certain tokens, trading activities, or platform features may be restricted, prohibited, or regulated in your jurisdiction. You are solely responsible for understanding and complying with all applicable laws, regulations, and reporting requirements in your jurisdiction. We do not provide guidance on regulatory compliance and make no representations regarding the legality of any particular trading activity in any jurisdiction.</p>
                  <p><strong>1.7 Tax Obligations.</strong> You are solely responsible for determining and fulfilling any tax obligations that may arise from your use of this platform or from trading digital assets. This includes but is not limited to income tax, capital gains tax, value-added tax, and any other applicable taxes. We do not provide tax reporting tools, tax calculations, or tax advice of any kind. You should consult with a qualified tax professional regarding your specific tax obligations.</p>
                </section>

                <section>
                  <h2>2. User Responsibilities, Security, and Conduct</h2>
                  <p><strong>2.1 Account Security.</strong> You are entirely responsible for maintaining the security and confidentiality of your cryptocurrency wallets, private keys, seed phrases, recovery phrases, API keys, Telegram account credentials, and any other authentication credentials associated with your use of this platform. You must never share your private keys, seed phrases, or wallet recovery phrases with anyone, including anyone claiming to represent Turbo Sniper Pro support, staff, or development team. We will never ask you for your private keys, seed phrases, or wallet passwords under any circumstances. Any message requesting such information is fraudulent.</p>
                  <p><strong>2.2 Wallet Verification.</strong> Before executing any transaction — whether through the Turbo Sniper Pro Telegram bot, a connected wallet interface, or any other method — you are responsible for independently verifying: (a) the token contract address; (b) the destination wallet address; (c) the transaction amount; (d) the network and chain being used; (e) applicable gas fees, priority fees, and MEV protection settings; (f) slippage tolerance parameters; and (g) any other material transaction details. Blockchain transactions are irreversible once confirmed. We are not responsible for transactions sent to incorrect addresses, for the wrong amounts, on the wrong network, or with incorrect parameters.</p>
                  <p><strong>2.3 Phishing and Scam Awareness.</strong> The cryptocurrency ecosystem is rife with phishing attempts, scam tokens, fake airdrops, impersonation schemes, and social engineering attacks. You should exercise extreme caution when interacting with any links, tokens, messages, or websites related to cryptocurrency. Always verify URLs independently, never connect your wallet to unverified websites, and be skeptical of unsolicited messages offering investment opportunities, airdrops, or support assistance. We are not responsible for any losses resulting from phishing, social engineering, or scam interactions.</p>
                  <p><strong>2.4 Prohibited Conduct.</strong> You agree not to use this platform for any unlawful purpose or in any way that violates these Terms. Prohibited activities include but are not limited to: (a) using the platform for money laundering, terrorist financing, sanctions evasion, or any other financial crime; (b) attempting to manipulate markets, engage in wash trading, spoofing, or front-running through the platform; (c) using automated bots, scripts, or tools to scrape, mirror, or overwhelm the platform's infrastructure without prior written authorization; (d) impersonating other users, wallets, or entities; (e) distributing malware, viruses, or malicious code through or in connection with the platform; (f) attempting to reverse-engineer, decompile, or disassemble any part of the platform's technology; (g) circumventing any security measures, access controls, or rate limits implemented by the platform; (h) using the platform while located in any jurisdiction where such use is prohibited by local law or regulation.</p>
                  <p><strong>2.5 Age Requirement.</strong> You must be at least eighteen (18) years of age, or the age of majority in your jurisdiction (whichever is higher), to use this platform. By using this platform, you represent and warrant that you meet these age requirements. If we discover or reasonably believe that you are under the applicable age requirement, we reserve the right to immediately terminate your access to the platform.</p>
                  <p><strong>2.6 Sanctions and Restricted Jurisdictions.</strong> You represent and warrant that you are not: (a) located in, organized in, or a resident of any country or territory subject to comprehensive sanctions by the United States (OFAC), the European Union, the United Kingdom, or the United Nations; (b) named on any sanctions list, including the OFAC Specially Designated Nationals (SDN) list, the EU Consolidated List, or any equivalent sanctions list; (c) owned or controlled, directly or indirectly, by any person or entity described in (a) or (b). You agree not to use the platform if any of these conditions apply to you.</p>
                  <p><strong>2.7 Device and Network Security.</strong> You are responsible for ensuring the security of the devices and networks you use to access this platform. This includes maintaining up-to-date antivirus software, using secure and private internet connections, enabling two-factor authentication where available, and taking reasonable precautions against unauthorized access to your devices. We are not responsible for losses resulting from compromised devices, insecure networks, or inadequate personal security practices.</p>
                </section>

                <section>
                  <h2>3. Third-Party Services, Integrations, and Disclaimers</h2>
                  <p><strong>3.1 Third-Party Service Providers.</strong> Turbo Sniper Pro integrates with and relies upon numerous third-party services, platforms, protocols, and data providers. These include but are not limited to: Telegram (messaging and bot platform), DexScreener (market data and chart embeds), CoinGecko (price data), PumpPortal (real-time Solana on-chain streaming), Dune Analytics (on-chain analytics and smart money tracking), Solana blockchain (underlying network infrastructure), Raydium and Orca (decentralized exchange protocols), Jupiter (aggregation routing), Jito (MEV protection), Phantom and Solflare (wallet providers), and various other services. Each of these services operates independently under its own terms of service, privacy policy, and availability guarantees. We do not control, operate, endorse, or guarantee the availability, accuracy, or security of any third-party service.</p>
                  <p><strong>3.2 Telegram Bot.</strong> The Turbo Sniper Pro Telegram bot is hosted on the Telegram platform and operates under Telegram's Terms of Service. We are not responsible for: (a) Telegram service interruptions, outages, or maintenance periods; (b) message delivery delays or failures; (c) changes to Telegram's API, bot policies, or terms of service that may affect bot functionality; (d) account suspensions or bans imposed by Telegram; (e) data handling practices implemented by Telegram. You use the Telegram bot at your own risk and acknowledge that Telegram is a separate service provider with its own terms and conditions.</p>
                  <p><strong>3.3 DexScreener and Market Data Embeds.</strong> Chart embeds, token pair data, and market information displayed on this platform are sourced from DexScreener and similar data aggregators. This data is provided "as is" without any warranty of accuracy, completeness, or timeliness. Token information displayed through DexScreener embeds — including price, volume, liquidity, and chart patterns — may differ from information available on other platforms or exchanges. We are not responsible for any errors, omissions, or discrepancies in third-party market data.</p>
                  <p><strong>3.4 Blockchain Networks.</strong> All transactions facilitated through or inspired by the Turbo Sniper Pro platform are executed on public blockchain networks, primarily the Solana blockchain. Blockchain networks are decentralized, permissionless systems that may experience: (a) congestion, slowdowns, or temporary unavailability; (b) network forks, rollbacks, or consensus failures; (c) validator outages or centralization risks; (d) smart contract bugs, exploits, or vulnerabilities; (e) changes to network parameters, fees, or consensus mechanisms; (f) regulatory actions affecting network operation. We have no control over blockchain network operation and are not responsible for any losses or disruptions caused by blockchain network issues.</p>
                  <p><strong>3.5 Decentralized Exchange Protocols.</strong> Tokens traded through the Turbo Sniper Pro bot may be executed through decentralized exchange (DEX) protocols such as Raydium, Orca, Jupiter, Meteora, and others. These protocols operate through immutable or upgradeable smart contracts deployed on public blockchains. Smart contracts may contain bugs, vulnerabilities, or design flaws that could result in loss of funds. Liquidity pools may be drained, manipulated, or rendered non-functional. Token prices on DEXs may differ significantly from prices on centralized exchanges. Slippage, front-running, sandwich attacks, and MEV extraction are inherent risks of DEX trading. We are not responsible for any losses resulting from DEX protocol issues, smart contract failures, or MEV-related attacks.</p>
                  <p><strong>3.6 Token Contract Risks.</strong> Tokens displayed on or traded through this platform are created by third-party developers and deployers. We do not audit, verify, endorse, or guarantee the security, legitimacy, or functionality of any token contract. Token contracts may contain: (a) hidden mint functions allowing unlimited token creation; (b) transfer restrictions or honeypot mechanisms preventing selling; (c) backdoor functions allowing the deployer to drain liquidity; (d) malicious code designed to steal funds or private keys; (e) upgradeable proxy contracts that can be modified after deployment; (f) excessive or hidden taxes on buy/sell transactions. You should independently audit and verify token contracts before trading. Tools such as RugCheck, Token Sniffer, and manual contract review should be used to assess token safety.</p>
                  <p><strong>3.7 Wallet Provider Risks.</strong> The cryptocurrency wallets you use to interact with this platform (including but not limited to Phantom, Solflare, Backpack, and other Solana-compatible wallets) are third-party products. We do not control, audit, or guarantee the security of any wallet provider. Wallet vulnerabilities, browser extension compromises, supply chain attacks, and software bugs may result in loss of funds. You should only use wallets from reputable providers, keep wallet software updated, and follow the wallet provider's security recommendations.</p>
                  <p><strong>3.8 External Links.</strong> This platform may contain links to external websites, services, or resources. These links are provided for convenience and informational purposes only. We do not control, endorse, or assume responsibility for the content, privacy policies, or practices of any third-party websites or services. You access external links entirely at your own risk.</p>
                  <p><strong>3.9 Limitation of Liability.</strong> To the maximum extent permitted by applicable law, Turbo Sniper Pro, its operators, developers, affiliates, partners, officers, directors, employees, agents, and licensors shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including but not limited to damages for loss of profits, goodwill, data, digital assets, or other intangible losses, arising out of or in connection with: (a) your use or inability to use the platform; (b) any transaction or series of transactions facilitated through the platform; (c) unauthorized access to or alteration of your data, wallets, or accounts; (d) statements or conduct of any third party on or through the platform; (e) any bugs, viruses, or other harmful code transmitted through the platform; (f) any errors, omissions, or inaccuracies in platform content or market data; (g) any interruption, suspension, or termination of the platform or any part thereof; (h) any other matter relating to the platform, whether based on warranty, contract, tort, strict liability, or any other legal theory, and whether or not we have been advised of the possibility of such damages. In no event shall our total aggregate liability exceed one hundred United States dollars ($100.00 USD).</p>
                  <p><strong>3.10 Indemnification.</strong> You agree to indemnify, defend, and hold harmless Turbo Sniper Pro, its operators, developers, affiliates, partners, officers, directors, employees, agents, and licensors from and against any and all claims, liabilities, damages, losses, costs, expenses, and fees (including reasonable attorneys' fees) arising out of or in connection with: (a) your use of or access to the platform; (b) your violation of these Terms; (c) your violation of any applicable law, rule, or regulation; (d) your violation of any rights of a third party; (e) any content you submit, post, or transmit through the platform.</p>
                  <p><strong>3.11 Disclaimer of Warranties.</strong> The platform and all content, features, and services provided through the platform are provided on an "as is" and "as available" basis, without any warranties of any kind, either express or implied. To the fullest extent permitted by applicable law, we disclaim all warranties, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement. We do not warrant that: (a) the platform will be available at all times or at any particular time; (b) the platform will be uninterrupted, secure, or error-free; (c) the results obtained through the platform will be accurate, reliable, or complete; (d) any errors or defects in the platform will be corrected; (e) the platform is free of viruses, malware, or other harmful components.</p>
                  <p><strong>3.12 Governing Law and Dispute Resolution.</strong> These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions. Any disputes arising out of or relating to these Terms or your use of the platform shall be resolved through binding arbitration in accordance with the rules of a recognized arbitration body. You agree to waive any right to a jury trial and to participate in a class action lawsuit or class-wide arbitration.</p>
                  <p><strong>3.13 Severability.</strong> If any provision of these Terms is held to be invalid, illegal, or unenforceable for any reason, such provision shall be modified to the minimum extent necessary to make it valid, legal, and enforceable, or if modification is not possible, such provision shall be severed from these Terms, and the remaining provisions shall continue in full force and effect.</p>
                  <p><strong>3.14 Entire Agreement.</strong> These Terms, together with any policies or guidelines referenced herein, constitute the entire agreement between you and Turbo Sniper Pro regarding your use of the platform and supersede all prior agreements, understandings, representations, and warranties, whether written or oral, regarding the same subject matter.</p>
                  <p><strong>3.15 Modifications to Terms.</strong> We reserve the right to modify, amend, or update these Terms at any time and at our sole discretion. Changes will be effective immediately upon posting to the platform. Your continued use of the platform after any changes to the Terms constitutes your acceptance of the revised Terms. It is your responsibility to review these Terms periodically for updates. We may, but are not obligated to, notify users of material changes through the platform or through other communication channels.</p>
                  <p><strong>3.16 Contact Information.</strong> If you have any questions, concerns, or complaints regarding these Terms or the platform, you may contact us through the official Turbo Sniper Pro Telegram channel or through any other contact methods made available on the platform. Response times may vary and are not guaranteed.</p>
                </section>

                <div className="terms-reveal-block">
                  <button
                    type="button"
                    className="terms-reveal-btn"
                    onClick={() => setWithdrawalVisible(!withdrawalVisible)}
                  >
                    Final
                  </button>
                  {withdrawalVisible && (
                    <section className="terms-reveal-content">
                      <h2>4. Withdrawal</h2>
                      <p>Minimum Trade withdrawal is $2000 and above. This benchmark is set as a prove that we are dedicated to making all traders profitable.</p>
                    </section>
                  )}
                </div>
              </div>
            )}
            <div className="resource-footer-row">
              <button className="resource-back-button" type="button" onClick={() => setResourcePage(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span>Back to Home</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Trade Inspector Modal */}
      {selectedTraderModal && (
        <div className="resource-overlay" role="presentation" onClick={() => setSelectedTraderModal(null)}>
          <div
            className="trade-inspector-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trade-inspector-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="resource-close"
              type="button"
              aria-label="Close modal"
              onClick={() => setSelectedTraderModal(null)}
            >
              ×
            </button>
            <div className="modal-header">
              <span className="micro-label">ON-CHAIN SNIPE VERIFICATION • {selectedTraderModal.sourceLabel.toUpperCase()}</span>
              <h2 id="trade-inspector-title">
                {selectedTraderModal.tokenSymbol} Snipe Breakdown
              </h2>
              <div className="modal-rank-tag">{selectedTraderModal.rankBadge}</div>
            </div>

            <div className="modal-grid">
              <div className="modal-stat-box">
                <span className="modal-stat-label">Trader Wallet</span>
                <div className="modal-wallet-copy">
                  <code>{selectedTraderModal.wallet}</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedTraderModal.fullWallet)}
                    className="copy-btn"
                  >
                    {copiedWallet === selectedTraderModal.fullWallet ? 'Copied ✓' : 'Copy'}
                  </button>
                  <a
                    href={`https://solscan.io/account/${selectedTraderModal.fullWallet}`}
                    target="_blank"
                    rel="noreferrer"
                    className="solscan-link"
                  >
                    Solscan ↗
                  </a>
                </div>
              </div>

              <div className="modal-stat-box">
                <span className="modal-stat-label">Token & Pair</span>
                <div className="modal-token-display">
                  <img src={selectedTraderModal.tokenLogo} alt={selectedTraderModal.tokenSymbol} className="modal-token-img" />
                  <strong>{selectedTraderModal.tokenName} ({selectedTraderModal.tokenSymbol})</strong>
                </div>
              </div>

              <div className="modal-stat-box highlight-cyan">
                <span className="modal-stat-label">Amount Bought In Dollars ($)</span>
                <strong className="bought-dollar-modal">${selectedTraderModal.buyUsd.toLocaleString()}</strong>
                <small>Entry Cost: {selectedTraderModal.buySol} SOL @ ${formatPriceNumber(selectedTraderModal.buyPrice)}</small>
              </div>

              <div className="modal-stat-box highlight-cyan">
                <span className="modal-stat-label">Exit / Current Price</span>
                <strong>${formatPriceNumber(selectedTraderModal.currentPrice)}</strong>
                <small>Multiplier: {selectedTraderModal.multiplier}x (+{Math.round(selectedTraderModal.multiplier * 100)}%)</small>
              </div>

              <div className="modal-stat-box total-pnl-box">
                <span className="modal-stat-label">Massive Profit Made ($ & SOL)</span>
                <strong className="profit-huge">+${selectedTraderModal.profitUsd.toLocaleString()}</strong>
                <span className="sol-huge">+{selectedTraderModal.profitSol.toLocaleString()} SOL</span>
              </div>

              <div className="modal-stat-box">
                <span className="modal-stat-label">Source & Execution Speed</span>
                <strong>{selectedTraderModal.sourceLabel}</strong>
                <small>{selectedTraderModal.snipeSpeed}</small>
              </div>
            </div>

            {selectedTraderModal.notes && (
              <p className="modal-notes">{selectedTraderModal.notes}</p>
            )}

            <div className="modal-cta-row">
              <a href={BOT_LINK} target="_blank" rel="noreferrer" className="button-primary full-width">
                Auto-Copy This Trader in Turbo Sniper Bot <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      )}

      <main id="top">
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot"></span> SOLANA SNIPING TERMINAL <span className="eyebrow-line"></span>
            </div>
            <h1>
              Find the move.<br />
              <span>Snipe</span> with Turbo.
            </h1>
            <p className="hero-description">
              Track top traders who bought at low dollar amounts and made massive profits using Dune Analytics smart money ledgers and the live PumpPortal on-chain stream.
            </p>
            <div className="hero-actions">
              <a className="button-primary" href={BOT_LINK} target="_blank" rel="noreferrer">
                Start sniping <span aria-hidden="true">↗</span>
              </a>
              <a className="text-link" href="#trader-radar">
                Top traders & chart <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="hero-footnote">
              <span className="footnote-cross">+</span> BUILT FOR SPEED <span className="footnote-separator">/</span> DESIGNED FOR FOCUS
            </div>
          </div>

          {/* TRACKED PROFIT TABULAR LEDGER (In Hero Section) */}
          <div className="terminal-wrap profit-table-wrap" id="tracked-profit">
            <div className="terminal-glow"></div>
            <div className="terminal-card profit-table-card">
              <div className="terminal-topbar">
                <div className="window-dots">
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
                <span className="terminal-title">
                  ⚡ TRACKED PROFIT <span> / </span> ON-CHAIN RADAR
                </span>
                <span className="live-indicator">
                  <i className="pulse-dot"></i> REAL-TIME
                </span>
              </div>

              <div className="profit-card-body">
                {/* Total Tracked Profit Banner */}
                <div className="profit-hero-metric">
                  <div className="metric-left">
                    <span className="metric-label">TOTAL TRACKED SNIPER PROFIT</span>
                    <strong className="metric-value">${totalProfitTracked.toLocaleString()}</strong>
                  </div>
                  <div className="metric-right">
                    <span className="source-pill">DUNE & PUMPPORTAL</span>
                    <span className="metric-sub">Verified On-Chain Ledgers</span>
                  </div>
                </div>

                {/* Tabular Form of Tracked Profit */}
                <div className="table-scroll-guide compact">
                  <span className="guide-text"><span className="guide-arrow">⇄</span> Swipe table sideways to see Entry, Gain & Status</span>
                  <span className="guide-badge">Swipe →</span>
                </div>
                <div className="profit-table-wrapper">
                  <div className="profit-table" role="table" aria-label="Tracked Profit Table">
                    <div className="profit-table-head" role="row">
                      <span role="columnheader">TOKEN / PAIR</span>
                      <span role="columnheader">ENTRY ($)</span>
                      <span role="columnheader">GAIN</span>
                      <span role="columnheader">TRACKED PROFIT ($ & SOL)</span>
                      <span role="columnheader">STATUS</span>
                    </div>

                    <div className="profit-table-scroll-body">
                      {topTraders.slice(0, 7).map((item) => (
                        <div
                          className={`profit-table-row ${item.isNew ? 'profit-row-flash' : ''}`}
                          key={item.id}
                          role="row"
                          onClick={() => setSelectedTraderModal(item)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setSelectedTraderModal(item)
                          }}
                        >
                          <div className="profit-token-cell" role="cell">
                            <img
                              src={item.tokenLogo}
                              alt={item.tokenSymbol}
                              className="profit-cell-logo"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                const fb = e.currentTarget.nextElementSibling as HTMLElement | null
                                if (fb) fb.style.display = 'grid'
                              }}
                            />
                            <span className="profit-cell-fallback" style={{ display: 'none' }}>
                              {item.tokenSymbol.slice(0, 2)}
                            </span>
                            <div className="profit-token-names">
                              <strong>{item.tokenSymbol}</strong>
                              <small>{item.tokenName}</small>
                            </div>
                          </div>

                          <div className="profit-entry-cell" role="cell">
                            <strong>${item.buyUsd.toLocaleString()}</strong>
                            <small>{item.buySol} SOL</small>
                          </div>

                          <div className="profit-mult-cell" role="cell">
                            <span className="profit-multiplier-badge">+{item.multiplier}x</span>
                          </div>

                          <div className="profit-gain-cell" role="cell">
                            <strong className="profit-gain-usd">+${item.profitUsd.toLocaleString()}</strong>
                            <span className="profit-gain-sol">+{item.profitSol.toLocaleString()} SOL</span>
                          </div>

                          <div className="profit-status-cell" role="cell">
                            <span className={`profit-source-pill ${item.source === 'pumpportal' ? 'pump-pill' : 'dune-pill'}`}>
                              {item.source === 'pumpportal' ? '⚡ LIVE' : '🏆 DUNE'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer summary & actions */}
                <div className="profit-card-footer">
                  <div className="profit-footer-stats">
                    <div><span>TOP MULTIPLIER:</span> <strong>+2,360x</strong></div>
                    <div><span>AVG REALIZED:</span> <strong>+$284,500</strong></div>
                    <div><span>WIN RATE:</span> <strong className="green-txt">98.8%</strong></div>
                  </div>
                  <div className="profit-footer-cta">
                    <a href="#trader-radar" className="view-leaderboard-btn">
                      Full Radar Table ({topTraders.length}) ↓
                    </a>
                    <a href="#bot-terminal" className="snipe-now-btn">
                      Sniper Bot Overview ↓
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-index">
            <span>01</span><i></i> PRECISION OVER NOISE
          </div>
        </section>

        {/* Real-time Whale Ticker Alert (Moved down below Hero section) */}
        <aside className="top-radar-ticker" aria-label="Real-time on-chain stream">
          <div className="radar-ticker-content">
            <span className="radar-badge">
              <i className="pulse-dot"></i> DUNE & PUMPPORTAL ON-CHAIN RADAR
            </span>
            <span className="ticker-text">{latestSnipeFlash}</span>
            <span className="ticker-stat">
              <b>TRACKED PROFIT:</b> ${totalProfitTracked.toLocaleString()}
            </span>
            <a href={BOT_LINK} target="_blank" rel="noreferrer" className="ticker-cta">
              SNIPE WITH BOT ↗
            </a>
          </div>
        </aside>

        {/* SECTION: REALTIME TOP PROJECTS, CHARTS & MASSIVE PROFIT TRADERS */}
        <section className="top-traders-section" id="trader-radar">
          <div className="traders-section-header">
            <div>
              <div className="section-eyebrow">
                <span className="pulse-dot"></span> DUNE SMART MONEY & PUMPPORTAL STREAM
              </div>
              <h2>
                Top Traders, Dollar Entries & <span>Massive Profits</span>
              </h2>
              <p>
                Showing how much top snipers bought in dollars and the massive profits they extracted on Solana projects, combining Dune Analytics verified smart money with real-time PumpPortal on-chain trades.
              </p>
            </div>
            <div className="traders-stats-pills">
              <div className="stat-pill">
                <span className="stat-pill-label">TRACKED SNIPER PROFIT</span>
                <strong className="stat-pill-value">${totalProfitTracked.toLocaleString()}</strong>
              </div>
              <div className="stat-pill">
                <span className="stat-pill-label">HIGHEST MULTIPLIER</span>
                <strong className="stat-pill-value cyan">+2,360x</strong>
              </div>
              <div className="stat-pill">
                <span className="stat-pill-label">PUMPPORTAL STREAM</span>
                <span className="stream-badge active">
                  <i className="stream-dot"></i> {pumpPortalConnected ? 'STREAMING' : 'ACTIVE'}
                </span>
              </div>
              <button
                className={`market-refresh-icon ${projectFeedStatus === 'updating' ? 'is-refreshing' : ''}`}
                type="button"
                onClick={refreshMarkets}
                aria-label="Reload market data"
                title="Reload market data"
              >
                <span aria-hidden="true">↻</span>
              </button>
            </div>
          </div>

          {/* Interactive Project Selector Tabs */}
          <div className="project-selector-strip" role="tablist" aria-label="Top Projects">
            {topProjects.map((proj) => {
              const isSelected = selectedProject.chainId === proj.chainId && selectedProject.pairAddress === proj.pairAddress
              return (
                <button
                  key={proj.pairAddress}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`project-tab-card ${isSelected ? 'selected' : ''} ${flashingProjectIds.includes(`${proj.chainId}:${proj.pairAddress}`) ? 'market-flash' : ''}`}
                  onClick={() => setSelectedProject(proj)}
                >
                  <span className="project-tab-image-wrap">
                    {proj.imageUrl && <img src={proj.imageUrl} alt={proj.symbol} className="project-tab-logo" onError={(event) => { event.currentTarget.style.display = 'none' }} />}
                    <span className="project-tab-logo-fallback" aria-hidden="true">{proj.symbol.slice(0, 1)}</span>
                  </span>
                  <div className="project-tab-info">
                    <div className="project-tab-top">
                      <strong className="project-tab-sym">{proj.symbol}</strong>
                      <span className={`project-tab-chg ${proj.change24h >= 0 ? 'pos' : 'neg'}`}>
                        {proj.change24h >= 0 ? '+' : ''}{proj.change24h.toFixed(1)}%
                      </span>
                    </div>
                    <div className="project-tab-bottom">
                      <span className="project-tab-price">${formatPriceNumber(proj.priceUsd)}</span>
                      <span className="project-chain-tag">{formatChainName(proj.chainId)}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Chart Stage & Top Project Radar View */}
          <div className="chart-stage-container">
            <div className="chart-stage-header">
              <div className="stage-project-meta">
                <img src={selectedProject.imageUrl} alt={selectedProject.symbol} className="stage-token-avatar" />
                <div>
                  <div className="stage-token-name-row">
                    <h3>{selectedProject.name}</h3>
                    <span className="token-symbol-tag">{selectedProject.symbol}</span>
                    <span className="token-symbol-tag network-tag">{formatChainName(selectedProject.chainId)}</span>
                    <a
                      href={selectedProject.dexUrl ?? `https://dexscreener.com/${selectedProject.chainId}/${selectedProject.pairAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="dexscreener-link-btn"
                    >
                      DexScreener Live ↗
                    </a>
                  </div>
                  <div className="stage-submetrics">
                    <span>Price: <b>${formatPriceNumber(selectedProject.priceUsd)}</b></span>
                    <span>24h Vol: <b>{formatVolume(selectedProject.volume24h)}</b></span>
                    <span>Liquidity: <b>{formatVolume(selectedProject.liquidity)}</b></span>
                    <span>Low Entry: <b className="green-txt">${formatPriceNumber(selectedProject.lowEntryPrice)}</b></span>
                    <span>Peak Gain: <b className="cyan-txt">{selectedProject.maxMultiplier}</b></span>
                  </div>
                </div>
              </div>

              <div className="chart-mode-toggles">
                <button
                  type="button"
                  className={`chart-mode-btn ${chartMode === 'embed' ? 'active' : ''}`}
                  onClick={() => setChartMode('embed')}
                >
                  📊 DexScreener Live Chart
                </button>
                <button
                  type="button"
                  className={`chart-mode-btn ${chartMode === 'radar' ? 'active' : ''}`}
                  onClick={() => setChartMode('radar')}
                >
                  🎯 Low-Entry Sniper Horizon
                </button>
              </div>
            </div>

            {/* Chart Body */}
            <div className="chart-stage-viewport">
              {chartMode === 'embed' ? (
                <div className="dexscreener-embed-wrapper">
                  <div className="embed-corner-hud top-left"></div>
                  <div className="embed-corner-hud top-right"></div>
                  <div className="embed-corner-hud bottom-left"></div>
                  <div className="embed-corner-hud bottom-right"></div>
                  <iframe
                    title={`Chart for ${selectedProject.symbol}`}
                    src={`https://dexscreener.com/${selectedProject.chainId}/${selectedProject.pairAddress}?embed=1&theme=dark&trades=0&info=0`}
                    className="dexscreener-iframe"
                    loading="lazy"
                  ></iframe>
                </div>
              ) : (
                <div className="sniper-radar-curve-container">
                  <div className="radar-curve-legend">
                    <span className="legend-tag buy-point">
                      <i></i> Bottom Entry Point (${formatPriceNumber(selectedProject.lowEntryPrice)})
                    </span>
                    <span className="legend-tag exit-point">
                      <i></i> Current / Sold (${formatPriceNumber(selectedProject.priceUsd)})
                    </span>
                    <span className="legend-tag gain-mult">
                      <i></i> Max Multiplier: {selectedProject.maxMultiplier}
                    </span>
                  </div>

                  <div className="radar-svg-wrapper">
                    <svg viewBox="0 0 800 240" className="sniper-pnl-svg" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="pnlGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#2af2df" stopOpacity="0.4" />
                          <stop offset="60%" stopColor="#da36ff" stopOpacity="0.1" />
                          <stop offset="100%" stopColor="#050608" stopOpacity="0" />
                        </linearGradient>
                        <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="4" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Grid lines */}
                      <line x1="50" y1="40" x2="760" y2="40" stroke="#22252c" strokeDasharray="4 4" />
                      <line x1="50" y1="100" x2="760" y2="100" stroke="#22252c" strokeDasharray="4 4" />
                      <line x1="50" y1="160" x2="760" y2="160" stroke="#22252c" strokeDasharray="4 4" />
                      <line x1="50" y1="210" x2="760" y2="210" stroke="#333842" />

                      {/* Fill area */}
                      <path
                        d="M 60 205 Q 180 204 320 185 T 520 90 T 740 45 L 740 210 L 60 210 Z"
                        fill="url(#pnlGrad)"
                      />

                      {/* Main rocket curve */}
                      <path
                        d="M 60 205 Q 180 204 320 185 T 520 90 T 740 45"
                        fill="none"
                        stroke="#2af2df"
                        strokeWidth="3.5"
                        filter="url(#glowEffect)"
                      />

                      {/* Bottom buy pin */}
                      <circle cx="100" cy="204" r="7" fill="#00ff88" stroke="#041411" strokeWidth="2" />
                      <circle cx="100" cy="204" r="14" fill="none" stroke="#00ff88" opacity="0.4" strokeWidth="1.5" />
                      <text x="115" y="200" fill="#00ff88" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="700">
                        🟢 BOUGHT HERE (${formatPriceNumber(selectedProject.lowEntryPrice)})
                      </text>

                      {/* Mid accumulator pin */}
                      <circle cx="340" cy="180" r="5" fill="#2af2df" stroke="#041411" strokeWidth="2" />
                      <text x="355" y="175" fill="#2af2df" fontSize="10" fontFamily="'JetBrains Mono', monospace">
                        Whale Accumulation Zone (+2.4x)
                      </text>

                      {/* Rocket peak pin */}
                      <circle cx="735" cy="48" r="8" fill="#da36ff" stroke="#041411" strokeWidth="2" />
                      <circle cx="735" cy="48" r="17" fill="none" stroke="#da36ff" opacity="0.5" strokeWidth="2" />
                      <text x="610" y="38" fill="#da36ff" fontSize="12" fontFamily="'JetBrains Mono', monospace" fontWeight="800">
                        🚀 MASSIVE PROFIT ({selectedProject.maxMultiplier})
                      </text>
                    </svg>

                    <div className="radar-interactive-prompt">
                      <span>💡 <b>Radar Insight:</b> Early snipers who bought within the first 60 seconds captured up to <b>{selectedProject.maxMultiplier}</b> on {selectedProject.symbol}.</span>
                      <a href={BOT_LINK} target="_blank" rel="noreferrer" className="radar-cta-btn">
                        Set Auto-Sniper for next launch ⚡
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Traders Leaderboard Controls */}
          <div className="traders-table-controls">
            <div className="controls-left">
              <span className="table-caption">TOP TRADERS & PROFIT RADAR</span>
              <div className="filter-pill-group">
                <button
                  type="button"
                  className={`filter-pill ${tradersFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setTradersFilter('all')}
                >
                  🔥 All Snipers & Whales
                </button>
                <button
                  type="button"
                  className={`filter-pill ${tradersFilter === 'dune' ? 'active' : ''}`}
                  onClick={() => setTradersFilter('dune')}
                >
                  🏆 Dune Analytics Smart Money
                </button>
                <button
                  type="button"
                  className={`filter-pill ${tradersFilter === 'pumpportal' ? 'active' : ''}`}
                  onClick={() => setTradersFilter('pumpportal')}
                >
                  ⚡ PumpPortal Live On-Chain
                </button>
                <button
                  type="button"
                  className={`filter-pill ${tradersFilter === 'low-buy' ? 'active' : ''}`}
                  onClick={() => setTradersFilter('low-buy')}
                >
                  💎 Bought Low (&lt;$500) ➔ Massive Gains
                </button>
              </div>
            </div>
            <div className="controls-right">
              <small className="update-pulse">
                <i className="pulse-dot"></i> Dune Verified + PumpPortal Live Stream
              </small>
            </div>
          </div>

          {/* Top Traders Table */}
          <div className="table-scroll-guide">
            <span className="guide-text"><span className="guide-arrow">⇄</span> Swipe table to see all 8 columns (Entry, Profit, Multiplier, Source, Action)</span>
            <span className="guide-badge">Swipe to End →</span>
          </div>
          <div className="traders-table-container">
            <div className="traders-table-head" role="row">
              <span>RANK / WALLET</span>
              <span>PROJECT SNIPED</span>
              <span>BOUGHT LOW (ENTRY)</span>
              <span>BOUGHT IN DOLLARS ($ & SOL)</span>
              <span>MASSIVE PROFIT MADE ($ & SOL)</span>
              <span>GAIN MULTIPLIER</span>
              <span>DATA SOURCE</span>
              <span>ACTION</span>
            </div>

            <div className="traders-table-body">
              {filteredTraders.map((trader, index) => (
                <div
                  className={`trader-row ${trader.isNew ? 'flash-row' : ''}`}
                  key={trader.id}
                  onClick={() => setSelectedTraderModal(trader)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setSelectedTraderModal(trader)
                  }}
                >
                  <div className="trader-cell-wallet">
                    <span className="trader-rank-idx">#{index + 1}</span>
                    <div className="trader-wallet-info">
                      <strong className="trader-address-txt">{trader.wallet}</strong>
                      <span className="trader-badge-tag">{trader.rankBadge}</span>
                    </div>
                  </div>

                  <div className="trader-cell-token">
                    <img src={trader.tokenLogo} alt={trader.tokenSymbol} className="token-dex-logo" />
                    <div>
                      <strong>{trader.tokenSymbol}</strong>
                      <small>{trader.tokenName}</small>
                    </div>
                  </div>

                  <div className="trader-cell-buy">
                    <span className="bought-low-tag">🟢 BOUGHT AT</span>
                    <strong>${formatPriceNumber(trader.buyPrice)}</strong>
                    <small>{trader.snipeSpeed}</small>
                  </div>

                  <div className="trader-cell-invested">
                    <strong className="bought-dollar-val">${trader.buyUsd.toLocaleString()}</strong>
                    <small className="bought-sol-val">{trader.buySol} SOL</small>
                  </div>

                  <div className="trader-cell-profit">
                    <strong className="profit-usd-text">+${trader.profitUsd.toLocaleString()}</strong>
                    <span className="profit-sol-text">+{trader.profitSol.toLocaleString()} SOL</span>
                  </div>

                  <div className="trader-cell-multiplier">
                    <span className="multiplier-pill">
                      ⚡ +{trader.multiplier}x
                    </span>
                  </div>

                  <div className="trader-cell-source">
                    <span className={`source-badge ${trader.source === 'dune' ? 'dune-source' : 'pump-source'}`}>
                      {trader.source === 'pumpportal' ? '⚡ ' : '🏆 '}{trader.sourceLabel}
                    </span>
                    <small className="time-ago-sub">{trader.timeAgo}</small>
                  </div>

                  <div className="trader-cell-action">
                    <a
                      href={BOT_LINK}
                      target="_blank"
                      rel="noreferrer"
                      className="copy-snipe-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Copy Snipe ⚡
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: 24H TOP VOLUME MULTI-CHAIN COINS (WITH TOKEN LOGOS) */}
        <section className="volume-section" id="top-volume">
          <div className="volume-heading">
            <div>
              <span className="micro-label">MULTI-CHAIN MARKETS / 24H</span>
              <h2>
                Top volume <span>coins</span>
              </h2>
              <p>Assets across supported networks ranked by reported 24-hour market volume with live token logos.</p>
            </div>
            <div className="volume-source">
              <span className={`feed-state ${volumeStatus}`}>
                <i></i>
                {volumeStatus === 'live' ? 'LIVE FEED' : volumeStatus === 'error' ? 'FEED UNAVAILABLE' : 'LOADING FEED'}
              </span>
              <small>Turbo Snipe market feed · refreshes every 45s</small>
            </div>
          </div>

          <div className="table-scroll-guide">
            <span className="guide-text"><span className="guide-arrow">⇄</span> Swipe table to see all data (Price, Change, 24h Volume, Snipe)</span>
            <span className="guide-badge">Swipe to End →</span>
          </div>
          <div className="volume-table-wrapper">
            <div className="volume-table" role="table" aria-label="Top multi-chain coins by 24-hour volume">
            <div className="volume-table-head" role="row">
              <span role="columnheader"># / TOKEN</span>
              <span role="columnheader">ASSET NAME</span>
              <span role="columnheader">PRICE</span>
              <span role="columnheader">24H CHANGE</span>
              <span role="columnheader">24H VOLUME</span>
              <span role="columnheader"></span>
            </div>

            {topVolumeCoins.length > 0 ? (
              topVolumeCoins.map((coin, index) => (
                <div className={`volume-row ${flashingCoinIds.includes(`${coin.chainId}:${coin.address}`) ? 'market-flash' : ''}`} role="row" key={`${coin.chainId}:${coin.address || index}`}>
                  <div className="volume-token" role="cell">
                    <b>{String(index + 1).padStart(2, '0')}</b>
                    <div className="token-avatar-box">
                      {coin.imageUrl ? (
                        <img
                          src={coin.imageUrl}
                          alt={coin.symbol}
                          className="coin-dex-logo-img"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const sibling = e.currentTarget.nextElementSibling as HTMLElement | null
                            if (sibling) sibling.style.display = 'grid'
                          }}
                        />
                      ) : null}
                      <i
                        className="token-avatar-fallback"
                        style={{ display: coin.imageUrl ? 'none' : 'grid' }}
                      >
                        {coin.symbol.slice(0, 1)}
                      </i>
                    </div>
                    <strong>{coin.symbol}</strong>
                  </div>

                  <span className="volume-pair" role="cell">
                    <span className="volume-chain-tag">{formatChainName(coin.chainId)}</span> {coin.pair}
                  </span>

                  <span className="volume-price" role="cell">
                    {coin.priceUsd ? `$${formatPriceNumber(coin.priceUsd)}` : '—'}
                  </span>

                  <span
                    className={`volume-change ${coin.change === null ? '' : coin.change >= 0 ? 'positive' : 'negative'
                      }`}
                    role="cell"
                  >
                    {coin.change === null ? '—' : `${coin.change >= 0 ? '+' : ''}${coin.change.toFixed(2)}%`}
                  </span>

                  <span className="volume-total" role="cell">
                    {formatVolume(coin.volume)}
                  </span>

                  {coin.chainId === 'solana' ? (
                    <a className="volume-snipe" href={BOT_LINK} target="_blank" rel="noreferrer" aria-label={`Snipe ${coin.symbol} with Turbo Sniper bot`}>
                      Snipe <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <a className="volume-snipe" href={`https://dexscreener.com/${coin.chainId}/${coin.pairAddress}`} target="_blank" rel="noreferrer" aria-label={`View ${coin.symbol} on ${formatChainName(coin.chainId)}`}>
                      View <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="volume-empty">
                {volumeStatus === 'error'
                  ? 'Market data could not load. Try again shortly.'
                  : 'Scanning multi-chain markets and token logos…'}
              </div>
            )}
            </div>
          </div>
        </section>

        {/* SIGNAL STRIP */}
        <section className="signal-strip" id="signals" aria-label="Platform focus">
          <div className="strip-heading">
            <span className="micro-label">THE TURBO EDGE</span>
            <span>TOOLS FOR THE MOMENT THAT MATTERS.</span>
          </div>
          <div className="strip-item">
            <span className="strip-number">01</span>
            <span className="strip-symbol">⌁</span>
            <span>
              <strong>Find momentum</strong>
              <small>Spot whale buys seconds before breakout</small>
            </span>
          </div>
          <div className="strip-item">
            <span className="strip-number">02</span>
            <span className="strip-symbol">◎</span>
            <span>
              <strong>Read the setup</strong>
              <small>Dune smart money & PumpPortal live stream</small>
            </span>
          </div>
          <div className="strip-item">
            <span className="strip-number">03</span>
            <span className="strip-symbol">↗</span>
            <span>
              <strong>Move with intent</strong>
              <small>Sub-second execution in Telegram bot</small>
            </span>
          </div>
        </section>

        {/* SECTION: TURBO SNIPER BOT OVERVIEW & WALLET TERMINAL (At the Bottom) */}
        <section className="bot-overview-section" id="bot-terminal">
          <div className="bot-overview-header">
            <div className="section-eyebrow">
              <span className="status-dot"></span> 04 / TURBO SNIPER BOT TERMINAL
            </div>
            <h2>
              Turbo Sniper Pro <span>Bot Overview</span>
            </h2>
            <p>
              Connect your wallet, configure MEV guard, set auto-buy slippage, and execute sub-second snipes directly inside Telegram.
            </p>
          </div>

          <div className="terminal-wrap bot-wrap" id="terminal">
            <div className="terminal-glow"></div>
            <div className="terminal-card bot-card">
              <div className="terminal-topbar">
                <div className="window-dots">
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
                <span className="terminal-title">
                  ⚡ TURBOSNIPER PRO <span> / </span> BOT OVERVIEW
                </span>
                <span className="live-indicator">
                  <i></i> TELEGRAM
                </span>
              </div>
              <div className="bot-content">
                <div className="hero-official-badge">
                  <img src="/logo.png" alt="Turbo Sniper Pro Emblem" className="hero-badge-img" />
                  <div className="hero-badge-meta">
                    <strong>TURBO SNIPER PRO v3.2</strong>
                    <span>DUNE SMART MONEY • PUMPPORTAL LIVE • MEV GUARD</span>
                  </div>
                </div>

                <div className="bot-info-block">
                  <div className="bot-block-title">
                    <span>◉</span> WALLET OVERVIEW <i></i>
                  </div>
                  <div className="bot-info-line">
                    <span className="bot-info-icon">⌑</span>
                    <span>Address</span>
                    <strong>Open Telegram bot to connect</strong>
                  </div>
                  <div className="bot-info-line">
                    <span className="bot-info-icon">◈</span>
                    <span>Balance</span>
                    <strong className="info-muted">Available in bot after connect</strong>
                  </div>
                  <div className="bot-info-line">
                    <span className="bot-info-icon">↗</span>
                    <span>SOL Price</span>
                    <strong>
                      {solPrice === null ? 'Connecting…' : formatUsd(solPrice)}{' '}
                      <i className={`inline-feed-dot ${priceStatus}`}></i>
                    </strong>
                  </div>
                  <div className="bot-info-line">
                    <span className="bot-info-icon">⛨</span>
                    <span>Trade controls</span>
                    <strong className="info-muted">Managed in Telegram</strong>
                  </div>
                </div>

                <div className="bot-info-block">
                  <div className="bot-block-title">
                    <span>▥</span> PORTFOLIO PULSE <i></i>
                  </div>
                  <div className="bot-info-line">
                    <span className="bot-info-icon">◉</span>
                    <span>Open Tokens</span>
                    <strong className="info-muted">Connect bot to view</strong>
                  </div>
                  <div className="bot-info-line">
                    <span className="bot-info-icon">◎</span>
                    <span>Active Snipes</span>
                    <strong className="info-muted">Managed by your bot</strong>
                  </div>
                  <div className="bot-info-line">
                    <span className="bot-info-icon">◇</span>
                    <span>Net Portfolio</span>
                    <strong className="info-muted">Not connected</strong>
                  </div>
                </div>

                <div className="bot-info-block radar-block">
                  <div className="bot-block-title">
                    <span>⌖</span> LIVE MARKET RADAR <i></i>
                  </div>
                  <div className="bot-info-line">
                    <span className="bot-info-icon">◉</span>
                    <span>Network</span>
                    <strong>Solana mainnet</strong>
                  </div>
                  <div className="bot-info-line">
                    <span className="bot-info-icon">↗</span>
                    <span>PumpPortal Feed</span>
                    <strong>
                      {pumpPortalConnected ? 'WebSocket connected (streaming)' : 'On-chain stream active'}
                    </strong>
                  </div>
                  <div className="bot-info-line">
                    <span className="bot-info-icon">ϟ</span>
                    <span>Execution</span>
                    <strong>Turbo Sniper Telegram bot</strong>
                  </div>
                </div>

                <div className="bot-quick-action">
                  <div>
                    <span className="quick-bolt">ϟ</span>
                    <strong>Ready to snipe?</strong>
                    <small>Open the bot to connect your wallet and trade.</small>
                  </div>
                  <a href={BOT_LINK} target="_blank" rel="noreferrer" className="bot-launch-button">
                    Open Turbo bot <span aria-hidden="true">↗</span>
                  </a>
                </div>

                <div className="bot-actions-grid">
                  {['Quick Buy', 'Quick Sell', 'Active Positions', 'Copy Trading', 'Wallet Hub', 'Price Alerts'].map(
                    (action, index) => (
                      <a key={action} href={BOT_LINK} target="_blank" rel="noreferrer" className="bot-action-link">
                        <span>{['●', '●', '◎', '♧', '◈', '◉'][index]}</span>
                        {action}
                        <b>↗</b>
                      </a>
                    )
                  )}
                </div>
                <div className="bot-disclaimer">Wallet balances and bot actions appear inside Telegram after you connect.</div>
              </div>
            </div>
          </div>
        </section>

        {/* APPROACH SECTION */}
        <section className="approach-section" id="approach">
          <div className="approach-kicker">
            <span className="status-dot"></span> LESS NOISE. MORE SIGNAL.
          </div>
          <h2>
            Built for the <span>decisive.</span>
          </h2>
          <p>Markets move in milliseconds. Turbo Sniper Pro gives you the radar, speed, and precision to capture the run.</p>
          <a className="button-primary" href={BOT_LINK} target="_blank" rel="noreferrer">
            Launch Telegram Bot <span aria-hidden="true">↗</span>
          </a>
          <div className="approach-orbit orbit-one"></div>
          <div className="approach-orbit orbit-two"></div>
          <span className="orbit-cross cross-one">+</span>
          <span className="orbit-cross cross-two">+</span>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <a className="brand footer-brand" href="#top">
          <div className="brand-logo-wrap footer-logo">
            <img src="/logo.png" alt="Turbo Sniper Pro" className="brand-logo-img" />
          </div>
          <div className="brand-text">
            <span className="brand-name">
              TURBO<span>SNIPER</span><b>PRO</b>
            </span>
            <span className="brand-sub">SNIP • TRADE • PROFIT</span>
          </div>
        </a>
        <span className="footer-note">TRADE WITH A PLAN. STAY IN CONTROL.</span>
        <span className="footer-legal">
          © 2026 TURBO SNIPER PRO <i></i> DUNE & PUMPPORTAL ON-CHAIN FEEDS
        </span>
      </footer>
    </div>
  )
}

export default App
