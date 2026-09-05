'use client'
import type { ReactNode } from 'react'
type BadgeVariant = 'demo' | 'open' | 'closed' | 'pre' | 'type' | 'warning'
export function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}
