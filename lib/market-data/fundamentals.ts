import { useState, useEffect, useRef } from 'react'

export interface FundamentalsData {
  assetProfile?: {
    longBusinessSummary?: string
    industry?: string
    sector?: string
    fullTimeEmployees?: number
    website?: string
    city?: string
    country?: string
  }
  summaryDetail?: {
    marketCap?: number
    dividendYield?: number
    beta?: number
    fiftyTwoWeekHigh?: number
    fiftyTwoWeekLow?: number
    averageVolume?: number
    trailingPE?: number
  }
  defaultKeyStatistics?: {
    forwardPE?: number
    pegRatio?: number
    priceToBook?: number
    shortRatio?: number
  }
  financialData?: {
    totalRevenue?: number
    totalCash?: number
    totalDebt?: number
    operatingMargins?: number
    profitMargins?: number
    revenueGrowth?: number
    debtToEquity?: number
    returnOnEquity?: number
  }
}

export function useFundamentals(symbol: string | null) {
  const [data, setData] = useState<FundamentalsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchRef = useRef(0)

  useEffect(() => {
    if (!symbol) {
      setData(null)
      return
    }

    const fetchId = ++fetchRef.current
    setIsLoading(true)
    setError(null)

    fetch(`/api/fundamentals?symbol=${encodeURIComponent(symbol)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch fundamentals')
        return res.json()
      })
      .then(json => {
        if (fetchRef.current === fetchId) {
          setData(json.summary || null)
          setIsLoading(false)
        }
      })
      .catch(err => {
        if (fetchRef.current === fetchId) {
          setError(err.message)
          setIsLoading(false)
        }
      })
  }, [symbol])

  return { data, isLoading, error }
}
