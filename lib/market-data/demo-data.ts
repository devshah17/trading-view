import type { Symbol, CompanyProfile, MarketIndex } from './types'

// ---------------------------------------------------------------------------
// Demo symbol universe
// ---------------------------------------------------------------------------

export const DEMO_SYMBOLS: Symbol[] = [
  // US Equities
  { symbol: 'AAPL',   name: 'Apple Inc.',                exchange: 'NASDAQ', type: 'stock',  currency: 'USD', country: 'US', sector: 'Technology' },
  { symbol: 'MSFT',   name: 'Microsoft Corporation',     exchange: 'NASDAQ', type: 'stock',  currency: 'USD', country: 'US', sector: 'Technology' },
  { symbol: 'GOOGL',  name: 'Alphabet Inc.',             exchange: 'NASDAQ', type: 'stock',  currency: 'USD', country: 'US', sector: 'Technology' },
  { symbol: 'AMZN',   name: 'Amazon.com Inc.',           exchange: 'NASDAQ', type: 'stock',  currency: 'USD', country: 'US', sector: 'Consumer Discretionary' },
  { symbol: 'NVDA',   name: 'NVIDIA Corporation',        exchange: 'NASDAQ', type: 'stock',  currency: 'USD', country: 'US', sector: 'Technology' },
  { symbol: 'META',   name: 'Meta Platforms Inc.',       exchange: 'NASDAQ', type: 'stock',  currency: 'USD', country: 'US', sector: 'Technology' },
  { symbol: 'TSLA',   name: 'Tesla Inc.',                exchange: 'NASDAQ', type: 'stock',  currency: 'USD', country: 'US', sector: 'Consumer Discretionary' },
  { symbol: 'JPM',    name: 'JPMorgan Chase & Co.',      exchange: 'NYSE',   type: 'stock',  currency: 'USD', country: 'US', sector: 'Financials' },
  { symbol: 'V',      name: 'Visa Inc.',                 exchange: 'NYSE',   type: 'stock',  currency: 'USD', country: 'US', sector: 'Financials' },
  { symbol: 'JNJ',    name: 'Johnson & Johnson',         exchange: 'NYSE',   type: 'stock',  currency: 'USD', country: 'US', sector: 'Healthcare' },
  // Indian Equities
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', exchange: 'NSE', type: 'stock', currency: 'INR', country: 'IN', sector: 'Energy' },
  { symbol: 'TCS',      name: 'Tata Consultancy Services', exchange: 'NSE', type: 'stock', currency: 'INR', country: 'IN', sector: 'Technology' },
  { symbol: 'INFY',     name: 'Infosys Ltd.',             exchange: 'NSE', type: 'stock', currency: 'INR', country: 'IN', sector: 'Technology' },
  { symbol: 'HDFC',     name: 'HDFC Bank Ltd.',           exchange: 'NSE', type: 'stock', currency: 'INR', country: 'IN', sector: 'Financials' },
  // Crypto
  { symbol: 'BTCUSD',  name: 'Bitcoin / US Dollar',   exchange: 'CRYPTO', type: 'crypto', currency: 'USD' },
  { symbol: 'ETHUSD',  name: 'Ethereum / US Dollar',  exchange: 'CRYPTO', type: 'crypto', currency: 'USD' },
  { symbol: 'SOLUSD',  name: 'Solana / US Dollar',    exchange: 'CRYPTO', type: 'crypto', currency: 'USD' },
  // Forex
  { symbol: 'EURUSD',  name: 'Euro / US Dollar',        exchange: 'FX', type: 'forex', currency: 'USD' },
  { symbol: 'GBPUSD',  name: 'British Pound / US Dollar', exchange: 'FX', type: 'forex', currency: 'USD' },
  { symbol: 'USDJPY',  name: 'US Dollar / Japanese Yen', exchange: 'FX', type: 'forex', currency: 'JPY' },
  // ETF
  { symbol: 'SPY',   name: 'SPDR S&P 500 ETF Trust',  exchange: 'NYSE', type: 'etf', currency: 'USD' },
  { symbol: 'QQQ',   name: 'Invesco QQQ Trust',        exchange: 'NASDAQ', type: 'etf', currency: 'USD' },
  // Indices
  { symbol: 'NIFTY50',  name: 'NIFTY 50',      exchange: 'NSE',    type: 'index', currency: 'INR' },
  { symbol: 'SENSEX',   name: 'BSE SENSEX',    exchange: 'BSE',    type: 'index', currency: 'INR' },
  { symbol: 'SPX',      name: 'S&P 500',       exchange: 'INDEX',  type: 'index', currency: 'USD' },
  { symbol: 'NDX',      name: 'NASDAQ-100',    exchange: 'INDEX',  type: 'index', currency: 'USD' },
  { symbol: 'DJI',      name: 'Dow Jones Industrial Average', exchange: 'INDEX', type: 'index', currency: 'USD' },
]

