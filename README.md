# Turbo Sniper Pro

A React + Vite dashboard for multi-chain market discovery, Solana bot links, and token-level realized-PnL trader rankings.

## Run locally

```sh
npm install
npm run dev
```

The market/project views use public DexScreener data. To enable the ranked trader panel, create a Birdeye Data API key and put it in a local `.env` file:

```env
BIRDEYE_API_KEY=your_server_side_key
```

Do not use a `VITE_` prefix for this secret. `.env` is ignored by Git. Restart the dev server after setting the key. Without it, the site shows a key-required state and does not invent trader records.

## Trader feed behavior

The server-side `/api/top-traders` adapter requests Birdeye's token top-traders endpoint for at most the six highest-volume Solana tokens currently discovered. It combines successful per-token results, ranks them by reported realized USD PnL, and requests recent token swaps to link buy/sell signatures when available. Results are cached for one minute and the browser refreshes the board every five minutes. Birdeye API access and compute-unit charges depend on the account plan.

This is a cross-token aggregation of token-scoped rankings, not a single global wallet PnL query. A wallet may appear more than once for different tokens. The displayed average buy price and aggregate buy volume are indicative token-level figures, not a guarantee that the wallet's full position was entered at that price. Transaction links may be unavailable if the recent transaction page does not include that wallet's trade.

## Production

```sh
npm run build
npm start
```

The production Node server serves `dist/` and the same protected trader API. Configure `BIRDEYE_API_KEY` in the server environment or local `.env`; never embed it in frontend code or commit it.

## Data sources

- DexScreener supplies discoverable pair prices, volume, liquidity, and aggregate buy/sell counts.
- Birdeye supplies token-specific trader rankings and PnL for the configured leaderboard.
- The Telegram bot handles wallet connection and trading actions; this website does not submit trades itself.