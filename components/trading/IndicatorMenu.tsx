'use client'
import { useState } from 'react'
import { Search, X, Eye, EyeOff, Settings2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useChartStore } from '@/stores/chartStore'
import type { IndicatorConfig, IndicatorType } from '@/lib/market-data/types'

interface IndicatorDef {
  type: IndicatorType
  name: string
  description: string
  defaultPeriod?: number
  color: string
}

const ALL_INDICATORS: IndicatorDef[] = [
  { type: 'SMA',   name: 'SMA',              description: 'Simple Moving Average',       defaultPeriod: 20, color: '#4f8ef7' },
  { type: 'EMA',   name: 'EMA',              description: 'Exponential Moving Average',  defaultPeriod: 20, color: '#f0a020' },
  { type: 'WMA',   name: 'WMA',              description: 'Weighted Moving Average',     defaultPeriod: 20, color: '#8b5cf6' },
  { type: 'VWAP',  name: 'VWAP',             description: 'Volume Weighted Avg Price',   color: '#06b6d4' },
  { type: 'BB',    name: 'Bollinger Bands',  description: 'Bollinger Bands (20, 2)',     defaultPeriod: 20, color: '#26c281' },
  { type: 'RSI',   name: 'RSI',              description: 'Relative Strength Index',     defaultPeriod: 14, color: '#e84040' },
  { type: 'MACD',  name: 'MACD',             description: 'Moving Avg Convergence Div.', color: '#4f8ef7' },
  { type: 'STOCH', name: 'Stochastic',        description: 'Stochastic Oscillator',      defaultPeriod: 14, color: '#f0a020' },
  { type: 'ATR',   name: 'ATR',              description: 'Average True Range',          defaultPeriod: 14, color: '#8b5cf6' },
  { type: 'ADX',   name: 'ADX',              description: 'Average Directional Index',   defaultPeriod: 14, color: '#06b6d4' },
]

export function IndicatorMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const indicators = useChartStore(s => s.indicators)
  const addIndicator = useChartStore(s => s.addIndicator)
  const removeIndicator = useChartStore(s => s.removeIndicator)
  const toggleIndicatorVisibility = useChartStore(s => s.toggleIndicatorVisibility)

  const filtered = ALL_INDICATORS.filter(ind =>
    ind.name.toLowerCase().includes(query.toLowerCase()) ||
    ind.description.toLowerCase().includes(query.toLowerCase())
  )

  const isActive = (type: IndicatorType) => indicators.some(i => i.type === type)

  const toggle = (def: IndicatorDef) => {
    const existing = indicators.find(i => i.type === def.type)
    if (existing) {
      removeIndicator(existing.id)
    } else {
      const config: IndicatorConfig = {
        id: `${def.type}-${Date.now()}`,
        type: def.type,
        period: def.defaultPeriod,
        color: def.color,
        visible: true,
      }
      addIndicator(config)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Indicators"
      footer={
        <>
          {indicators.length > 0 && (
            <span className="text-xs text-muted">{indicators.length} active</span>
          )}
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </>
      }
    >
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '6px 10px', background: 'var(--bg-overlay)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
        <Search size={13} color="var(--text-muted)" />
        <input
          id="indicator-search"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', fontFamily: 'var(--font-sans)' }}
          placeholder="Search indicators..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
          aria-label="Search indicators"
        />
        {query && <button className="icon-btn" onClick={() => setQuery('')}><X size={11} /></button>}
      </div>

      {/* Active indicators */}
      {indicators.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div className="section-title" style={{ marginBottom: 6 }}>Active</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {indicators.map(ind => (
              <div
                key={ind.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '5px 8px', background: 'var(--bg-overlay)', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: ind.color ?? 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>{ind.type}{ind.period ? ` (${ind.period})` : ''}</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className="icon-btn"
                    onClick={() => toggleIndicatorVisibility(ind.id)}
                    aria-label={ind.visible ? 'Hide indicator' : 'Show indicator'}
                  >
                    {ind.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  <button
                    className="icon-btn danger"
                    onClick={() => removeIndicator(ind.id)}
                    aria-label={`Remove ${ind.type} indicator`}
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '12px 0' }} />
        </div>
      )}

      {/* All indicators */}
      <div className="section-title" style={{ marginBottom: 6 }}>All Indicators</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {filtered.map(def => {
          const active = isActive(def.type)
          return (
            <button
              key={def.type}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 8px', background: active ? 'var(--accent-muted)' : 'transparent',
                border: `1px solid ${active ? 'rgba(79,142,247,0.3)' : 'transparent'}`,
                borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.12s',
              }}
              onClick={() => toggle(def)}
              aria-pressed={active}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: def.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{def.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{def.description}</div>
                </div>
              </div>
              {active && <X size={11} color="var(--accent)" />}
            </button>
          )
        })}
      </div>
    </Modal>
  )
}
