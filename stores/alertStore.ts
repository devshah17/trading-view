'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Alert } from '@/lib/market-data/types'

interface AlertState {
  alerts: Alert[]
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'triggered'>) => void
  removeAlert: (id: string) => void
  toggleAlert: (id: string) => void
  markTriggered: (id: string) => void
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set) => ({
      alerts: [],

      addAlert: (alert) =>
        set(s => ({
          alerts: [
            ...s.alerts,
            { ...alert, id: `alert-${Date.now()}`, createdAt: Date.now(), triggered: false },
          ],
        })),

      removeAlert: (id) =>
        set(s => ({ alerts: s.alerts.filter(a => a.id !== id) })),

      toggleAlert: (id) =>
        set(s => ({
          alerts: s.alerts.map(a => a.id === id ? { ...a, active: !a.active } : a),
        })),

      markTriggered: (id) =>
        set(s => ({
          alerts: s.alerts.map(a => a.id === id ? { ...a, triggered: true, active: false } : a),
        })),
    }),
    { name: 'trading-alerts' },
  ),
)
