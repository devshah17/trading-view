'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { searchSymbols } from '@/lib/market-data/symbols'
import type { Symbol } from '@/lib/market-data/types'
import { useMarketStore } from '@/stores/marketStore'
import { subscribeLivePrice } from '@/lib/market-data/websocket'

const TYPE_LABEL: Record<string, string> = {
  stock: 'EQ', etf: 'ETF', index: 'IDX', forex: 'FX', crypto: 'CRYPTO', commodity: 'CMD',
}

export function SymbolSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Symbol[]>([])
  const [focusedIdx, setFocusedIdx] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const quotes = useMarketStore(s => s.quotes)

  // Open on '/' shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return
      if (e.key === '/') { e.preventDefault(); setOpen(true) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await searchSymbols(query, 10)
      setResults(res)
      setFocusedIdx(0)
    }, 120)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (open) {
      searchSymbols('', 10).then(setResults)
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }, [open])

  const selectSymbol = useCallback((symbol: string) => {
    setOpen(false)
    router.push(`/chart/${symbol}`)
  }, [router])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIdx(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocusedIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && results[focusedIdx]) selectSymbol(results[focusedIdx].symbol)
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <>
      <button
        id="symbol-search-trigger"
        className="symbol-search-trigger"
        onClick={() => setOpen(true)}
        aria-label="Search symbols (press / to open)"
      >
        <Search size={12} />
        <span>Search symbol...</span>
        <span style={{ marginLeft: 'auto', opacity: 0.4, fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>/</span>
      </button>

      {open && (
        <div className="symbol-search-overlay" role="dialog" aria-modal aria-label="Symbol search">
          <div className="symbol-search-box">
            <div className="symbol-search-input-row">
              <Search size={14} color="var(--text-muted)" />
              <input
                ref={inputRef}
                id="symbol-search-input"
                className="symbol-search-input"
                placeholder="Search stocks, crypto, forex, ETFs..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKey}
                autoComplete="off"
                spellCheck={false}
                aria-label="Symbol search input"
              />
              {query && (
                <button className="icon-btn" onClick={() => setQuery('')} aria-label="Clear search">
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="search-results" role="listbox">
              {results.map((sym, i) => {
                const q = quotes[sym.symbol]
                const isPos = (q?.changePercent ?? 0) >= 0
                return (
                  <div
                    key={sym.symbol}
                    className={`search-result-item ${i === focusedIdx ? 'focused' : ''}`}
                    role="option"
                    aria-selected={i === focusedIdx}
                    onClick={() => selectSymbol(sym.symbol)}
                    onMouseEnter={() => setFocusedIdx(i)}
                  >
                    <div>
                      <div className="result-symbol">{sym.symbol}</div>
                      <div className="result-exchange">
                        <span className="badge badge-type" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>
                          {TYPE_LABEL[sym.type] ?? sym.type.toUpperCase()}
                        </span>
                        {' '}{sym.exchange}
                      </div>
                    </div>
                    <div>
                      <div className="result-name">{sym.name}</div>
                      {sym.sector && <div className="text-xs text-muted">{sym.sector}</div>}
                    </div>
                    <div className="result-price">
                      {q ? (
                        <>
                          <div>{q.price.toLocaleString()}</div>
                          <div className={isPos ? 'positive text-xs' : 'negative text-xs'}>
                            {isPos ? '+' : ''}{q.changePercent.toFixed(2)}%
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                )
              })}
              {results.length === 0 && (
                <div className="empty-state">
                  <p className="empty-state-text">No symbols found for "{query}"</p>
                </div>
              )}
            </div>
          </div>
          {/* Click outside to close */}
          <div style={{ position: 'fixed', inset: 0, zIndex: -1 }} onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  )
}
