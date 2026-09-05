import { AppShell } from '@/components/layout/AppShell'
import { MarketOverview } from '@/components/trading/MarketOverview'

export const metadata = {
  title: 'Markets | QuantTerminal',
  description: 'Global market overview with indices, top gainers, losers and most active stocks.',
}

export default function MarketsPage() {
  return (
    <AppShell>
      <MarketOverview />
    </AppShell>
  )
}
