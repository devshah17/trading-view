// All TypeScript types for the trading terminal

export type AssetType = 'stock' | 'etf' | 'index' | 'forex' | 'crypto' | 'commodity'

export type MarketStatus = 'open' | 'closed' | 'pre-market' | 'after-hours' | 'holiday'

export type ChartType = 'candlestick' | 'hollow-candle' | 'line' | 'area' | 'bar'

export type Timeframe =
  | '1m' | '5m' | '10m' | '1H'
  | '1D' | '1W' | '1M' | '6M' | '1Y' | '3Y' | '5Y' | '10Y' | 'ALL'

export type IndicatorType =
  | 'SMA' | 'EMA' | 'WMA' | 'VWAP'
  | 'BB' | 'RSI' | 'MACD' | 'STOCH' | 'ATR' | 'ADX'

export type DrawingToolType =
  | 'trendline' | 'hline' | 'vline' | 'ray'
  | 'rectangle' | 'fib-retracement' | 'fib-extension'
  | 'text' | 'measure' | 'none'

export interface Symbol {
  symbol: string
  name: string
  exchange: string
  type: AssetType
  currency: string
  country?: string
  sector?: string
}

export interface Candle {
  timestamp: number // Unix seconds
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Quote {
  symbol: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  previousClose: number
  volume: number
  avgVolume?: number
  marketCap?: number
  timestamp: number
}

export interface HistoricalData {
  symbol: string
  timeframe: Timeframe
  candles: Candle[]
}

export interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  country: string
}

export interface WatchlistEntry {
  symbol: string
  addedAt: number
}

export interface Watchlist {
  id: string
  name: string
  entries: WatchlistEntry[]
}

export interface Alert {
  id: string
  symbol: string
  condition: 'above' | 'below' | 'pct-change' | 'volume-above'
  value: number
  note?: string
  active: boolean
  triggered: boolean
  createdAt: number
}

export interface IndicatorConfig {
  id: string
  type: IndicatorType
  period?: number
  stdDev?: number   // For BB
  fastPeriod?: number  // For MACD
  slowPeriod?: number  // For MACD
  signalPeriod?: number // For MACD
  color?: string
  visible: boolean
}

export interface Drawing {
  id: string
  tool: DrawingToolType
  points: { time: number; price: number }[]
  color?: string
  text?: string
}

export interface CompanyProfile {
  symbol: string
  name: string
  description?: string
  sector?: string
  industry?: string
  employees?: number
  website?: string
  // Fundamentals
  pe?: number
  eps?: number
  pb?: number
  dividendYield?: number
  roe?: number
  marketCap?: number
  // Performance
  perf1d?: number
  perf1w?: number
  perf1m?: number
  perf6m?: number
  perf1y?: number
  perf3y?: number
  perf5y?: number
  perf10y?: number
  // Range
  week52High?: number
  week52Low?: number
}

export interface TimeframeResolution {
  timeframe: Timeframe
  /** Candle interval in minutes */
  intervalMinutes: number
  /** Number of candles to generate */
  count: number
  label: string
}

export const TIMEFRAME_RESOLUTIONS: Record<Timeframe, TimeframeResolution> = {
  '1m':  { timeframe: '1m',  intervalMinutes: 1,     count: 390,  label: '1m'  },
  '5m':  { timeframe: '5m',  intervalMinutes: 5,     count: 390,  label: '5m'  },
  '10m': { timeframe: '10m', intervalMinutes: 10,    count: 200,  label: '10m' },
  '1H':  { timeframe: '1H',  intervalMinutes: 60,    count: 200,  label: '1H'  },
  '1D':  { timeframe: '1D',  intervalMinutes: 1440,  count: 252,  label: '1D'  },
  '1W':  { timeframe: '1W',  intervalMinutes: 10080, count: 260,  label: '1W'  },
  '1M':  { timeframe: '1M',  intervalMinutes: 43200, count: 120,  label: '1M'  },
  '6M':  { timeframe: '6M',  intervalMinutes: 1440,  count: 126,  label: '6M'  },
  '1Y':  { timeframe: '1Y',  intervalMinutes: 1440,  count: 252,  label: '1Y'  },
  '3Y':  { timeframe: '3Y',  intervalMinutes: 10080, count: 156,  label: '3Y'  },
  '5Y':  { timeframe: '5Y',  intervalMinutes: 10080, count: 260,  label: '5Y'  },
  '10Y': { timeframe: '10Y', intervalMinutes: 43200, count: 120,  label: '10Y' },
  'ALL': { timeframe: 'ALL', intervalMinutes: 43200, count: 240,  label: 'ALL' },
}
