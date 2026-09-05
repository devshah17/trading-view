'use client'
import { useRouter } from 'next/navigation'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { DEMO_INDICES, DEMO_SYMBOLS, BASE_PRICES, generateCandles } from '@/lib/market-data/demo-data'
import { useMarketStore } from '@/stores/marketStore'
import { subscribeLivePrice } from '@/lib/market-data/websocket'
import { useEffect, useMemo } from 'react'

function fmtPrice(p: number): string {
  if (p >= 1000) return p.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return p.toFixed(2)
}

function PriceCell({ v, pct }: { v: number; pct: number }) {
  const pos = pct >= 0
  const cls = pos ? 'positive' : 'negative'
  const sign = pos ? '+' : ''
  return (
    <td className={`mono ${cls}`} style={{ textAlign: 'right', fontWeight: 600 }}>
      {sign}{pct.toFixed(2)}%
    </td>
  )
}

export function MarketOverview() {
  const router = useRouter()
  const setQuote = useMarketStore(s => s.setQuote)
  const quotes = useMarketStore(s => s.quotes)

  // Derive movers from demo symbols
  const movers = useMemo(() => {
    return DEMO_SYMBOLS.filter(s => s.type === 'stock' || s.type === 'etf').map(sym => {
      const base = BASE_PRICES[sym.symbol] ?? 100
      // deterministic pct change from candle comparison
      const candles = generateCandles(sym.symbol, 1440, 2)
      const first = candles[0]?.open ?? base
      const last = candles[candles.length - 1]?.close ?? base
      const pct = ((last - first) / first) * 100
      return { ...sym, price: last, pct }
    })
  }, [])

  const gainers = [...movers].sort((a, b) => b.pct - a.pct).slice(0, 6)
  const losers  = [...movers].sort((a, b) => a.pct - b.pct).slice(0, 6)
  const active  = [...movers].sort((a, b) => b.price - a.price).slice(0, 6)

  // Subscribe to live prices for all symbols
  useEffect(() => {
    const unsubs = DEMO_SYMBOLS.map(sym =>
      subscribeLivePrice(sym.symbol, (q) => setQuote(q))
    )
    return () => unsubs.forEach(fn => fn())
  }, [setQuote])

  const navigate = (symbol: string) => router.push(`/chart/${symbol}`)

  return (
    <div className="market-page">
      <div>
        <h1 className="market-page-title">Market Overview</h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Global markets snapshot &mdash; Demo Data</p>
      </div>

      {/* Major Indices */}
      <section>
        <div className="section-header" style={{ padding: '0 0 8px' }}>
          <h2 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Major Indices</h2>
        </div>
        <div className="indices-grid">
          {DEMO_INDICES.map(idx => {
            const isPos = idx.changePercent >= 0
            return (
              <button
                key={idx.symbol}
                className="index-card"
                onClick={() => navigate(idx.symbol)}
                aria-label={`${idx.name} ${idx.price}`}
              >
                <div className="index-name">{idx.name}</div>
                <div className="index-price">{fmtPrice(idx.price)}</div>
                <div className={`index-change ${isPos ? 'positive' : 'negative'}`}>
                  {isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%
                  {' '}{isPos ? <TrendingUp size={10} style={{ display: 'inline' }} /> : <TrendingDown size={10} style={{ display: 'inline' }} />}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top Gainers */}
        <section>
          <div className="section-header" style={{ padding: '0 0 8px' }}>
            <h2 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--positive)' }}>Top Gainers</h2>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Change %</th>
                </tr>
              </thead>
              <tbody>
                {gainers.map(s => (
                  <tr key={s.symbol} style={{ cursor: 'pointer' }} onClick={() => navigate(s.symbol)}>
                    <td>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{s.symbol}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{s.name}</div>
                    </td>
                    <td className="mono" style={{ textAlign: 'right' }}>{fmtPrice(s.price)}</td>
                    <PriceCell v={s.price} pct={s.pct} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Losers */}
        <section>
          <div className="section-header" style={{ padding: '0 0 8px' }}>
            <h2 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--negative)' }}>Top Losers</h2>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Change %</th>
                </tr>
              </thead>
              <tbody>
                {losers.map(s => (
                  <tr key={s.symbol} style={{ cursor: 'pointer' }} onClick={() => navigate(s.symbol)}>
                    <td>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{s.symbol}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{s.name}</div>
                    </td>
                    <td className="mono" style={{ textAlign: 'right' }}>{fmtPrice(s.price)}</td>
                    <PriceCell v={s.price} pct={s.pct} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Most Active */}
      <section>
        <div className="section-header" style={{ padding: '0 0 8px' }}>
          <h2 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Most Active</h2>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Sector</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'right' }}>Change %</th>
              </tr>
            </thead>
            <tbody>
              {active.map(s => (
                <tr key={s.symbol} style={{ cursor: 'pointer' }} onClick={() => navigate(s.symbol)}>
                  <td>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{s.symbol}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{s.name}</div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{s.sector ?? s.type}</td>
                  <td className="mono" style={{ textAlign: 'right' }}>{fmtPrice(s.price)}</td>
                  <PriceCell v={s.price} pct={s.pct} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
