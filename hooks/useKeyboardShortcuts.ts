'use client'

import { useEffect } from 'react'

type ShortcutMap = Record<string, () => void>

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't fire if user is typing in an input
      const target = e.target as HTMLElement
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      if (isInput) return

      const key = e.key.toLowerCase()
      const action = shortcuts[key] ?? shortcuts[e.key]
      if (action) {
        e.preventDefault()
        action()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [shortcuts])
}
