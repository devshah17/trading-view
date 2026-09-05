import type { Symbol } from './types'

const resolveCache = new Map<string, Symbol>()

const DEFAULT_SYMBOLS: Symbol[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NMS', type: 'stock', currency: 'USD' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NMS', type: 'stock', currency: 'USD' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NMS', type: 'stock', currency: 'USD' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NMS', type: 'stock', currency: 'USD' },
  { symbol: 'BTC-USD', name: 'Bitcoin USD', exchange: 'CCC', type: 'crypto', currency: 'USD' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', exchange: 'PCX', type: 'etf', currency: 'USD' },
]

DEFAULT_SYMBOLS.forEach(s => resolveCache.set(s.symbol, s))

export async function searchSymbols(query: string, limit = 10): Promise<Symbol[]> {
  if (!query || query.trim().length === 0) return DEFAULT_SYMBOLS
  
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    if (!res.ok) return []
    const data = await res.json()
    const results = data.results as Symbol[]
    
    results.forEach(s => resolveCache.set(s.symbol.toUpperCase(), s))
    
    return results.slice(0, limit)
  } catch {
    return []
  }
}

export function resolveSymbol(symbol: string): Symbol | undefined {
  return resolveCache.get(symbol.toUpperCase()) || { symbol, name: symbol, type: 'stock', exchange: 'Unknown', currency: 'USD' }
}
