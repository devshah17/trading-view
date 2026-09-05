import { AppShell } from '@/components/layout/AppShell'

export const metadata = { title: 'Settings | QuantTerminal' }

export default function SettingsPage() {
  return (
    <AppShell>
      <div style={{ flex: 1, maxWidth: 640, margin: '0 auto', padding: 24 }}>
        <h1>Settings</h1>
        <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
          Application settings will appear here. Use the chart toolbar to configure chart preferences.
        </p>
      </div>
    </AppShell>
  )
}
