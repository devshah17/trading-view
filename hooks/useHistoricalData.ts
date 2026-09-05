'use client'

import { useState, useEffect, useRef } from 'react'
import { fetchHistoricalData } from '@/lib/market-data/historical'
import type { Candle, Timeframe, HistoricalData } from '@/lib/market-data/types'

interface UseHistoricalDataResult {
  data: HistoricalData | null
  candles: Candle[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useHistoricalData(
  symbol: string | null,
  timeframe: Timeframe,
): UseHistoricalDataResult {
  const [data, setData] = useState<HistoricalData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchRef = useRef(0)

  const fetch = async () => {
    if (!symbol) return
    const id = ++fetchRef.current
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchHistoricalData(symbol, timeframe)
      if (fetchRef.current === id) {
        setData(result)
      }
    } catch (err) {
      if (fetchRef.current === id) {
        setError(err instanceof Error ? err.message : 'Failed to load historical data')
      }
    } finally {
      if (fetchRef.current === id) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetch()
  }, [symbol, timeframe])

  return {
    data,
    candles: data?.candles ?? [],
    isLoading,
    error,
    refetch: fetch,
  }
}
