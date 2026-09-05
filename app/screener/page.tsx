import { AppShell } from '@/components/layout/AppShell'
import { StockScreener } from '@/components/trading/StockScreener'

export const metadata = {
  title: 'Screener | QuantTerminal',
  description: 'Advanced stock screener with fundamental and technical filters.',
}

export default function ScreenerPage() {
  return (
    <AppShell>
      <StockScreener />
    </AppShell>
  )
}
