'use client'

import { useEffect, useRef, useState, useCallback, memo } from 'react'
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  BarSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type Time,
  type CandlestickData,
  type LineData,
  type HistogramData,
} from 'lightweight-charts'
import { useHistoricalData } from '@/hooks/useHistoricalData'
import { useMarketData } from '@/hooks/useMarketData'
import { useChartStore } from '@/stores/chartStore'
import type { Candle } from '@/lib/market-data/types'
import { Spinner } from '@/components/ui/Spinner'
import {
  calcSMA, calcEMA, calcBollingerBands, calcRSI, calcVWAP,
  type IndicatorPoint, type BollingerPoint,
} from '@/lib/market-data/indicators'

interface OHLCInfo {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  change: number
}

function formatTime(ts: number, intervalMinutes: number): string {
  const d = new Date(ts * 1000)
  if (intervalMinutes >= 1440) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  if (price >= 1) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return price.toFixed(5)
}

const CHART_OPTIONS = {
  layout: {
    background: { type: ColorType.Solid, color: '#0b0b0d' },
    textColor: '#9b9baa',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: 11,
  },
  grid: {
    vertLines: { color: 'rgba(255,255,255,0.03)' },
    horzLines: { color: 'rgba(255,255,255,0.03)' },
  },
  crosshair: {
    mode: CrosshairMode.Normal,
    vertLine: { color: 'rgba(255,255,255,0.25)', labelBackgroundColor: '#252530' },
    horzLine: { color: 'rgba(255,255,255,0.25)', labelBackgroundColor: '#252530' },
  },
  rightPriceScale: {
    borderColor: '#1e1e24',
    textColor: '#9b9baa',
  },
  timeScale: {
    borderColor: '#1e1e24',
    textColor: '#9b9baa',
    timeVisible: true,
    secondsVisible: false,
  },
}

