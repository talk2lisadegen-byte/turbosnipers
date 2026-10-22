const API_BASE = 'https://public-api.birdeye.so'
const MAX_TOKENS_PER_SCAN = 6
const TOP_TRADERS_PER_TOKEN = 10
const CACHE_TTL_MS = 60_000

const cache = new Map()

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

function numberOrNull(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

async function birdeyeGet(path, params, apiKey) {
  const url = new URL(path, API_BASE)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
  }
  const response = await fetch(url, {
    headers: { 'X-API-KEY': apiKey, 'x-chain': 'solana' },
    signal: AbortSignal.timeout(12_000),
  })
  if (!response.ok) throw new Error(`Birdeye request failed (${response.status})`)
  return response.json()
}

async function loadTokenTraders(address, apiKey) {
  const [traderResponse, txResponse] = await Promise.all([
    birdeyeGet('/defi/v2/tokens/top_traders', {
      address,
      time_frame: '24h',
      sort_by: 'realized_pnl',
      sort_type: 'desc',
      limit: TOP_TRADERS_PER_TOKEN,
      min_trade: 2,
      min_realized_pnl: 0,
    }, apiKey),
    birdeyeGet('/defi/v3/token/txs', {
      address,
      tx_type: 'swap',
      sort_by: 'block_unix_time',
      sort_type: 'desc',
      limit: 100,
    }, apiKey),
  ])

  const traderItems = traderResponse?.data?.items ?? []
  const transactions = txResponse?.data?.items ?? []
  const txsByOwner = new Map()
  for (const tx of transactions) {
    if (!tx.owner || !tx.tx_hash) continue
    const entries = txsByOwner.get(tx.owner) ?? { buyTx: null, sellTx: null }
    const side = String(tx.side ?? tx.tx_type ?? '').toLowerCase()
    if (side.includes('buy') && !entries.buyTx) entries.buyTx = tx.tx_hash
    if (side.includes('sell') && !entries.sellTx) entries.sellTx = tx.tx_hash
    txsByOwner.set(tx.owner, entries)
  }

  return traderItems.flatMap((trader) => {
    const wallet = trader.owner
    const realizedPnl = numberOrNull(trader.realizedPnl ?? trader.realized_pnl)
    if (!wallet || realizedPnl === null || realizedPnl <= 0) return []
    const txs = txsByOwner.get(wallet) ?? { buyTx: null, sellTx: null }
    return [{
      network: 'solana',
      tokenAddress: trader.tokenAddress ?? address,
      wallet,
      realizedPnlUsd: realizedPnl,
      unrealizedPnlUsd: numberOrNull(trader.unrealizedPnl ?? trader.unrealized_pnl),
      entryPrice: numberOrNull(trader.avgBuyPrice ?? trader.avg_buy_price),
      exitPrice: numberOrNull(trader.avgSellPrice ?? trader.avg_sell_price),
      buyUsd: numberOrNull(trader.volumeBuyUSD ?? trader.volume_buy_usd),
      sellUsd: numberOrNull(trader.volumeSellUSD ?? trader.volume_sell_usd),
      buyCount: numberOrNull(trader.tradeBuy ?? trader.trade_buy) ?? 0,
      sellCount: numberOrNull(trader.tradeSell ?? trader.trade_sell) ?? 0,
      lastTradeAt: numberOrNull(trader.lastTradeUnixTime ?? trader.last_trade_unix_time),
      tags: Array.isArray(trader.tags) ? trader.tags : [],
      buyTx: txs.buyTx,
      sellTx: txs.sellTx,
    }]
  })
}

export async function getTopTraders(requestUrl, apiKey) {
  if (!apiKey) {
    return jsonResponse(503, {
      configured: false,
      message: 'Birdeye is not configured. Set BIRDEYE_API_KEY on the server to enable realized trader rankings.',
      items: [],
    })
  }

  const url = new URL(requestUrl, 'http://localhost')
  const addresses = [...new Set((url.searchParams.get('tokens') ?? '')
    .split(',')
    .map((address) => address.trim())
    .filter((address) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)))].slice(0, MAX_TOKENS_PER_SCAN)

  if (addresses.length === 0) {
    return jsonResponse(400, { configured: true, message: 'Provide valid Solana token mint addresses.', items: [] })
  }

  const cacheKey = addresses.slice().sort().join(',')
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return jsonResponse(200, cached.payload)

  const results = await Promise.allSettled(addresses.map((address) => loadTokenTraders(address, apiKey)))
  const succeeded = results.filter((result) => result.status === 'fulfilled')
  if (succeeded.length === 0) {
    return jsonResponse(502, { configured: true, message: 'Birdeye trader data is temporarily unavailable.', items: [] })
  }

  const items = succeeded.flatMap((result) => result.value)
    .sort((left, right) => right.realizedPnlUsd - left.realizedPnlUsd)
    .slice(0, 50)
  const payload = { configured: true, partial: succeeded.length !== results.length, items }
  cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload })
  return jsonResponse(200, payload)
}
