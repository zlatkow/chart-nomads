"use client"

import { useEffect } from "react"
import CombinedPaymentChart from "./CombinedPaymentChart"
import MonthlyTransactionChart from "./MonthlyTransactionChart"
import CompanyTransactionCharts from "./CompanyTransactionCharts"
import MonthlyUniqueTradersChart from "./MonthlyUniqueTradersChart"
import MonthlyUniquePaidTradersChart from "./MonthlyUniquePaidTradersChart"
import ChurnRateChart from "./ChurnRateChart"
import HighEarnersChart from "./HighEarnersChart"
import PropFirmPayouts from "./PropFirmPayouts"
import AllTransactions from "./AllTransactions"
import HighEarnersLeaderboard from "./HighEarnersLeaderboard"

// Add the shimmer animation CSS
const shimmerAnimation = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.shimmer-effect {
  position: relative;
  overflow: hidden;
  background-color: #222;
}

.shimmer-effect::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(34, 34, 34, 0) 0,
    rgba(34, 34, 34, 0.2) 20%,
    rgba(237, 185, 0, 0.15) 60%,
    rgba(34, 34, 34, 0)
  );
  animation: shimmer 2s infinite;
}
`

// ✅ Define type based on your screenshot
interface PayoutStat {
  category: string
  count: number
  percentage: number
  total_unique_traders: number
  category_type: string
}

interface Stats {
  monthlyTransactionStats?: any
  companyTransactionStats?: any
  payoutStats?: PayoutStat[] // ✅ Use the correct type
  churnRate?: any
  topPayouts?: any[]
  transactions?: any
  topTraders?: any
}

interface StatsTabContentProps {
  activeTab: string
  stats: Stats | null
}

const StatsTabContent = ({ activeTab, stats }: StatsTabContentProps) => {
  // Add the shimmer animation to the document
  useEffect(() => {
    if (typeof document !== "undefined") {
      const style = document.createElement("style")
      style.textContent = shimmerAnimation
      document.head.appendChild(style)

      return () => {
        document.head.removeChild(style)
      }
    }
  }, [])

  // Skeleton loaders for different chart types
  const renderChartSkeleton = (height = "h-64") => (
    <div className={`w-full ${height} bg-[#1a1a1a] rounded-[10px] border border-[#2a2a2a] p-6 mb-6`}>
      <div className="h-6 w-48 bg-[#222] rounded shimmer-effect mb-4"></div>
      <div className="h-4 w-64 bg-[#222] rounded shimmer-effect mb-8"></div>
      <div className="h-32 w-full bg-[#222] rounded shimmer-effect"></div>
    </div>
  )

  const renderTableSkeleton = () => (
    <div className="w-full bg-[#1a1a1a] rounded-[10px] border border-[#2a2a2a] p-6 mb-6">
      <div className="h-6 w-48 bg-[#222] rounded shimmer-effect mb-4"></div>
      <div className="h-8 w-full bg-[#222] rounded shimmer-effect mb-3"></div>
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <div key={`row-${index}`} className="h-10 w-full bg-[#222] rounded shimmer-effect mb-2"></div>
        ))}
    </div>
  )

  // If stats is null, show skeleton loaders based on the active tab
  if (!stats) {
    return (
      <div className="w-full">
        {activeTab === "stats" && (
          <>
            {renderChartSkeleton()}
            {renderChartSkeleton()}
            {renderChartSkeleton()}
            {renderChartSkeleton()}
            {renderChartSkeleton()}
            {renderChartSkeleton()}
          </>
        )}

        {activeTab === "transactions" && (
          <>
            {renderChartSkeleton()}
            {renderTableSkeleton()}
            {renderTableSkeleton()}
          </>
        )}

        {activeTab === "high-earners" && <>{renderTableSkeleton()}</>}
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* ✅ Keep all content inside the same JSX block */}
      {activeTab === "stats" && (
        <>
          {stats?.monthlyTransactionStats && <CombinedPaymentChart monthlyStats={stats.monthlyTransactionStats} />}
          {stats?.monthlyTransactionStats && (
            <MonthlyUniquePaidTradersChart uniquePaidTradersStats={stats.monthlyTransactionStats} />
          )}
          {stats?.monthlyTransactionStats && (
            <MonthlyUniqueTradersChart uniqueTradersStats={stats.monthlyTransactionStats} />
          )}
          {stats?.companyTransactionStats && <CompanyTransactionCharts companyStats={stats.companyTransactionStats} />}
          {Array.isArray(stats?.payoutStats) && stats.payoutStats.length > 0 && (
            <HighEarnersChart payoutStats={stats.payoutStats} />
          )}
          {stats?.churnRate && <ChurnRateChart companyStats={stats.churnRate} />}
        </>
      )}

      {activeTab === "transactions" && (
        <>
          {stats?.monthlyTransactionStats && <MonthlyTransactionChart monthlyStats={stats.monthlyTransactionStats} />}
          {stats?.topPayouts && stats.topPayouts.length > 0 && <PropFirmPayouts topPayouts={stats.topPayouts} />}
          {stats?.transactions && <AllTransactions transactions={stats.transactions} />}
        </>
      )}

      {activeTab === "high-earners" && (
        <>{stats?.topTraders && <HighEarnersLeaderboard topTraders={stats.topTraders} />}</>
      )}
    </div>
  )
}

export default StatsTabContent

