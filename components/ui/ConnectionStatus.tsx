'use client'
import { useEffect, useState } from 'react'
import { subscribeConnectionStatus } from '@/lib/market-data/websocket'
import type { ConnectionStatus } from '@/lib/market-data/websocket'
export function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('connected')
  useEffect(() => {
    const unsub = subscribeConnectionStatus(setStatus)
    return unsub
  }, [])
  const label = status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting...' : 'Disconnected'
  return (
    <div className="flex items-center gap-1" title={label}>
      <div className={`conn-dot ${status}`} />
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  )
}
