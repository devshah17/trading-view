'use client'
import { useChartStore } from '@/stores/chartStore'
import { useMarketStore } from '@/stores/marketStore'
import { getDemoProfile } from '@/lib/market-data/demo-data'
import { resolveSymbol } from '@/lib/market-data/symbols'
import { RangeSlider } from '@/components/ui/RangeSlider'

function fmt(n: number | undefined, digits = 2): string {
  if (n === undefined) return '—'
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(digits)}%`
}

function fmtNum(n: number | undefined): string {
  if (n === undefined) return '—'
  return n.toFixed(2)
}

function priceStr(price: number, currency: string): string {
  const s = currency === 'INR' ? '₹' : '$'
  if (price >= 1000) return `${s}${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (price >= 1) return `${s}${price.toFixed(2)}`
  return `${s}${price.toFixed(5)}`
}

export function InstrumentInfoPanel() {
  const selectedSymbol = useChartStore(s => s.selectedSymbol)
  const quote = useMarketStore(s => s.quotes[selectedSymbol])
  const profile = getDemoProfile(selectedSymbol)
  const symbolInfo = resolveSymbol(selectedSymbol)
  const currency = symbolInfo?.currency ?? 'USD'

  const perfRows: { label: string; value: number | undefined }[] = [
    { label: '1 Day',   value: profile.perf1d },
    { label: '1 Week',  value: profile.perf1w },
    { label: '1 Month', value: profile.perf1m },
    { label: '6 Month', value: profile.perf6m },
    { label: '1 Year',  value: profile.perf1y },
    { label: '3 Year',  value: profile.perf3y },
    { label: '5 Year',  value: profile.perf5y },
  ]

  const valuationRows = [
    { label: 'P/E Ratio',       value: fmtNum(profile.pe) },
    { label: 'EPS',             value: fmtNum(profile.eps) },
    { label: 'P/B Ratio',       value: fmtNum(profile.pb) },
    { label: 'Dividend Yield',  value: profile.dividendYield !== undefined ? `${profile.dividendYield.toFixed(2)}%` : '—' },
    { label: 'ROE',             value: profile.roe !== undefined ? `${profile.roe.toFixed(1)}%` : '—' },
  ]

  return (
    <div className="info-panel">
      {/* Overview */}
      <div className="info-section">
        <div className="info-section-title">Overview</div>
        {[
          { label: 'Price',       value: quote ? priceStr(quote.price, currency) : '—' },
          { label: 'Change',      value: quote ? `${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)}` : '—', cls: quote ? (quote.change >= 0 ? 'positive' : 'negative') : '' },
          { label: 'Change %',    value: quote ? `${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%` : '—', cls: quote ? (quote.changePercent >= 0 ? 'positive' : 'negative') : '' },
          { label: 'Open',        value: quote ? priceStr(quote.open, currency) : '—' },
          { label: 'Day High',    value: quote ? priceStr(quote.high, currency) : '—' },
          { label: 'Day Low',     value: quote ? priceStr(quote.low, currency) : '—' },
          { label: 'Prev Close',  value: quote ? priceStr(quote.previousClose, currency) : '—' },
          { label: 'Volume',      value: quote ? quote.volume.toLocaleString() : '—' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="info-row">
            <span className="info-row-label">{label}</span>
            <span className={`info-row-value ${cls ?? ''}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Valuation — equities only */}
      {symbolInfo?.type === 'stock' && profile.pe && (
        <div className="info-section">
          <div className="info-section-title">Valuation</div>
          {valuationRows.map(({ label, value }) => (
            <div key={label} className="info-row">
              <span className="info-row-label">{label}</span>
              <span className="info-row-value mono">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Performance */}
      <div className="info-section">
        <div className="info-section-title">Performance</div>
        <table className="perf-table">
          <tbody>
            {perfRows.map(({ label, value }) => (
              <tr key={label}>
                <td>{label}</td>
                <td className={value !== undefined ? (value >= 0 ? 'positive' : 'negative') : ''}>
                  {fmt(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 52W Range */}
      {profile.week52High && profile.week52Low && quote && (
        <div className="info-section">
          <div className="info-section-title">52-Week Range</div>
          <RangeSlider
            low={profile.week52Low}
            high={profile.week52High}
            current={quote.price}
            formatValue={(v) => priceStr(v, currency)}
          />
        </div>
      )}
    </div>
  )
}
