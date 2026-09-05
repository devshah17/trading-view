import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QuantTerminal — Professional Trading Platform',
  description: 'A professional trading terminal with live charts, technical analysis, watchlists, market overview, and screener — inspired by TradingView.',
  keywords: 'trading, charts, stock market, technical analysis, candlestick, watchlist',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="h-full">
        {children}
      </body>
    </html>
  )
}
