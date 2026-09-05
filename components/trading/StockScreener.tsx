'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown, Filter } from 'lucide-react'
import { DEMO_SYMBOLS, BASE_PRICES, getDemoProfile, generateCandles } from '@/lib/market-data/demo-data'

type SortDir = 'asc' | 'desc'
type SortKey = 'symbol' | 'price' | 'pct' | 'pe' | 'roe' | 'mktCap' | 'divYield'

interface ScreenerRow {
  symbol: string
  name: string
  exchange: string
  type: string
  sector?: string
  price: number
  pct: number
  pe?: number
  roe?: number
  mktCap?: number
  divYield?: number
}

export function StockScreener() {
  const router = useRouter()
  const [sortKey, setSortKey] = useState<SortKey>('mktCap')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [sectorFilter, setSectorFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [minPE, setMinPE] = useState('')
  const [maxPE, setMaxPE] = useState('')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 15

  const rows: ScreenerRow[] = useMemo(() => {
    return DEMO_SYMBOLS.map(sym => {
      const base = BASE_PRICES[sym.symbol] ?? 100
      const candles = generateCandles(sym.symbol, 1440, 2)
      const first = candles[0]?.open ?? base
      const last = candles[candles.length - 1]?.close ?? base
      const pct = ((last - first) / first) * 100
      const profile = getDemoProfile(sym.symbol)
      return {
        symbol: sym.symbol, name: sym.name, exchange: sym.exchange,
        type: sym.type, sector: sym.sector,
        price: last, pct, pe: profile.pe, roe: profile.roe,
        mktCap: profile.marketCap, divYield: profile.dividendYield,
      }
    })
  }, [])

  const sectors = Array.from(new Set(rows.flatMap(r => r.sector ? [r.sector] : [])))
  const types = Array.from(new Set(rows.map(r => r.type)))

  const filtered = rows.filter(r => {
    if (sectorFilter && r.sector !== sectorFilter) return false
    if (typeFilter && r.type !== typeFilter) return false
    if (minPE && r.pe && r.pe < parseFloat(minPE)) return false
    if (maxPE && r.pe && r.pe > parseFloat(maxPE)) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    const va = (a as any)[sortKey] ?? 0
    const vb = (b as any)[sortKey] ?? 0
    if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    return sortDir === 'asc' ? va - vb : vb - va
  })

  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(0)
  }

  const SortIcon = ({ k }: { k: SortKey }) => sortKey !== k ? null :
    sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />

  function fmtCap(n?: number): string {
    if (!n) return '—'
    if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`
    if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`
    if (n >= 1e6)  return `$${(n / 1e6).toFixed(1)}M`
    return `$${n.toLocaleString()}`
  }

  return (
    <div style={{ padding: 16, flex: 1, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Filter size={15} />
        <h1 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Stock Screener</h1>
        <span className="badge badge-demo">DEMO</span>
      </div>

      {/* Filters */}
      <div className="filter-grid" style={{ marginBottom: 16 }}>
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-sector">Sector</label>
          <select id="filter-sector" className="filter-select" value={sectorFilter} onChange={e => { setSectorFilter(e.target.value); setPage(0) }}>
            <option value="">All Sectors</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-type">Asset Type</label>
          <select id="filter-type" className="filter-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(0) }}>
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-pe-min">Min P/E</label>
          <input id="filter-pe-min" className="filter-input" type="number" placeholder="0" value={minPE} onChange={e => { setMinPE(e.target.value); setPage(0) }} />
        </div>
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-pe-max">Max P/E</label>
          <input id="filter-pe-max" className="filter-input" type="number" placeholder="100" value={maxPE} onChange={e => { setMaxPE(e.target.value); setPage(0) }} />
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>
        Showing {paginated.length} of {sorted.length} results
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('symbol')}>Symbol <SortIcon k="symbol" /></th>
              <th>Company</th>
              <th onClick={() => handleSort('price')} style={{ textAlign: 'right' }}>Price <SortIcon k="price" /></th>
              <th onClick={() => handleSort('pct')} style={{ textAlign: 'right' }}>Change% <SortIcon k="pct" /></th>
              <th onClick={() => handleSort('mktCap')} style={{ textAlign: 'right' }}>Mkt Cap <SortIcon k="mktCap" /></th>
              <th onClick={() => handleSort('pe')} style={{ textAlign: 'right' }}>P/E <SortIcon k="pe" /></th>
              <th onClick={() => handleSort('roe')} style={{ textAlign: 'right' }}>ROE% <SortIcon k="roe" /></th>
              <th onClick={() => handleSort('divYield')} style={{ textAlign: 'right' }}>Div% <SortIcon k="divYield" /></th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(r => (
              <tr key={r.symbol} style={{ cursor: 'pointer' }} onClick={() => router.push(`/chart/${r.symbol}`)}>
                <td>
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{r.symbol}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{r.exchange}</div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{r.price.toFixed(r.price < 10 ? 4 : 2)}</td>
                <td className={`mono ${r.pct >= 0 ? 'positive' : 'negative'}`} style={{ textAlign: 'right', fontWeight: 600 }}>
                  {r.pct >= 0 ? '+' : ''}{r.pct.toFixed(2)}%
                </td>
                <td className="mono" style={{ textAlign: 'right' }}>{fmtCap(r.mktCap)}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{r.pe ? r.pe.toFixed(1) : '—'}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{r.roe ? r.roe.toFixed(1) + '%' : '—'}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{r.divYield ? r.divYield.toFixed(2) + '%' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
          <button className="btn-ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span style={{ padding: '5px 10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {page + 1} / {totalPages}
          </span>
          <button className="btn-ghost" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}
