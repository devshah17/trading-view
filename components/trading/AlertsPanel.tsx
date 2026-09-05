'use client'
import { useState } from 'react'
import { Bell, Plus, X, Check, Pause, Play, AlertTriangle } from 'lucide-react'
import { useAlertStore } from '@/stores/alertStore'
import { searchSymbols } from '@/lib/market-data/symbols'
import { DEMO_SYMBOLS } from '@/lib/market-data/demo-data'
import type { Alert } from '@/lib/market-data/types'

const CONDITION_LABELS: Record<Alert['condition'], string> = {
  above: 'Price crosses above',
  below: 'Price crosses below',
  'pct-change': '% change exceeds',
  'volume-above': 'Volume exceeds',
}

export function AlertsPanel() {
  const alerts = useAlertStore(s => s.alerts)
  const addAlert = useAlertStore(s => s.addAlert)
  const removeAlert = useAlertStore(s => s.removeAlert)
  const toggleAlert = useAlertStore(s => s.toggleAlert)

  const [showForm, setShowForm] = useState(false)
  const [symbol, setSymbol] = useState('AAPL')
  const [condition, setCondition] = useState<Alert['condition']>('above')
  const [value, setValue] = useState('')
  const [note, setNote] = useState('')

  const handleCreate = () => {
    if (!symbol || !value) return
    addAlert({ symbol: symbol.toUpperCase(), condition, value: parseFloat(value), note, active: true })
    setValue('')
    setNote('')
    setShowForm(false)
  }

  const activeAlerts = alerts.filter(a => a.active && !a.triggered)
  const triggeredAlerts = alerts.filter(a => a.triggered)
  const inactiveAlerts = alerts.filter(a => !a.active && !a.triggered)

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={15} />
          <h1 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Price Alerts</h1>
          {activeAlerts.length > 0 && (
            <span className="badge badge-open">{activeAlerts.length} Active</span>
          )}
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)} id="create-alert-btn">
          <Plus size={12} style={{ display: 'inline', marginRight: 4 }} />
          Create Alert
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16,
        }}>
          <h3 style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 12 }}>New Alert</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div className="filter-group">
              <label className="filter-label" htmlFor="alert-symbol">Symbol</label>
              <select
                id="alert-symbol"
                className="filter-select"
                value={symbol}
                onChange={e => setSymbol(e.target.value)}
              >
                {DEMO_SYMBOLS.map(s => (
                  <option key={s.symbol} value={s.symbol}>{s.symbol} — {s.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label" htmlFor="alert-condition">Condition</label>
              <select
                id="alert-condition"
                className="filter-select"
                value={condition}
                onChange={e => setCondition(e.target.value as Alert['condition'])}
              >
                {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label" htmlFor="alert-value">Value</label>
              <input
                id="alert-value"
                className="filter-input"
                type="number"
                placeholder="e.g. 150.00"
                value={value}
                onChange={e => setValue(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label" htmlFor="alert-note">Note (optional)</label>
              <input
                id="alert-note"
                className="filter-input"
                placeholder="My note..."
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={handleCreate} id="save-alert-btn">Create Alert</button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Active alerts */}
      {activeAlerts.length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 8 }}>Active</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activeAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} onRemove={removeAlert} onToggle={toggleAlert} />
            ))}
          </div>
        </section>
      )}

      {/* Triggered */}
      {triggeredAlerts.length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 8, color: 'var(--warning)' }}>Triggered</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {triggeredAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} onRemove={removeAlert} onToggle={toggleAlert} />
            ))}
          </div>
        </section>
      )}

      {/* Inactive */}
      {inactiveAlerts.length > 0 && (
        <section>
          <div className="section-title" style={{ marginBottom: 8 }}>Paused</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {inactiveAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} onRemove={removeAlert} onToggle={toggleAlert} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {alerts.length === 0 && !showForm && (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <Bell size={32} className="empty-state-icon" />
          <p className="empty-state-text">No alerts yet.\nClick \"Create Alert\" to set up your first price alert.</p>
        </div>
      )}
    </div>
  )
}

function AlertCard({ alert, onRemove, onToggle }: {
  alert: Alert
  onRemove: (id: string) => void
  onToggle: (id: string) => void
}) {
  const CONDITION_LABELS: Record<Alert['condition'], string> = {
    above: '>', below: '<', 'pct-change': 'Δ%', 'volume-above': 'Vol>',
  }
  return (
    <div className={`alert-card ${alert.triggered ? 'triggered' : ''} ${!alert.active ? 'inactive' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        {alert.triggered && <AlertTriangle size={13} color="var(--warning)" />}
        <span className="alert-symbol">{alert.symbol}</span>
        <span className="alert-condition">
          {CONDITION_LABELS[alert.condition]} {alert.value.toLocaleString()}
        </span>
        {alert.note && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>— {alert.note}</span>}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          className="icon-btn"
          onClick={() => onToggle(alert.id)}
          aria-label={alert.active ? 'Pause alert' : 'Resume alert'}
          title={alert.active ? 'Pause' : 'Resume'}
        >
          {alert.active ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <button
          className="icon-btn danger"
          onClick={() => onRemove(alert.id)}
          aria-label={`Delete alert for ${alert.symbol}`}
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
