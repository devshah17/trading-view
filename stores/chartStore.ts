'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChartType, Timeframe, IndicatorConfig, Drawing, DrawingToolType } from '@/lib/market-data/types'

interface ChartPreferences {
  showVolume: boolean
  showGrid: boolean
  showCrosshair: boolean
  logScale: boolean
  autoScale: boolean
}

interface ChartState {
  selectedSymbol: string
  timeframe: Timeframe
  chartType: ChartType
  indicators: IndicatorConfig[]
  drawings: Drawing[]
  activeTool: DrawingToolType
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  isFullscreen: boolean
  preferences: ChartPreferences
  drawingHistory: Drawing[][]  // for undo/redo

  setSymbol: (symbol: string) => void
  setTimeframe: (tf: Timeframe) => void
  setChartType: (type: ChartType) => void
  addIndicator: (indicator: IndicatorConfig) => void
  removeIndicator: (id: string) => void
  updateIndicator: (id: string, updates: Partial<IndicatorConfig>) => void
  toggleIndicatorVisibility: (id: string) => void
  setActiveTool: (tool: DrawingToolType) => void
  addDrawing: (drawing: Drawing) => void
  removeDrawing: (id: string) => void
  undoDrawing: () => void
  clearDrawings: () => void
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  setFullscreen: (v: boolean) => void
  updatePreferences: (prefs: Partial<ChartPreferences>) => void
}

export const useChartStore = create<ChartState>()(
  persist(
    (set, get) => ({
      selectedSymbol: 'AAPL',
      timeframe: '1D',
      chartType: 'candlestick',
      indicators: [],
      drawings: [],
      activeTool: 'none',
      leftSidebarOpen: true,
      rightSidebarOpen: true,
      isFullscreen: false,
      drawingHistory: [],
      preferences: {
        showVolume: true,
        showGrid: true,
        showCrosshair: true,
        logScale: false,
        autoScale: true,
      },

      setSymbol: (symbol) => set({ selectedSymbol: symbol }),
      setTimeframe: (tf) => set({ timeframe: tf }),
      setChartType: (type) => set({ chartType: type }),

      addIndicator: (indicator) =>
        set(s => ({ indicators: [...s.indicators, indicator] })),

      removeIndicator: (id) =>
        set(s => ({ indicators: s.indicators.filter(i => i.id !== id) })),

      updateIndicator: (id, updates) =>
        set(s => ({
          indicators: s.indicators.map(i => i.id === id ? { ...i, ...updates } : i),
        })),

      toggleIndicatorVisibility: (id) =>
        set(s => ({
          indicators: s.indicators.map(i => i.id === id ? { ...i, visible: !i.visible } : i),
        })),

      setActiveTool: (tool) => set({ activeTool: tool }),

      addDrawing: (drawing) =>
        set(s => ({
          drawings: [...s.drawings, drawing],
          drawingHistory: [...s.drawingHistory, s.drawings],
        })),

      removeDrawing: (id) =>
        set(s => ({ drawings: s.drawings.filter(d => d.id !== id) })),

      undoDrawing: () => {
        const { drawingHistory } = get()
        if (drawingHistory.length === 0) return
        const prev = drawingHistory[drawingHistory.length - 1]
        set(s => ({
          drawings: prev,
          drawingHistory: s.drawingHistory.slice(0, -1),
        }))
      },

      clearDrawings: () => set({ drawings: [], drawingHistory: [] }),

      toggleLeftSidebar: () =>
        set(s => ({ leftSidebarOpen: !s.leftSidebarOpen })),

      toggleRightSidebar: () =>
        set(s => ({ rightSidebarOpen: !s.rightSidebarOpen })),

      setFullscreen: (v) => set({ isFullscreen: v }),

      updatePreferences: (prefs) =>
        set(s => ({ preferences: { ...s.preferences, ...prefs } })),
    }),
    {
      name: 'trading-chart-config',
      partialize: (s) => ({
        selectedSymbol: s.selectedSymbol,
        timeframe: s.timeframe,
        chartType: s.chartType,
        indicators: s.indicators,
        leftSidebarOpen: s.leftSidebarOpen,
        rightSidebarOpen: s.rightSidebarOpen,
        preferences: s.preferences,
      }),
    },
  ),
)
