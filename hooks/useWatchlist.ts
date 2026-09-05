'use client'

import { useWatchlistStore } from '@/stores/watchlistStore'

export function useWatchlist() {
  const {
    watchlists,
    activeWatchlistId,
    addSymbol,
    removeSymbol,
    reorderSymbols,
    createWatchlist,
    deleteWatchlist,
    renameWatchlist,
    setActiveWatchlist,
    getActiveWatchlist,
  } = useWatchlistStore()

  const activeWatchlist = getActiveWatchlist()

  const isInWatchlist = (symbol: string) =>
    activeWatchlist.entries.some(e => e.symbol === symbol)

  const toggleSymbol = (symbol: string) => {
    if (isInWatchlist(symbol)) removeSymbol(symbol)
    else addSymbol(symbol)
  }

  return {
    watchlists,
    activeWatchlist,
    activeWatchlistId,
    isInWatchlist,
    toggleSymbol,
    addSymbol,
    removeSymbol,
    reorderSymbols,
    createWatchlist,
    deleteWatchlist,
    renameWatchlist,
    setActiveWatchlist,
  }
}
