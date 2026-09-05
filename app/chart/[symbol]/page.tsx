import { TradingTerminal } from '@/components/trading/TradingTerminal'
import { AppShell } from '@/components/layout/AppShell'

export default async function ChartPage(props: PageProps<'/chart/[symbol]'>) {
  const { symbol } = await props.params
  return (
    <AppShell>
      <TradingTerminal symbol={symbol.toUpperCase()} />
    </AppShell>
  )
}

export function generateMetadata() {
  return { title: 'Chart | QuantTerminal' }
}
