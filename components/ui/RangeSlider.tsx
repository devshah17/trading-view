'use client'
interface RangeSliderProps {
  low: number
  high: number
  current: number
  formatValue?: (v: number) => string
}
export function RangeSlider({ low, high, current, formatValue }: RangeSliderProps) {
  const pct = high === low ? 50 : Math.max(0, Math.min(100, ((current - low) / (high - low)) * 100))
  const fmt = formatValue ?? ((v: number) => v.toLocaleString())
  return (
    <div>
      <div className="range-track">
        <div className="range-fill" style={{ width: `${pct}%` }} />
        <div className="range-dot" style={{ left: `${pct}%` }} />
      </div>
      <div className="range-labels">
        <span>{fmt(low)}</span>
        <span>{fmt(high)}</span>
      </div>
    </div>
  )
}
