'use client'
import type { MarketStatus } from '@/lib/market-data/types'
const LABELS: Record<MarketStatus, string> = {
  open: 'Market Open',
  closed: 'Market Closed',
  'pre-market': 'Pre-Market',
  'after-hours': 'After Hours',
  holiday: 'Holiday',
}
const VARIANTS: Record<MarketStatus, string> = {
  open: 'badge-open',
  closed: 'badge-closed',
  'pre-market': 'badge-pre',
  'after-hours': 'badge-pre',
  holiday: 'badge-closed',
}
export function MarketStatusBadge({ status }: { status: MarketStatus }) {
  return <span className={`badge ${VARIANTS[status]}`}>{LABELS[status]}</span>
}
