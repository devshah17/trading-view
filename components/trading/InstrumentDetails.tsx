'use client'

import { useChartStore } from '@/stores/chartStore'
import { useFundamentals } from '@/lib/market-data/fundamentals'

function formatNumber(num?: number, isCurrency = false, isPercent = false): string {
  if (num == null) return '-'
  if (isPercent) return (num * 100).toFixed(2) + '%'
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T'
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  return isCurrency ? num.toFixed(2) : num.toLocaleString()
}

export function InstrumentDetails() {
  const selectedSymbol = useChartStore(s => s.selectedSymbol)
  const { data, isLoading, error } = useFundamentals(selectedSymbol)

  if (isLoading) {
    return (
      <div className="instrument-details-container loading-skeleton">
        <div className="skeleton-pulse" style={{ height: '20px', width: '200px', marginBottom: '10px' }} />
        <div className="skeleton-pulse" style={{ height: '60px', width: '100%' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="instrument-details-container">
        <p style={{ color: 'var(--negative)' }}>Failed to load fundamentals.</p>
      </div>
    )
  }

  if (!data) {
    // If no data (e.g. for indices like NIFTY50), return nothing or empty state
    return null
  }

  const { assetProfile, summaryDetail, defaultKeyStatistics, financialData } = data

  return (
    <div className="instrument-details-container">
      <div className="details-grid">
        {/* Section 1: About */}
        <div className="details-section">
          <h3>About {selectedSymbol}</h3>
          <p className="business-summary">{assetProfile?.longBusinessSummary || 'No description available.'}</p>
          <div className="tags">
            {assetProfile?.sector && <span className="badge badge-type">{assetProfile.sector}</span>}
            {assetProfile?.industry && <span className="badge badge-type">{assetProfile.industry}</span>}
          </div>
          <div className="meta-info">
            {assetProfile?.fullTimeEmployees && <span>Employees: {formatNumber(assetProfile.fullTimeEmployees)}</span>}
            {assetProfile?.website && <a href={assetProfile.website} target="_blank" rel="noreferrer">Website</a>}
          </div>
        </div>

        {/* Section 2: Key Statistics */}
        <div className="details-section">
          <h3>Key Statistics</h3>
          <table className="stats-table">
            <tbody>
              <tr>
                <td>Market Cap</td>
                <td className="mono">{formatNumber(summaryDetail?.marketCap, true)}</td>
              </tr>
              <tr>
                <td>PE Ratio (TTM)</td>
                <td className="mono">{formatNumber(summaryDetail?.trailingPE)}</td>
              </tr>
              <tr>
                <td>EPS (Forward)</td>
                <td className="mono">{formatNumber(defaultKeyStatistics?.forwardPE)}</td>
              </tr>
              <tr>
                <td>Beta (5Y)</td>
                <td className="mono">{formatNumber(summaryDetail?.beta)}</td>
              </tr>
              <tr>
                <td>Dividend Yield</td>
                <td className="mono">{formatNumber(summaryDetail?.dividendYield, false, true)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Financials */}
        <div className="details-section">
          <h3>Financials</h3>
          <table className="stats-table">
            <tbody>
              <tr>
                <td>Total Revenue</td>
                <td className="mono">{formatNumber(financialData?.totalRevenue, true)}</td>
              </tr>
              <tr>
                <td>Total Cash</td>
                <td className="mono">{formatNumber(financialData?.totalCash, true)}</td>
              </tr>
              <tr>
                <td>Total Debt</td>
                <td className="mono">{formatNumber(financialData?.totalDebt, true)}</td>
              </tr>
              <tr>
                <td>Profit Margin</td>
                <td className="mono">{formatNumber(financialData?.profitMargins, false, true)}</td>
              </tr>
              <tr>
                <td>Operating Margin</td>
                <td className="mono">{formatNumber(financialData?.operatingMargins, false, true)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
