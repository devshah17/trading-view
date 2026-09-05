'use client'
import { useMarketStore } from '@/stores/marketStore'
import { useChartStore } from '@/stores/chartStore'
import { useHistoricalData } from '@/hooks/useHistoricalData'
import { resolveSymbol } from '@/lib/market-data/symbols'

function formatPct(n: number | undefined): string {
  if (n === undefined) return '—'
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

function formatPrice(p: number, currency: string): string {
  const sym = currency === 'INR' ? '₹' : '$'
  return `${sym}${p.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function formatVol(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`
  return `${v}`
}

export function PerformanceSummary() {
  const selectedSymbol = useChartStore(s => s.selectedSymbol)
  const timeframe = useChartStore(s => s.timeframe)
  const { candles } = useHistoricalData(selectedSymbol, timeframe)
  const symbolInfo = resolveSymbol(selectedSymbol)
  const currency = symbolInfo?.currency ?? 'USD'

  if (!candles.length) return null

  const first = candles[0]
  const last = candles[candles.length - 1]
  const absReturn = last.close - first.open
  const pctReturn = (absReturn / first.open) * 100
  const high = Math.max(...candles.map(c => c.high))
  const low = Math.min(...candles.map(c => c.low))
  const avgVol = candles.reduce((s, c) => s + c.volume, 0) / candles.length

  // Volatility: annualized std dev of daily returns
  const returns = candles.slice(1).map((c, i) => Math.log(c.close / candles[i].close))
  const meanR = returns.reduce((s, v) => s + v, 0) / (returns.length || 1)
  const variance = returns.reduce((s, v) => s + (v - meanR) ** 2, 0) / (returns.length || 1)
  const volatility = Math.sqrt(variance * 252) * 100

  const isPos = pctReturn >= 0

  return (
    <div className="perf-summary" aria-label="Performance summary">
      <div className="perf-item">
        <span className="perf-label">Return</span>
        <span className={`perf-val ${isPos ? 'positive' : 'negative'}`}>
          {isPos ? '+' : ''}{pctReturn.toFixed(2)}%
        </span>
      </div>
      <div className="perf-item">
        <span className="perf-label">+/-</span>
        <span className={`perf-val ${isPos ? 'positive' : 'negative'}`}>
          {isPos ? '+' : ''}{absReturn.toFixed(2)}
        </span>
      </div>
      <div className="perf-item">
        <span className="perf-label">High</span>
        <span className="perf-val">{formatPrice(high, currency)}</span>
      </div>
      <div className="perf-item">
        <span className="perf-label">Low</span>
        <span className="perf-val">{formatPrice(low, currency)}</span>
      </div>
      <div className="perf-item">
        <span className="perf-label">Avg Vol</span>
        <span className="perf-val">{formatVol(avgVol)}</span>
      </div>
      <div className="perf-item">
        <span className="perf-label">Volatility</span>
        <span className="perf-val">{volatility.toFixed(1)}%</span>
      </div>
      <div className="perf-item">
        <span className="perf-label">Candles</span>
        <span className="perf-val">{candles.length.toLocaleString()}</span>
      </div>
    </div>
  )
}
