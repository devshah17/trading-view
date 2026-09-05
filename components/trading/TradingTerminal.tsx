'use client'

import { useChartStore } from '@/stores/chartStore'
import { WatchlistPanel } from './WatchlistPanel'
import { ChartWorkspace } from './ChartWorkspace'
import { InstrumentInfoPanel } from './InstrumentInfoPanel'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect } from 'react'

interface TradingTerminalProps {
  symbol?: string
}

export function TradingTerminal({ symbol }: TradingTerminalProps) {
  const leftOpen = useChartStore(s => s.leftSidebarOpen)
  const rightOpen = useChartStore(s => s.rightSidebarOpen)
  const toggleLeft = useChartStore(s => s.toggleLeftSidebar)
  const toggleRight = useChartStore(s => s.toggleRightSidebar)
  const setSymbol = useChartStore(s => s.setSymbol)
  const selectedSymbol = useChartStore(s => s.selectedSymbol)

  // Sync symbol from URL param
  useEffect(() => {
    if (symbol && symbol !== selectedSymbol) {
      setSymbol(symbol.toUpperCase())
    }
  }, [symbol, selectedSymbol, setSymbol])

  return (
    <div className="workspace" style={{ position: 'relative' }}>
      {/* Left sidebar: Watchlist */}
      <div className={`sidebar sidebar-left ${leftOpen ? '' : 'collapsed'}`}>
        {leftOpen && <WatchlistPanel />}
      </div>

      {/* Collapse toggle left */}
      <button
        className="collapse-btn"
        onClick={toggleLeft}
        aria-label={leftOpen ? 'Collapse watchlist' : 'Expand watchlist'}
        title={leftOpen ? 'Collapse watchlist' : 'Expand watchlist'}
      >
        {leftOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* Main chart area */}
      <ChartWorkspace />

      {/* Collapse toggle right */}
      <button
        className="collapse-btn"
        onClick={toggleRight}
        aria-label={rightOpen ? 'Collapse info panel' : 'Expand info panel'}
        title={rightOpen ? 'Collapse info panel' : 'Expand info panel'}
        style={{ transform: 'scaleX(-1)' }}
      >
        {rightOpen ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Right sidebar: Instrument Info */}
      <div className={`sidebar sidebar-right ${rightOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <span className="section-title">Instrument Details</span>
        </div>
        {rightOpen && <InstrumentInfoPanel />}
      </div>
    </div>
  )
}
