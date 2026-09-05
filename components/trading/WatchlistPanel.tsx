'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, List, MoreHorizontal } from 'lucide-react'
import { useWatchlist } from '@/hooks/useWatchlist'
import { useChartStore } from '@/stores/chartStore'
import { WatchlistItem } from './WatchlistItem'
import { searchSymbols } from '@/lib/market-data/symbols'
import type { Symbol } from '@/lib/market-data/types'

export function WatchlistPanel() {
  const router = useRouter()
  const [filterQuery, setFilterQuery] = useState('')
  const [addQuery, setAddQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [addResults, setAddResults] = useState<Symbol[]>([])
  const selectedSymbol = useChartStore(s => s.selectedSymbol)
  const setSymbol = useChartStore(s => s.setSymbol)

  const { watchlists, activeWatchlist, activeWatchlistId, addSymbol, removeSymbol, setActiveWatchlist, createWatchlist } = useWatchlist()

  const handleSelect = (symbol: string) => {
    setSymbol(symbol)
    router.push(`/chart/${symbol}`)
  }

  const filteredEntries = activeWatchlist.entries.filter(e =>
    e.symbol.toLowerCase().includes(filterQuery.toLowerCase())
  )

  useEffect(() => {
    if (addQuery.length > 0) {
      const t = setTimeout(async () => {
        const res = await searchSymbols(addQuery, 6)
        setAddResults(res)
      }, 200)
      return () => clearTimeout(t)
    } else {
      setAddResults([])
    }
  }, [addQuery])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Watchlist tabs */}
      <div className="watchlist-tabs" role="tablist" aria-label="Watchlists">
        {watchlists.map(wl => (
          <button
            key={wl.id}
            className={`watchlist-tab ${wl.id === activeWatchlistId ? 'active' : ''}`}
            onClick={() => setActiveWatchlist(wl.id)}
            role="tab"
            aria-selected={wl.id === activeWatchlistId}
          >
            {wl.name}
          </button>
        ))}
        <button
          className="watchlist-tab"
          onClick={() => createWatchlist(`Watchlist ${watchlists.length + 1}`)}
          aria-label="Create new watchlist"
          title="New Watchlist"
        >
          +
        </button>
      </div>

      {/* Search filter */}
      <div className="watchlist-search">
        <Search size={11} color="var(--text-muted)" />
        <input
          id="watchlist-filter"
          placeholder="Filter..."
          value={filterQuery}
          onChange={e => setFilterQuery(e.target.value)}
          aria-label="Filter watchlist"
        />
        <button
          className="icon-btn"
          onClick={() => setShowAdd(s => !s)}
          aria-label="Add symbol to watchlist"
          aria-expanded={showAdd}
          title="Add symbol"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Add symbol dropdown */}
      {showAdd && (
        <div style={{
          padding: '6px 8px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)',
          flexShrink: 0,
        }}>
          <input
            id="watchlist-add-input"
            style={{ width: '100%', fontSize: '0.78rem' }}
            placeholder="Type symbol to add..."
            value={addQuery}
            onChange={e => setAddQuery(e.target.value)}
            autoFocus
            aria-label="Add symbol"
          />
          {addResults.map(sym => (
            <button
              key={sym.symbol}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                width: '100%', padding: '4px 6px', background: 'transparent',
                border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-primary)',
                borderRadius: 'var(--radius-sm)',
              }}
              onClick={() => { addSymbol(sym.symbol); setAddQuery(''); setShowAdd(false) }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{sym.symbol}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sym.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Entries */}
      <div className="sidebar-section" role="table" aria-label="Watchlist">
        {filteredEntries.length === 0 ? (
          <div className="empty-state">
            <List size={20} className="empty-state-icon" />
            <p className="empty-state-text">No symbols.\nClick + to add one.</p>
          </div>
        ) : (
          filteredEntries.map(({ symbol }) => (
            <WatchlistItem
              key={symbol}
              symbol={symbol}
              isActive={symbol === selectedSymbol}
              onSelect={handleSelect}
              onRemove={removeSymbol}
            />
          ))
        )}
      </div>
    </div>
  )
}
