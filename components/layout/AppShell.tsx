'use client'
import { useChartStore } from '@/stores/chartStore'
import { TopNavigation } from './TopNavigation'
import type { ReactNode } from 'react'

export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <div className="app-shell">
      <TopNavigation />
      <div className="workspace">
        {children}
      </div>
    </div>
  )
}
