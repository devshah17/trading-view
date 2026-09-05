'use client'

import { useEffect, useRef } from 'react'
import { subscribeLivePrice } from '@/lib/market-data/websocket'
import { useMarketStore } from '@/stores/marketStore'
import type { Quote } from '@/lib/market-data/types'

/**
 * Subscribe to live price updates for a symbol.
 * Updates the global market store and returns the latest quote.
 */
export function useMarketData(symbol: string | null): Quote | null {
  const setQuote = useMarketStore(s => s.setQuote)
  const quote = useMarketStore(s => symbol ? s.quotes[symbol] ?? null : null)

  useEffect(() => {
    if (!symbol) return
    const unsub = subscribeLivePrice(symbol, (q) => setQuote(q))
    return unsub
  }, [symbol, setQuote])

  return quote
}
