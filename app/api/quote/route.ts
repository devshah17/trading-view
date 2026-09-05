import { NextRequest, NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

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
const REVERSE_MAP = Object.fromEntries(Object.entries(YAHOO_SYMBOL_MAP).map(([k, v]) => [v, k]))

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbolsParam = searchParams.get('symbols')

  if (!symbolsParam) return NextResponse.json({ error: 'Missing symbols' }, { status: 400 })

  const rawSymbols = symbolsParam.split(',').filter(Boolean)
  if (rawSymbols.length === 0) return NextResponse.json({ quotes: [] })

  const symbols = rawSymbols.map(s => YAHOO_SYMBOL_MAP[s.toUpperCase()] || s.toUpperCase())

  try {
    const results = await yahooFinance.quote(symbols, {}, { validateResult: false })
    const quotesArray = (Array.isArray(results) ? results : [results]) as any[]
    
    const quotes = quotesArray.map((q: any) => ({
      symbol: REVERSE_MAP[q.symbol] || q.symbol,
      price: q.regularMarketPrice || q.postMarketPrice || q.preMarketPrice || 0,
      change: q.regularMarketChange || 0,
      changePercent: q.regularMarketChangePercent || 0,
      open: q.regularMarketOpen || 0,
      high: q.regularMarketDayHigh || 0,
      low: q.regularMarketDayLow || 0,
      previousClose: q.regularMarketPreviousClose || 0,
      volume: q.regularMarketVolume || 0,
      timestamp: q.regularMarketTime?.getTime() || Date.now()
    }))

    return NextResponse.json({ quotes })
  } catch (error) {
    console.error('Yahoo Finance API Error (quote):', error)
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}
