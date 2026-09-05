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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawSymbol = searchParams.get('symbol')

  if (!rawSymbol) {
    return NextResponse.json({ error: 'Missing symbol' }, { status: 400 })
  }

  const symbol = YAHOO_SYMBOL_MAP[rawSymbol.toUpperCase()] || rawSymbol.toUpperCase()

  try {
    const summary = await yahooFinance.quoteSummary(symbol, {
      modules: ['assetProfile', 'summaryDetail', 'defaultKeyStatistics', 'financialData']
    }, { validateResult: false })
    
    return NextResponse.json({ summary })
  } catch (error: any) {
    console.error('Yahoo Finance API Error (fundamentals):', error)
    if (error.message && (error.message.includes('No data found') || error.message.includes('Not Found'))) {
      return NextResponse.json({ summary: null })
    }
    return NextResponse.json({ error: 'Failed to fetch fundamentals data' }, { status: 500 })
  }
}
