'use client'
import type { ReactNode } from 'react'
export function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  return (
    <div className="tooltip-wrapper">
      {children}
      {content && <div className="tooltip-content">{content}</div>}
    </div>
  )
}
