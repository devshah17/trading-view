'use client'

import { InstrumentHeader } from './InstrumentHeader'
import { ChartToolbar } from './ChartToolbar'
import { DrawingToolbar } from './DrawingToolbar'
import dynamic from 'next/dynamic'

const TradingChart = dynamic(() => import('./TradingChart').then(m => m.TradingChart), { 
  ssr: false,
  loading: () => <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading chart engine...</div>
})
import { PerformanceSummary } from './PerformanceSummary'
import { InstrumentDetails } from './InstrumentDetails'

export function ChartWorkspace() {
  return (
    <div className="chart-area" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <InstrumentHeader />
      <ChartToolbar />
      <div style={{ display: 'flex', minHeight: '65vh', flexShrink: 0 }}>
        <DrawingToolbar />
        <TradingChart />
      </div>
      <InstrumentDetails />
      <PerformanceSummary />
    </div>
  )
}
