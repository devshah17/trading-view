import type { Candle, Timeframe, HistoricalData } from './types'

const cache = new Map<string, HistoricalData>()

export async function fetchHistoricalData(
  symbol: string,
  timeframe: Timeframe,
): Promise<HistoricalData> {
  const key = `${symbol}:${timeframe}`
  
  if (cache.has(key)) return cache.get(key)!

  const res = await fetch(`/api/historical?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(timeframe)}`)
  if (!res.ok) {
    throw new Error('Failed to fetch historical data')
  }
  
  const data = await res.json()
  const result: HistoricalData = { symbol, timeframe, candles: data.candles || [] }
  
  cache.set(key, result)
  return result
}

export function invalidateCache(symbol?: string): void {
  if (symbol) {
    for (const key of Array.from(cache.keys())) {
      if (key.startsWith(`${symbol}:`)) cache.delete(key)
    }
  } else {
    cache.clear()
  }
}
