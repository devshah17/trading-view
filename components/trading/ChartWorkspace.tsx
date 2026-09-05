'use client'

import { InstrumentHeader } from './InstrumentHeader'
import { ChartToolbar } from './ChartToolbar'
import { DrawingToolbar } from './DrawingToolbar'
import { TradingChart } from './TradingChart'
import { PerformanceSummary } from './PerformanceSummary'

export function ChartWorkspace() {
  return (
    <div className="chart-area">
      <InstrumentHeader />
      <ChartToolbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <DrawingToolbar />
        <TradingChart />
      </div>
      <PerformanceSummary />
    </div>
  )
}