// Base prices for each symbol (realistic starting points)
export const BASE_PRICES: Record<string, number> = {
  AAPL: 231.42, MSFT: 419.80, GOOGL: 178.90, AMZN: 198.15, NVDA: 124.30,
  META: 580.20, TSLA: 248.50, JPM: 225.40, V: 312.85, JNJ: 147.20,
  RELIANCE: 1412.50, TCS: 4180.0, INFY: 1875.0, HDFC: 1820.0,
  BTCUSD: 108421, ETHUSD: 3842, SOLUSD: 198.4,
  EURUSD: 1.0842, GBPUSD: 1.2718, USDJPY: 149.82,
  SPY: 578.40, QQQ: 492.70,
  NIFTY50: 24850, SENSEX: 81420, SPX: 5842, NDX: 21340, DJI: 42180,
}

// Volatility factor per symbol (daily %)
const VOLATILITY: Record<string, number> = {
  AAPL: 0.012, MSFT: 0.011, GOOGL: 0.013, AMZN: 0.014, NVDA: 0.024,
  META: 0.018, TSLA: 0.032, JPM: 0.010, V: 0.009, JNJ: 0.007,
  RELIANCE: 0.012, TCS: 0.010, INFY: 0.011, HDFC: 0.010,
  BTCUSD: 0.042, ETHUSD: 0.048, SOLUSD: 0.055,
  EURUSD: 0.004, GBPUSD: 0.005, USDJPY: 0.004,
  SPY: 0.008, QQQ: 0.010,
  NIFTY50: 0.008, SENSEX: 0.008, SPX: 0.008, NDX: 0.010, DJI: 0.007,
}

