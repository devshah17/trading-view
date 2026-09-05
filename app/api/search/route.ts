import { NextRequest, NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')

  if (!query) return NextResponse.json({ results: [] })

  try {
    const result = await yahooFinance.search(query, {}, { validateResult: false })
    const results = (result as any).quotes
      .filter((q: any) => q.isYahooFinance)
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange || 'Unknown',
        type: q.quoteType?.toLowerCase() === 'equity' ? 'stock' : q.quoteType?.toLowerCase() || 'unknown',
        sector: q.sector,
        currency: q.currency || 'USD'
      }))

    return NextResponse.json({ results: results.slice(0, 10) })
  } catch (error) {
    console.error('Yahoo Finance API Error (search):', error)
    return NextResponse.json({ error: 'Failed to search symbols' }, { status: 500 })
  }
}
