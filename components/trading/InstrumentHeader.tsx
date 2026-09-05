'use client'

import { useMarketData } from '@/hooks/useMarketData'
import { useChartStore } from '@/stores/chartStore'
import { useMarketStore } from '@/stores/marketStore'
import { MarketStatusBadge } from '@/components/ui/MarketStatus'
import { PriceChange } from '@/components/ui/PriceChange'
import { resolveSymbol } from '@/lib/market-data/symbols'
import { getDemoProfile } from '@/lib/market-data/demo-data'
import { useEffect, useRef, useState } from 'react'

function formatLargeNum(n: number, currency = 'USD'): string {
  const symbol = currency === 'INR' ? '₹' : '$'
  if (n >= 1e12) return `${symbol}${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9)  return `${symbol}${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6)  return `${symbol}${(n / 1e6).toFixed(2)}M`
  return `${symbol}${n.toLocaleString()}`
}

function formatVolume(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`
  return `${v}`
}

function priceStr(price: number, currency: string): string {
  const symbol = currency === 'INR' ? '₹' : currency === 'JPY' ? '¥' : '$'
  if (price >= 1000) return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  if (price >= 1) return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return `${symbol}${price.toFixed(5)}`
}

const TYPE_LABEL: Record<string, string> = {
  stock: 'EQUITY', etf: 'ETF', index: 'INDEX', forex: 'FX', crypto: 'CRYPTO', commodity: 'COMMODITY',
}

export function InstrumentHeader() {
  const selectedSymbol = useChartStore(s => s.selectedSymbol)
  const marketStatus = useMarketStore(s => s.marketStatus)
  const quote = useMarketData(selectedSymbol)
  const symbolInfo = resolveSymbol(selectedSymbol)
  const profile = getDemoProfile(selectedSymbol)
  const currency = symbolInfo?.currency ?? 'USD'

  const prevPrice = useRef<number | null>(null)
  const [flashClass, setFlashClass] = useState('')

  useEffect(() => {
    if (!quote) return
    if (prevPrice.current !== null && prevPrice.current !== quote.price) {
      const cls = quote.price > prevPrice.current ? 'flash-positive' : 'flash-negative'
      setFlashClass(cls)
      const t = setTimeout(() => setFlashClass(''), 800)
      prevPrice.current = quote.price
      return () => clearTimeout(t)
    }
    prevPrice.current = quote?.price ?? null
  }, [quote?.price])

  if (!quote && !symbolInfo) {
    return (
      <div className="instrument-header">
        <div className="text-muted text-sm">Select a symbol to view data</div>
      </div>
    )
  }

  return (
    <div className="instrument-header" aria-label="Instrument information">
      {/* Name row */}
      <div className="instrument-name-row">
        <span className="instrument-name">{symbolInfo?.name ?? selectedSymbol}</span>
        <span className="instrument-exchange">{symbolInfo?.exchange}</span>
        {symbolInfo?.type && (
          <span className="instrument-type-badge">{TYPE_LABEL[symbolInfo.type] ?? symbolInfo.type}</span>
        )}
        <MarketStatusBadge status={marketStatus} />
      </div>

      {/* Price row */}
      <div className="price-row">
        <span
          className={`current-price ${flashClass}`}
          aria-live="polite"
          aria-label={`Current price ${quote?.price}`}
        >
          {quote ? priceStr(quote.price, currency) : '—'}
        </span>
        {quote && (
          <PriceChange
            change={quote.change}
            changePercent={quote.changePercent}
            showIcon
            size="md"
          />
        )}
      </div>

      {/* Stats strip */}
      {quote && (
        <div className="stats-strip" role="list">
          {[
            { label: 'Open',      value: priceStr(quote.open, currency) },
            { label: 'High',      value: priceStr(quote.high, currency) },
            { label: 'Low',       value: priceStr(quote.low, currency) },
            { label: 'Prev Close',value: priceStr(quote.previousClose, currency) },
            { label: 'Volume',    value: formatVolume(quote.volume) },
            ...(profile.marketCap ? [{ label: 'Mkt Cap', value: formatLargeNum(profile.marketCap, currency) }] : []),
            ...(profile.week52High ? [{ label: '52W High', value: priceStr(profile.week52High, currency) }] : []),
            ...(profile.week52Low  ? [{ label: '52W Low',  value: priceStr(profile.week52Low, currency)  }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="stat-item" role="listitem">
              <span className="stat-label">{label}</span>
              <span className="stat-value">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
