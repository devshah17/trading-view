'use client'

import { useState } from 'react'
import {
  CandlestickChart, TrendingUp, BarChart2, Activity, LineChart,
  Layers, Maximize2, RotateCcw, SlidersHorizontal,
  ChevronDown, Camera
} from 'lucide-react'
import { useChartStore } from '@/stores/chartStore'
import { IndicatorMenu } from './IndicatorMenu'
import { Tooltip } from '@/components/ui/Tooltip'
import type { Timeframe, ChartType } from '@/lib/market-data/types'

const INTRADAY: Timeframe[] = ['1m', '5m', '10m', '1H']
const HISTORICAL: Timeframe[] = ['1D', '1W', '1M', '6M', '1Y', '3Y', '5Y', '10Y', 'ALL']

const CHART_TYPES: { type: ChartType; label: string; Icon: React.ElementType }[] = [
  { type: 'candlestick',   label: 'Candles',       Icon: CandlestickChart },
  { type: 'hollow-candle', label: 'Hollow Candles', Icon: CandlestickChart },
  { type: 'line',          label: 'Line',           Icon: TrendingUp },
  { type: 'area',          label: 'Area',           Icon: Activity },
  { type: 'bar',           label: 'Bars',           Icon: BarChart2 },
]

export function ChartToolbar() {
  const timeframe = useChartStore(s => s.timeframe)
  const chartType = useChartStore(s => s.chartType)
  const indicators = useChartStore(s => s.indicators)
  const preferences = useChartStore(s => s.preferences)
  const setTimeframe = useChartStore(s => s.setTimeframe)
  const setChartType = useChartStore(s => s.setChartType)
  const updatePreferences = useChartStore(s => s.updatePreferences)
  const setFullscreen = useChartStore(s => s.setFullscreen)

  const [indicatorMenuOpen, setIndicatorMenuOpen] = useState(false)
  const [chartTypeOpen, setChartTypeOpen] = useState(false)

  const activeChartType = CHART_TYPES.find(c => c.type === chartType) ?? CHART_TYPES[0]
  const ActiveIcon = activeChartType.Icon

  return (
    <>
      <div className="chart-toolbar" role="toolbar" aria-label="Chart controls">
        {/* Timeframe — Intraday */}
        <div className="toolbar-group" role="group" aria-label="Intraday timeframes">
          {INTRADAY.map(tf => (
            <button
              key={tf}
              id={`tf-${tf}`}
              className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
              aria-pressed={timeframe === tf}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="toolbar-divider" />

        {/* Timeframe — Historical */}
        <div className="toolbar-group" role="group" aria-label="Historical timeframes">
          {HISTORICAL.map(tf => (
            <button
              key={tf}
              id={`tf-${tf}`}
              className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
              aria-pressed={timeframe === tf}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="toolbar-divider" />

        {/* Chart Type */}
        <div style={{ position: 'relative' }}>
          <button
            id="chart-type-btn"
            className={`toolbar-btn ${chartTypeOpen ? 'active' : ''}`}
            onClick={() => setChartTypeOpen(o => !o)}
            aria-haspopup="true"
            aria-expanded={chartTypeOpen}
          >
            <ActiveIcon size={13} />
            <span>{activeChartType.label}</span>
            <ChevronDown size={10} />
          </button>
          {chartTypeOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                zIndex: 50,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                padding: '4px',
                minWidth: 160,
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {CHART_TYPES.map(({ type, label, Icon }) => (
                <button
                  key={type}
                  className={`toolbar-btn ${chartType === type ? 'active' : ''}`}
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '5px 8px' }}
                  onClick={() => { setChartType(type); setChartTypeOpen(false) }}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          )}
          {chartTypeOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setChartTypeOpen(false)} />
          )}
        </div>

        <div className="toolbar-divider" />

        {/* Indicators */}
        <button
          id="indicators-btn"
          className={`toolbar-btn ${indicatorMenuOpen ? 'active' : ''}`}
          onClick={() => setIndicatorMenuOpen(true)}
          aria-label={`Indicators${indicators.length > 0 ? ` (${indicators.length} active)` : ''}`}
        >
          <Layers size={13} />
          <span>Indicators</span>
          {indicators.length > 0 && (
            <span
              style={{
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: '100px',
                fontSize: '0.6rem',
                padding: '0 5px',
                fontWeight: 700,
                minWidth: 16,
                textAlign: 'center',
              }}
            >
              {indicators.length}
            </span>
          )}
        </button>

        <div style={{ flex: 1 }} />

        {/* Chart controls */}
        <Tooltip content="Volume">
          <button
            className={`toolbar-btn ${preferences.showVolume ? 'active' : ''}`}
            onClick={() => updatePreferences({ showVolume: !preferences.showVolume })}
            aria-pressed={preferences.showVolume}
            aria-label="Toggle volume"
          >
            <BarChart2 size={13} />
          </button>
        </Tooltip>

        <Tooltip content="Log Scale">
          <button
            className={`toolbar-btn ${preferences.logScale ? 'active' : ''}`}
            onClick={() => updatePreferences({ logScale: !preferences.logScale })}
            aria-pressed={preferences.logScale}
            aria-label="Toggle log scale"
          >
            <LineChart size={13} />
          </button>
        </Tooltip>

        <Tooltip content="Fullscreen (F)">
          <button
            className="toolbar-btn"
            onClick={() => {
              setFullscreen(true)
              document.getElementById('chart-container')?.requestFullscreen?.()
            }}
            aria-label="Fullscreen chart"
          >
            <Maximize2 size={13} />
          </button>
        </Tooltip>

        <Tooltip content="Chart Settings">
          <button className="toolbar-btn" aria-label="Chart settings">
            <SlidersHorizontal size={13} />
          </button>
        </Tooltip>
      </div>

      <IndicatorMenu open={indicatorMenuOpen} onClose={() => setIndicatorMenuOpen(false)} />
    </>
  )
}