// ---------------------------------------------------------------------------
// Seeded pseudo-random (deterministic per symbol + seed)
// ---------------------------------------------------------------------------
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function symbolSeed(symbol: string): number {
  let h = 0
  for (let i = 0; i < symbol.length; i++) {
    h = (Math.imul(31, h) + symbol.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

// ---------------------------------------------------------------------------
// OHLCV generator
// ---------------------------------------------------------------------------
export function generateCandles(
  symbol: string,
  intervalMinutes: number,
  count: number,
  endTimestamp?: number,
): { timestamp: number; open: number; high: number; low: number; close: number; volume: number }[] {
  const rand = seededRandom(symbolSeed(symbol) + intervalMinutes)
  const vol = (VOLATILITY[symbol] ?? 0.015) * Math.sqrt(intervalMinutes / 1440)
  const baseVol = BASE_PRICES[symbol] ? BASE_PRICES[symbol] * 1000 : 1_000_000
  const endTs = endTimestamp ?? Math.floor(Date.now() / 1000)
  const startTs = endTs - count * intervalMinutes * 60

  let price = BASE_PRICES[symbol] ?? 100

  // Walk price backwards to starting point
  // (run the simulation from start to fill candles properly)
  const candles = []

  for (let i = 0; i < count; i++) {
    const ts = startTs + i * intervalMinutes * 60
    const r = rand()
    const change = (r - 0.5) * 2 * vol * price
    const open = price
    const close = Math.max(open + change, open * 0.5)
    const highExtra = Math.abs(rand() * vol * price)
    const lowExtra = Math.abs(rand() * vol * price)
    const high = Math.max(open, close) + highExtra
    const low = Math.min(open, close) - lowExtra
    const volume = Math.round(baseVol * (0.5 + rand()))

    candles.push({
      timestamp: ts,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: Math.max(parseFloat(low.toFixed(2)), 0.01),
      close: parseFloat(close.toFixed(2)),
      volume,
    })

    price = close
  }

  return candles
}

// ---------------------------------------------------------------------------
// Company profiles
// ---------------------------------------------------------------------------
export const DEMO_PROFILES: Record<string, CompanyProfile> = {
  AAPL: {
    symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics',
    employees: 164000, website: 'apple.com',
    pe: 31.4, eps: 6.57, pb: 45.2, dividendYield: 0.52, roe: 157.4,
    marketCap: 3_510_000_000_000,
    perf1d: 1.01, perf1w: 2.3, perf1m: 5.8, perf6m: 12.4, perf1y: 28.2, perf3y: 48.5, perf5y: 280.0, perf10y: 890.0,
    week52High: 237.23, week52Low: 164.08,
  },
  MSFT: {
    symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software',
    employees: 228000, website: 'microsoft.com',
    pe: 38.2, eps: 12.41, pb: 14.8, dividendYield: 0.68, roe: 38.5,
    marketCap: 3_120_000_000_000,
    perf1d: 0.82, perf1w: 1.9, perf1m: 4.2, perf6m: 8.1, perf1y: 24.1, perf3y: 42.0, perf5y: 196.0, perf10y: 740.0,
    week52High: 468.35, week52Low: 344.79,
  },
  NVDA: {
    symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors',
    employees: 36000,
    pe: 52.1, eps: 2.42, pb: 38.0, dividendYield: 0.03, roe: 91.2,
    marketCap: 3_040_000_000_000,
    perf1d: 2.4, perf1w: 5.1, perf1m: 18.2, perf6m: 48.1, perf1y: 192.0, perf3y: 620.0, perf5y: 2200.0, perf10y: 8400.0,
    week52High: 149.43, week52Low: 47.32,
  },
  RELIANCE: {
    symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Energy',
    pe: 22.8, eps: 61.90, pb: 2.4, dividendYield: 0.35, roe: 10.5,
    marketCap: 19_120_000_000_000,
    perf1d: 1.31, perf1w: -0.8, perf1m: 3.2, perf6m: -4.1, perf1y: 8.4, perf3y: 28.0, perf5y: 84.0,
    week52High: 1608.95, week52Low: 1114.85,
  },
  BTCUSD: {
    symbol: 'BTCUSD', name: 'Bitcoin / US Dollar',
    perf1d: 1.24, perf1w: 4.8, perf1m: 12.1, perf6m: 38.0, perf1y: 145.0, perf3y: 220.0, perf5y: 810.0,
    week52High: 112480, week52Low: 51240,
  },
}

// For symbols without profiles, generate a basic one
export function getDemoProfile(symbol: string): CompanyProfile {
  if (DEMO_PROFILES[symbol]) return DEMO_PROFILES[symbol]
  const sym = DEMO_SYMBOLS.find(s => s.symbol === symbol)
  const basePrice = BASE_PRICES[symbol] ?? 100
  return {
    symbol,
    name: sym?.name ?? symbol,
    sector: sym?.sector,
    pe: 18 + Math.random() * 20,
    eps: basePrice * 0.05,
    pb: 2 + Math.random() * 4,
    dividendYield: Math.random() * 2,
    roe: 10 + Math.random() * 20,
    marketCap: basePrice * 1_000_000_000,
    perf1d: (Math.random() - 0.5) * 4,
    perf1w: (Math.random() - 0.5) * 8,
    perf1m: (Math.random() - 0.5) * 15,
    perf6m: (Math.random() - 0.5) * 30,
    perf1y: (Math.random() - 0.3) * 40,
    week52High: basePrice * 1.35,
    week52Low: basePrice * 0.72,
  }
}

// ---------------------------------------------------------------------------
// Market indices
// ---------------------------------------------------------------------------
export const DEMO_INDICES: MarketIndex[] = [
  { symbol: 'NIFTY50', name: 'NIFTY 50',    price: 24850.25, change: 128.40,  changePercent: 0.52, country: 'IN' },
  { symbol: 'SENSEX',  name: 'BSE SENSEX',  price: 81420.60, change: 420.15,  changePercent: 0.52, country: 'IN' },
  { symbol: 'SPX',     name: 'S&P 500',     price: 5842.10,  change: -18.20,  changePercent: -0.31, country: 'US' },
  { symbol: 'NDX',     name: 'NASDAQ-100',  price: 21340.80, change: 42.50,   changePercent: 0.20, country: 'US' },
  { symbol: 'DJI',     name: 'Dow Jones',   price: 42180.50, change: -82.40,  changePercent: -0.20, country: 'US' },
  { symbol: 'FTSE',    name: 'FTSE 100',    price: 8482.30,  change: 24.80,   changePercent: 0.29, country: 'GB' },
  { symbol: 'DAX',     name: 'DAX 40',      price: 18840.10, change: 118.30,  changePercent: 0.63, country: 'DE' },
  { symbol: 'NKY',     name: 'Nikkei 225',  price: 38420.80, change: -284.20, changePercent: -0.73, country: 'JP' },
]
