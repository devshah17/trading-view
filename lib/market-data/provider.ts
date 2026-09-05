export interface MarketDataProvider {
  name: string
  isDemo: boolean
}

export const activeProvider: MarketDataProvider = {
  name: 'Yahoo Finance',
  isDemo: false,
}
