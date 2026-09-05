'use client'
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { subscribeLivePrice } from '@/lib/market-data/websocket'
import { useMarketStore } from '@/stores/marketStore'
import { resolveSymbol } from '@/lib/market-data/symbols'
import type { Quote } from '@/lib/market-data/types'

interface WatchlistItemProps {
  symbol: string
  isActive: boolean
  onSelect: (symbol: string) => void
  onRemove: (symbol: string) => void
}

function formatPrice(price: number): string {
  if (price >= 10000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (price >= 100)   return price.toFixed(2)
  if (price >= 1)     return price.toFixed(2)
  return price.toFixed(5)
}

export function WatchlistItem({ symbol, isActive, onSelect, onRemove }: WatchlistItemProps) {
  const setQuote = useMarketStore(s => s.setQuote)
  const quote = useMarketStore(s => s.quotes[symbol] ?? null)
  const [flashClass, setFlashClass] = useState('')
  const prevPrice = useRef<number | null>(null)
  const symbolInfo = resolveSymbol(symbol)

  // Subscribe to live prices
  useEffect(() => {
    const unsub = subscribeLivePrice(symbol, (q) => setQuote(q))
    return unsub
  }, [symbol, setQuote])

  // Flash on price change
  useEffect(() => {
    if (!quote) return
    if (prevPrice.current !== null && prevPrice.current !== quote.price) {
      const cls = quote.price > prevPrice.current ? 'flash-positive' : 'flash-negative'
      setFlashClass(cls)
      const t = setTimeout(() => setFlashClass(''), 800)
      prevPrice.current = quote.price
      return () => clearTimeout(t)
    }
    prevPrice.current = quote.price
  }, [quote?.price])

  const isPos = (quote?.changePercent ?? 0) >= 0

  return (
    <div
      className={`watchlist-item ${isActive ? 'active' : ''} ${flashClass}`}
      onClick={() => onSelect(symbol)}
      role="row"
      aria-selected={isActive}
      aria-label={`${symbol} ${quote?.price ?? ''}`}
    >
      <div className="min-w-0">
        <div className="wl-symbol">{symbol}</div>
        {symbolInfo && <div className="wl-name">{symbolInfo.name}</div>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
        {quote ? (
          <>
            <span className={`wl-price ${isPos ? 'positive' : 'negative'}`}>
              {formatPrice(quote.price)}
            </span>
            <span className={`wl-change ${isPos ? 'positive' : 'negative'}`}>
              {isPos ? '+' : ''}{quote.changePercent.toFixed(2)}%
            </span>
          </>
        ) : (
          <span className="text-muted text-xs">—</span>
        )}
      </div>
      <button
        className="icon-btn danger"
        style={{ opacity: 0, transition: 'opacity 0.1s', marginLeft: 4 }}
        onClick={(e) => { e.stopPropagation(); onRemove(symbol) }}
        aria-label={`Remove ${symbol} from watchlist`}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
      >
        <X size={11} />
      </button>
    </div>
  )
}
