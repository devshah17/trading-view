'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Watchlist, WatchlistEntry } from '@/lib/market-data/types'

const DEFAULT_WATCHLIST: Watchlist = {
  id: 'default',
  name: 'My Watchlist',
  entries: [
    { symbol: 'AAPL', addedAt: Date.now() },
    { symbol: 'NVDA', addedAt: Date.now() },
    { symbol: 'MSFT', addedAt: Date.now() },
    { symbol: 'BTCUSD', addedAt: Date.now() },
    { symbol: 'RELIANCE', addedAt: Date.now() },
    { symbol: 'TSLA', addedAt: Date.now() },
    { symbol: 'EURUSD', addedAt: Date.now() },
    { symbol: 'SPY', addedAt: Date.now() },
  ],
}

interface WatchlistState {
  watchlists: Watchlist[]
  activeWatchlistId: string
  addSymbol: (symbol: string, watchlistId?: string) => void
  removeSymbol: (symbol: string, watchlistId?: string) => void
  reorderSymbols: (from: number, to: number, watchlistId?: string) => void
  createWatchlist: (name: string) => void
  deleteWatchlist: (id: string) => void
  renameWatchlist: (id: string, name: string) => void
  setActiveWatchlist: (id: string) => void
  getActiveWatchlist: () => Watchlist
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlists: [DEFAULT_WATCHLIST],
      activeWatchlistId: 'default',

      addSymbol: (symbol, watchlistId) => {
        const id = watchlistId ?? get().activeWatchlistId
        set(state => ({
          watchlists: state.watchlists.map(wl =>
            wl.id === id && !wl.entries.find(e => e.symbol === symbol)
              ? { ...wl, entries: [...wl.entries, { symbol, addedAt: Date.now() }] }
              : wl,
          ),
        }))
      },

      removeSymbol: (symbol, watchlistId) => {
        const id = watchlistId ?? get().activeWatchlistId
        set(state => ({
          watchlists: state.watchlists.map(wl =>
            wl.id === id
              ? { ...wl, entries: wl.entries.filter(e => e.symbol !== symbol) }
              : wl,
          ),
        }))
      },

      reorderSymbols: (from, to, watchlistId) => {
        const id = watchlistId ?? get().activeWatchlistId
        set(state => ({
          watchlists: state.watchlists.map(wl => {
            if (wl.id !== id) return wl
            const entries = [...wl.entries]
            const [item] = entries.splice(from, 1)
            entries.splice(to, 0, item)
            return { ...wl, entries }
          }),
        }))
      },

      createWatchlist: (name) => {
        const id = `wl-${Date.now()}`
        set(state => ({
          watchlists: [...state.watchlists, { id, name, entries: [] }],
          activeWatchlistId: id,
        }))
      },

      deleteWatchlist: (id) => {
        set(state => {
          const watchlists = state.watchlists.filter(wl => wl.id !== id)
          return {
            watchlists: watchlists.length ? watchlists : [DEFAULT_WATCHLIST],
            activeWatchlistId: watchlists[0]?.id ?? 'default',
          }
        })
      },

      renameWatchlist: (id, name) => {
        set(state => ({
          watchlists: state.watchlists.map(wl => wl.id === id ? { ...wl, name } : wl),
        }))
      },

      setActiveWatchlist: (id) => set({ activeWatchlistId: id }),

      getActiveWatchlist: () => {
        const { watchlists, activeWatchlistId } = get()
        return watchlists.find(wl => wl.id === activeWatchlistId) ?? watchlists[0]
      },
    }),
    { name: 'trading-watchlists' },
  ),
)
