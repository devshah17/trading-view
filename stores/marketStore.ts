'use client'

import { create } from 'zustand'
import type { Quote, MarketStatus } from '@/lib/market-data/types'
import type { ConnectionStatus } from '@/lib/market-data/websocket'

interface MarketState {
  quotes: Record<string, Quote>
  marketStatus: MarketStatus
  connectionStatus: ConnectionStatus
  setQuote: (quote: Quote) => void
  setMarketStatus: (status: MarketStatus) => void
  setConnectionStatus: (status: ConnectionStatus) => void
}

export const useMarketStore = create<MarketState>((set) => ({
  quotes: {},
  marketStatus: 'open',
  connectionStatus: 'connected',
  setQuote: (quote) =>
    set((state) => ({ quotes: { ...state.quotes, [quote.symbol]: quote } })),
  setMarketStatus: (status) => set({ marketStatus: status }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
}))
