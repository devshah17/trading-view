'use client'
import { TrendingUp, TrendingDown } from 'lucide-react'
interface PriceChangeProps {
  change: number
  changePercent: number
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}
export function PriceChange({ change, changePercent, showIcon = false, size = 'md' }: PriceChangeProps) {
  const isPositive = change >= 0
  const cls = isPositive ? 'positive' : 'negative'
  const sign = isPositive ? '+' : ''
  const sizeClass = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'
  const Icon = isPositive ? TrendingUp : TrendingDown
  return (
    <span className={`${cls} ${sizeClass} flex items-center gap-1 mono`}>
      {showIcon && <Icon size={12} />}
      {sign}{change.toFixed(2)} ({sign}{changePercent.toFixed(2)}%)
    </span>
  )
}
