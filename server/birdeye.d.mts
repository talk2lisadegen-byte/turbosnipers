export type BirdeyeTraderItem = {
  network: string
  tokenAddress: string
  wallet: string
  realizedPnlUsd: number
  unrealizedPnlUsd: number | null
  entryPrice: number | null
  exitPrice: number | null
  buyUsd: number | null
  sellUsd: number | null
  buyCount: number
  sellCount: number
  lastTradeAt: number | null
  tags: string[]
  buyTx: string | null
  sellTx: string | null
}

export function getTopTraders(requestUrl: string, apiKey?: string): Promise<Response>
