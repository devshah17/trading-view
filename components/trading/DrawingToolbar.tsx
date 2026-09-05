'use client'
import {
  TrendingUp, Minus, AlignCenter, Triangle, Square,
  GitBranch, Type, Ruler, RotateCcw, Redo, Trash2
} from 'lucide-react'
import { useChartStore } from '@/stores/chartStore'
import { Tooltip } from '@/components/ui/Tooltip'
import type { DrawingToolType } from '@/lib/market-data/types'

const TOOLS: { tool: DrawingToolType; label: string; Icon: React.ElementType }[] = [
  { tool: 'trendline',       label: 'Trend Line',           Icon: TrendingUp },
  { tool: 'hline',           label: 'Horizontal Line',      Icon: Minus },
  { tool: 'vline',           label: 'Vertical Line',        Icon: AlignCenter },
  { tool: 'rectangle',       label: 'Rectangle',            Icon: Square },
  { tool: 'fib-retracement', label: 'Fibonacci Retracement',Icon: GitBranch },
  { tool: 'text',            label: 'Text Annotation',      Icon: Type },
  { tool: 'measure',         label: 'Measure Tool',         Icon: Ruler },
]

export function DrawingToolbar() {
  const activeTool = useChartStore(s => s.activeTool)
  const setActiveTool = useChartStore(s => s.setActiveTool)
  const undoDrawing = useChartStore(s => s.undoDrawing)
  const clearDrawings = useChartStore(s => s.clearDrawings)
  const drawingHistory = useChartStore(s => s.drawingHistory)

  return (
    <div className="drawing-toolbar" role="toolbar" aria-label="Drawing tools">
      {TOOLS.map(({ tool, label, Icon }) => (
        <Tooltip key={tool} content={label}>
          <button
            id={`draw-${tool}`}
            className={`drawing-btn ${activeTool === tool ? 'active' : ''}`}
            onClick={() => setActiveTool(activeTool === tool ? 'none' : tool)}
            aria-label={label}
            aria-pressed={activeTool === tool}
          >
            <Icon size={13} />
          </button>
        </Tooltip>
      ))}

      {/* Separator */}
      <div style={{ width: '80%', height: 1, background: 'var(--border-subtle)', margin: '4px auto' }} />

      <Tooltip content="Undo">
        <button
          className="drawing-btn"
          onClick={undoDrawing}
          disabled={drawingHistory.length === 0}
          aria-label="Undo drawing"
          style={{ opacity: drawingHistory.length === 0 ? 0.3 : 1 }}
        >
          <RotateCcw size={12} />
        </button>
      </Tooltip>

      <Tooltip content="Clear All Drawings">
        <button
          className="drawing-btn"
          style={{ color: 'var(--negative)' }}
          onClick={clearDrawings}
          aria-label="Clear all drawings"
        >
          <Trash2 size={12} />
        </button>
      </Tooltip>
    </div>
  )
}
