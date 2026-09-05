import { NextRequest, NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })
import type { Timeframe } from '@/lib/market-data/types'

// Map UI timeframes to Yahoo Finance intervals and lookback periods
const TIMEFRAME_MAP: Record<Timeframe, { interval: '1m' | '5m' | '15m' | '60m' | '1d' | '1wk' | '1mo', period: string }> = {
  '1m': { interval: '1m', period: '1d' },
  '5m': { interval: '5m', period: '1d' },
  '10m': { interval: '15m', period: '1d' },
  '1H': { interval: '60m', period: '1d' },
  
  '1D': { interval: '5m', period: '1d' },
  '1W': { interval: '15m', period: '7d' },
  '1M': { interval: '60m', period: '1mo' },
  '6M': { interval: '1d', period: '6mo' },
  '1Y': { interval: '1d', period: '1y' },
  '3Y': { interval: '1wk', period: '3y' },
  '5Y': { interval: '1wk', period: '5y' },
  '10Y': { interval: '1mo', period: '10y' },
  'ALL': { interval: '1mo', period: '50y' },
}

const YAHOO_SYMBOL_MAP: Record<string, string> = {
  'NIFTY50': '^NSEI',
  'SENSEX': '^BSESN',
  'SPX': '^GSPC',
  'NDX': '^NDX',
  'DJI': '^DJI',
  'BTCUSD': 'BTC-USD',
  'ETHUSD': 'ETH-USD',
  'SOLUSD': 'SOL-USD',
  'EURUSD': 'EURUSD=X',
  'GBPUSD': 'GBPUSD=X',
  'USDJPY': 'JPY=X',
  'RELIANCE': 'RELIANCE.NS',
  'TCS': 'TCS.NS',
  'INFY': 'INFY.NS',
  'HDFC': 'HDFCBANK.NS'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawSymbol = searchParams.get('symbol')
  const timeframe = (searchParams.get('timeframe') as Timeframe) || '1D'

  if (!rawSymbol) return NextResponse.json({ error: 'Missing symbol' }, { status: 400 })
  const symbol = YAHOO_SYMBOL_MAP[rawSymbol.toUpperCase()] || rawSymbol.toUpperCase()

  try {
    const tfConfig = TIMEFRAME_MAP[timeframe] || TIMEFRAME_MAP['1Y']
    
    const now = new Date()
    const period1 = new Date()
    
    const match = tfConfig.period.match(/^(\d+)([a-z]+)$/)
    if (match) {
      const num = parseInt(match[1])
      const unit = match[2]
      if (unit === 'd') period1.setDate(now.getDate() - num)
      else if (unit === 'mo') period1.setMonth(now.getMonth() - num)
      else if (unit === 'y') period1.setFullYear(now.getFullYear() - num)
    }

    const result = await yahooFinance.chart(symbol, {
      period1,
      interval: tfConfig.interval
    }, { validateResult: false })
    
    const candles = ((result as any).quotes as any[])
      .filter((c: any) => c.open != null && c.high != null && c.low != null && c.close != null)
      .map((c: any) => ({
        timestamp: Math.floor(c.date.getTime() / 1000),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume || 0
      }))

    return NextResponse.json({ candles })
  } catch (error: any) {
    if (error.message && error.message.includes('No data found')) {
      return NextResponse.json({ candles: [] })
    }
    console.error('Yahoo Finance API Error (historical):', error)
    return NextResponse.json({ error: 'Failed to fetch historical data' }, { status: 500 })
  }
}
