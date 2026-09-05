import type { Quote } from './types'

type PriceListener = (quote: Quote) => void

interface LiveSubscription {
  symbol: string
  listeners: Set<PriceListener>
  lastQuote?: Quote
}

const subscriptions = new Map<string, LiveSubscription>()
let pollingTimer: ReturnType<typeof setInterval> | null = null

async function pollQuotes() {
  if (subscriptions.size === 0) return

  const symbols = Array.from(subscriptions.keys())
  try {
    const res = await fetch(`/api/quote?symbols=${encodeURIComponent(symbols.join(','))}`)
    if (!res.ok) return
    const data = await res.json()
    
    const quotes = data.quotes as Quote[]
    quotes.forEach(quote => {
      const sub = subscriptions.get(quote.symbol)
      if (sub) {
        sub.lastQuote = quote
        sub.listeners.forEach(fn => fn(quote))
      }
    })
  } catch (e) {
    console.error('Polling error', e)
  }
}

function startPolling() {
  if (!pollingTimer) {
    pollingTimer = setInterval(pollQuotes, 3000)
    pollQuotes()
  }
}

function stopPollingIfEmpty() {
  if (subscriptions.size === 0 && pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

export function subscribeLivePrice(symbol: string, listener: PriceListener): () => void {
  let sub = subscriptions.get(symbol)
  if (!sub) {
    sub = { symbol, listeners: new Set() }
    subscriptions.set(symbol, sub)
    startPolling()
  }
  sub.listeners.add(listener)

  if (sub.lastQuote) listener(sub.lastQuote)

  return () => {
    sub!.listeners.delete(listener)
    if (sub!.listeners.size === 0) {
      subscriptions.delete(symbol)
      stopPollingIfEmpty()
    }
  }
}

export function getLatestQuote(symbol: string): Quote | undefined {
  return subscriptions.get(symbol)?.lastQuote
}

export function getBulkQuotes(symbols: string[]): Quote[] {
  return symbols.map(sym => subscriptions.get(sym)?.lastQuote).filter(Boolean) as Quote[]
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'
type StatusListener = (status: ConnectionStatus) => void
const statusListeners = new Set<StatusListener>()
let _status: ConnectionStatus = 'connected'

export function subscribeConnectionStatus(listener: StatusListener): () => void {
  statusListeners.add(listener)
  listener(_status)
  return () => statusListeners.delete(listener)
}

export function getConnectionStatus(): ConnectionStatus {
  return _status
}