export const TradingChart = memo(function TradingChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const barSeriesRef = useRef<ISeriesApi<'Bar'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const indicatorSeriesRef = useRef<ISeriesApi<'Line'>[]>([])
  const bbUpperRef = useRef<ISeriesApi<'Line'> | null>(null)
  const bbLowerRef = useRef<ISeriesApi<'Line'> | null>(null)

  const [ohlcInfo, setOhlcInfo] = useState<OHLCInfo | null>(null)

  const selectedSymbol = useChartStore(s => s.selectedSymbol)
  const timeframe = useChartStore(s => s.timeframe)
  const chartType = useChartStore(s => s.chartType)
  const indicators = useChartStore(s => s.indicators)
  const preferences = useChartStore(s => s.preferences)

  const { candles, isLoading, error } = useHistoricalData(selectedSymbol, timeframe)
  const liveQuote = useMarketData(selectedSymbol)

  // Determine interval minutes from timeframe
  const intervalMinutes = (() => {
    const map: Record<string, number> = {
      '1m': 1, '5m': 5, '10m': 10, '1H': 60,
      '1D': 1440, '1W': 10080, '1M': 43200,
      '6M': 1440, '1Y': 1440, '3Y': 10080, '5Y': 10080, '10Y': 43200, 'ALL': 43200,
    }
    return map[timeframe] ?? 1440
  })()

  // Create chart instance
  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      ...CHART_OPTIONS,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    })
    chartRef.current = chart

    // Candlestick (default)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26c281',
      downColor: '#e84040',
      borderUpColor: '#26c281',
      borderDownColor: '#e84040',
      wickUpColor: '#26c281',
      wickDownColor: '#e84040',
    })
    candleSeriesRef.current = candleSeries

    // Line
    const lineSeries = chart.addSeries(LineSeries, {
      color: '#4f8ef7',
      lineWidth: 2,
      visible: false,
    })
    lineSeriesRef.current = lineSeries

    // Area
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#4f8ef7',
      topColor: 'rgba(79,142,247,0.3)',
      bottomColor: 'rgba(79,142,247,0)',
      lineWidth: 2,
      visible: false,
    })
    areaSeriesRef.current = areaSeries

    // Bar
    const barSeries = chart.addSeries(BarSeries, {
      upColor: '#26c281',
      downColor: '#e84040',
      visible: false,
    })
    barSeriesRef.current = barSeries

    // Volume (separate pane)
    const volSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })
    volSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })
    volumeSeriesRef.current = volSeries

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.resize(containerRef.current.clientWidth, containerRef.current.clientHeight)
      }
    })
    ro.observe(containerRef.current)

    // Crosshair hover — update OHLC overlay
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) return
      const data = param.seriesData.get(candleSeries) as CandlestickData | undefined
      if (!data) return
      const ts = typeof param.time === 'number' ? param.time : 0
      const change = data.close - data.open
      setOhlcInfo({
        time: formatTime(ts, intervalMinutes),
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        volume: 0,
        change,
      })
    })

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update chart type visibility
  useEffect(() => {
    if (!chartRef.current) return
    candleSeriesRef.current?.applyOptions({ visible: chartType === 'candlestick' || chartType === 'hollow-candle' })
    lineSeriesRef.current?.applyOptions({ visible: chartType === 'line' })
    areaSeriesRef.current?.applyOptions({ visible: chartType === 'area' })
    barSeriesRef.current?.applyOptions({ visible: chartType === 'bar' })
    if (chartType === 'hollow-candle') {
      candleSeriesRef.current?.applyOptions({
        upColor: 'transparent',
        downColor: 'transparent',
        borderUpColor: '#26c281',
        borderDownColor: '#e84040',
      })
    } else if (chartType === 'candlestick') {
      candleSeriesRef.current?.applyOptions({
        upColor: '#26c281',
        downColor: '#e84040',
        borderUpColor: '#26c281',
        borderDownColor: '#e84040',
      })
    }
  }, [chartType])

  // Update volume visibility
  useEffect(() => {
    volumeSeriesRef.current?.applyOptions({ visible: preferences.showVolume })
  }, [preferences.showVolume])

  // Update price scale
  useEffect(() => {
    chartRef.current?.priceScale('right').applyOptions({ mode: preferences.logScale ? 1 : 0 })
  }, [preferences.logScale])

  // Load candle data
  useEffect(() => {
    if (!candles.length || !chartRef.current) return

    const candleData: CandlestickData[] = candles.map(c => ({
      time: c.timestamp as Time,
      open: c.open, high: c.high, low: c.low, close: c.close,
    }))
    const closeData: LineData[] = candles.map(c => ({ time: c.timestamp as Time, value: c.close }))
    const volData: HistogramData[] = candles.map(c => ({
      time: c.timestamp as Time,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(38,194,129,0.35)' : 'rgba(232,64,64,0.35)',
    }))

    candleSeriesRef.current?.setData(candleData)
    lineSeriesRef.current?.setData(closeData)
    areaSeriesRef.current?.setData(closeData)
    barSeriesRef.current?.setData(candleData)
    volumeSeriesRef.current?.setData(volData)

    chartRef.current.timeScale().fitContent()

    // Initialize OHLC info with latest candle
    const last = candles[candles.length - 1]
    if (last) {
      setOhlcInfo({
        time: formatTime(last.timestamp, intervalMinutes),
        open: last.open, high: last.high, low: last.low, close: last.close,
        volume: last.volume, change: last.close - last.open,
      })
    }
  }, [candles, intervalMinutes])

  // Update last candle with live tick
  useEffect(() => {
    if (!liveQuote || !candleSeriesRef.current || !candles.length) return
    const last = candles[candles.length - 1]
    if (!last) return

    const updatedCandle: CandlestickData = {
      time: last.timestamp as Time,
      open: last.open,
      high: Math.max(last.high, liveQuote.price),
      low: Math.min(last.low, liveQuote.price),
      close: liveQuote.price,
    }
    candleSeriesRef.current.update(updatedCandle)
    lineSeriesRef.current?.update({ time: last.timestamp as Time, value: liveQuote.price })
    areaSeriesRef.current?.update({ time: last.timestamp as Time, value: liveQuote.price })
  }, [liveQuote, candles])

  // Render indicators
  useEffect(() => {
    if (!chartRef.current || !candles.length) return

    // Remove old indicator series
    indicatorSeriesRef.current.forEach(s => { try { chartRef.current?.removeSeries(s) } catch {} })
    indicatorSeriesRef.current = []
    if (bbUpperRef.current) { try { chartRef.current.removeSeries(bbUpperRef.current) } catch {} bbUpperRef.current = null }
    if (bbLowerRef.current) { try { chartRef.current.removeSeries(bbLowerRef.current) } catch {} bbLowerRef.current = null }

    const COLORS = ['#4f8ef7', '#f0a020', '#8b5cf6', '#26c281', '#e84040', '#06b6d4']
    let colorIdx = 0

    indicators.filter(ind => ind.visible).forEach(ind => {
      const color = ind.color ?? COLORS[colorIdx++ % COLORS.length]
      try {
        if (ind.type === 'SMA') {
          const pts = calcSMA(candles, ind.period ?? 20)
          const s = chartRef.current!.addSeries(LineSeries, { color, lineWidth: 1, lastValueVisible: false, priceLineVisible: false })
          s.setData(pts.map(p => ({ time: p.timestamp as Time, value: p.value })))
          indicatorSeriesRef.current.push(s)
        } else if (ind.type === 'EMA') {
          const pts = calcEMA(candles, ind.period ?? 20)
          const s = chartRef.current!.addSeries(LineSeries, { color, lineWidth: 1, lastValueVisible: false, priceLineVisible: false })
          s.setData(pts.map(p => ({ time: p.timestamp as Time, value: p.value })))
          indicatorSeriesRef.current.push(s)
        } else if (ind.type === 'VWAP') {
          const pts = calcVWAP(candles)
          const s = chartRef.current!.addSeries(LineSeries, { color, lineWidth: 1, lineStyle: 2, lastValueVisible: false, priceLineVisible: false })
          s.setData(pts.map(p => ({ time: p.timestamp as Time, value: p.value })))
          indicatorSeriesRef.current.push(s)
        } else if (ind.type === 'BB') {
          const pts = calcBollingerBands(candles, ind.period ?? 20)
          const upper = chartRef.current!.addSeries(LineSeries, { color, lineWidth: 1, lineStyle: 2, lastValueVisible: false, priceLineVisible: false })
          const middle = chartRef.current!.addSeries(LineSeries, { color, lineWidth: 1, lastValueVisible: false, priceLineVisible: false })
          const lower = chartRef.current!.addSeries(LineSeries, { color, lineWidth: 1, lineStyle: 2, lastValueVisible: false, priceLineVisible: false })
          upper.setData(pts.map(p => ({ time: p.timestamp as Time, value: p.upper })))
          middle.setData(pts.map(p => ({ time: p.timestamp as Time, value: p.middle })))
          lower.setData(pts.map(p => ({ time: p.timestamp as Time, value: p.lower })))
          indicatorSeriesRef.current.push(upper, middle, lower)
          bbUpperRef.current = upper
          bbLowerRef.current = lower
        }
      } catch {}
    })
  }, [indicators, candles])

  return (
    <div className="chart-container" id="chart-container">
      {/* OHLC floating overlay */}
      {ohlcInfo && (
        <div className="chart-ohlc-overlay" aria-label="OHLC data">
          <span><span className="ohlc-label">O</span><span className="ohlc-val">{formatPrice(ohlcInfo.open)}</span></span>
          <span><span className="ohlc-label">H</span><span className="ohlc-val">{formatPrice(ohlcInfo.high)}</span></span>
          <span><span className="ohlc-label">L</span><span className="ohlc-val">{formatPrice(ohlcInfo.low)}</span></span>
          <span><span className="ohlc-label">C</span><span className="ohlc-val" style={{ color: ohlcInfo.change >= 0 ? 'var(--positive)' : 'var(--negative)' }}>{formatPrice(ohlcInfo.close)}</span></span>
          <span className={ohlcInfo.change >= 0 ? 'positive' : 'negative'}>
            {ohlcInfo.change >= 0 ? '+' : ''}{formatPrice(ohlcInfo.change)}
          </span>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="chart-loading">
          <Spinner size={24} />
          <span className="chart-empty-msg">Loading chart data...</span>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="chart-loading">
          <span className="chart-empty-msg" style={{ color: 'var(--negative)' }}>Failed to load chart data</span>
        </div>
      )}

      {/* Canvas */}
      <div ref={containerRef} className="chart-canvas-wrapper" id="chart-canvas" />
    </div>
  )
})
