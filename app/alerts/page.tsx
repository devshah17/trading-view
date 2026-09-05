import { AppShell } from '@/components/layout/AppShell'
import { AlertsPanel } from '@/components/trading/AlertsPanel'

export const metadata = {
  title: 'Alerts | QuantTerminal',
  description: 'Manage your price and condition-based market alerts.',
}

export default function AlertsPage() {
  return (
    <AppShell>
      <AlertsPanel />
    </AppShell>
  )
}
