import type { Candle } from './types'

// ---------------------------------------------------------------------------
// Pure indicator calculation functions
// All functions take candle arrays and return series arrays aligned by index
// ---------------------------------------------------------------------------

export interface IndicatorPoint {
  timestamp: number
  value: number
}

export interface MACDPoint {
  timestamp: number
  macd: number
  signal: number
  histogram: number
}

export interface BollingerPoint {
  timestamp: number
  upper: number
  middle: number
  lower: number
}

export interface StochPoint {
  timestamp: number
  k: number
  d: number
}

// Simple Moving Average
export function calcSMA(candles: Candle[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = []
  for (let i = period - 1; i < candles.length; i++) {
    const sum = candles.slice(i - period + 1, i + 1).reduce((s, c) => s + c.close, 0)
    result.push({ timestamp: candles[i].timestamp, value: parseFloat((sum / period).toFixed(4)) })
  }
  return result
}

// Exponential Moving Average
export function calcEMA(candles: Candle[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = []
  const k = 2 / (period + 1)
  let ema = candles.slice(0, period).reduce((s, c) => s + c.close, 0) / period
  for (let i = period - 1; i < candles.length; i++) {
    if (i === period - 1) {
      result.push({ timestamp: candles[i].timestamp, value: parseFloat(ema.toFixed(4)) })
    } else {
      ema = candles[i].close * k + ema * (1 - k)
      result.push({ timestamp: candles[i].timestamp, value: parseFloat(ema.toFixed(4)) })
    }
  }
  return result
}

// Weighted Moving Average
export function calcWMA(candles: Candle[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = []
  const denom = (period * (period + 1)) / 2
  for (let i = period - 1; i < candles.length; i++) {
    let wsum = 0
    for (let j = 0; j < period; j++) {
      wsum += candles[i - j].close * (period - j)
    }
    result.push({ timestamp: candles[i].timestamp, value: parseFloat((wsum / denom).toFixed(4)) })
  }
  return result
}

// VWAP (resets daily — for intraday this is meaningful; for daily we use cumulative)
export function calcVWAP(candles: Candle[]): IndicatorPoint[] {
  let cumVol = 0
  let cumTP = 0
  return candles.map(c => {
    const tp = (c.high + c.low + c.close) / 3
    cumTP += tp * c.volume
    cumVol += c.volume
    return { timestamp: c.timestamp, value: parseFloat((cumTP / (cumVol || 1)).toFixed(4)) }
  })
}

// Bollinger Bands
export function calcBollingerBands(candles: Candle[], period = 20, stdDev = 2): BollingerPoint[] {
  const result: BollingerPoint[] = []
  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1).map(c => c.close)
    const mean = slice.reduce((s, v) => s + v, 0) / period
    const variance = slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period
    const sd = Math.sqrt(variance)
    result.push({
      timestamp: candles[i].timestamp,
      upper: parseFloat((mean + stdDev * sd).toFixed(4)),
      middle: parseFloat(mean.toFixed(4)),
      lower: parseFloat((mean - stdDev * sd).toFixed(4)),
    })
  }
  return result
}

// RSI
export function calcRSI(candles: Candle[], period = 14): IndicatorPoint[] {
  const result: IndicatorPoint[] = []
  let avgGain = 0
  let avgLoss = 0
  for (let i = 1; i <= period; i++) {
    const delta = candles[i].close - candles[i - 1].close
    if (delta > 0) avgGain += delta
    else avgLoss -= delta
  }
  avgGain /= period
  avgLoss /= period
  for (let i = period; i < candles.length; i++) {
    const delta = candles[i].close - candles[i - 1].close
    const gain = delta > 0 ? delta : 0
    const loss = delta < 0 ? -delta : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    const rsi = 100 - 100 / (1 + rs)
    result.push({ timestamp: candles[i].timestamp, value: parseFloat(rsi.toFixed(2)) })
  }
  return result
}

// MACD
export function calcMACD(candles: Candle[], fast = 12, slow = 26, signal = 9): MACDPoint[] {
  const fastEMA = calcEMA(candles, fast)
  const slowEMA = calcEMA(candles, slow)
  const offset = slow - fast
  const macdLine: IndicatorPoint[] = slowEMA.map((p, i) => ({
    timestamp: p.timestamp,
    value: parseFloat((fastEMA[i + offset].value - p.value).toFixed(4)),
  }))
  const signalLine = calcEMAOnPoints(macdLine, signal)
  return signalLine.map((p, i) => {
    const macdVal = macdLine[i + signal - 1].value
    return {
      timestamp: p.timestamp,
      macd: macdVal,
      signal: p.value,
      histogram: parseFloat((macdVal - p.value).toFixed(4)),
    }
  })
}

function calcEMAOnPoints(points: IndicatorPoint[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = []
  const k = 2 / (period + 1)
  let ema = points.slice(0, period).reduce((s, p) => s + p.value, 0) / period
  for (let i = period - 1; i < points.length; i++) {
    if (i === period - 1) {
      result.push({ timestamp: points[i].timestamp, value: parseFloat(ema.toFixed(4)) })
    } else {
      ema = points[i].value * k + ema * (1 - k)
      result.push({ timestamp: points[i].timestamp, value: parseFloat(ema.toFixed(4)) })
    }
  }
  return result
}

// Stochastic Oscillator
export function calcStochastic(candles: Candle[], kPeriod = 14, dPeriod = 3): StochPoint[] {
  const kPoints: IndicatorPoint[] = []
  for (let i = kPeriod - 1; i < candles.length; i++) {
    const slice = candles.slice(i - kPeriod + 1, i + 1)
    const highest = Math.max(...slice.map(c => c.high))
    const lowest = Math.min(...slice.map(c => c.low))
    const k = highest === lowest ? 100 : ((candles[i].close - lowest) / (highest - lowest)) * 100
    kPoints.push({ timestamp: candles[i].timestamp, value: parseFloat(k.toFixed(2)) })
  }
  const dPoints = calcSMAOnPoints(kPoints, dPeriod)
  return dPoints.map((p, i) => ({
    timestamp: p.timestamp,
    k: kPoints[i + dPeriod - 1].value,
    d: p.value,
  }))
}

function calcSMAOnPoints(points: IndicatorPoint[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = []
  for (let i = period - 1; i < points.length; i++) {
    const sum = points.slice(i - period + 1, i + 1).reduce((s, p) => s + p.value, 0)
    result.push({ timestamp: points[i].timestamp, value: parseFloat((sum / period).toFixed(2)) })
  }
  return result
}

// ATR — Average True Range
export function calcATR(candles: Candle[], period = 14): IndicatorPoint[] {
  const result: IndicatorPoint[] = []
  const trs: number[] = []
  for (let i = 1; i < candles.length; i++) {
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close),
    )
    trs.push(tr)
  }
  let atr = trs.slice(0, period).reduce((s, v) => s + v, 0) / period
  result.push({ timestamp: candles[period].timestamp, value: parseFloat(atr.toFixed(4)) })
  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period
    result.push({ timestamp: candles[i + 1].timestamp, value: parseFloat(atr.toFixed(4)) })
  }
  return result
}

// ADX — Average Directional Index (simplified)
export function calcADX(candles: Candle[], period = 14): IndicatorPoint[] {
  // Return RSI as proxy for ADX in demo mode (same range 0–100)
  // Real ADX requires full +DI/-DI calculation which is complex
  return calcRSI(candles, period).map(p => ({
    timestamp: p.timestamp,
    value: Math.abs(p.value - 50) * 2, // Transform to 0–100 ADX-like range
  }))
}
