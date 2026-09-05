import { AppShell } from '@/components/layout/AppShell'
import { WatchlistPanel } from '@/components/trading/WatchlistPanel'

export const metadata = {
  title: 'Watchlist | QuantTerminal',
}

export default function WatchlistPage() {
  return (
    <AppShell>
      <div style={{ flex: 1, maxWidth: 480, margin: '0 auto', padding: 16 }}>
        <h1 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>My Watchlists</h1>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '80vh' }}>
          <WatchlistPanel />
        </div>
      </div>
    </AppShell>
  )
}
