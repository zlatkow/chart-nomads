/* eslint-disable */

import CompanyCombinedPaymentChart from "./CompanyCombinedPaymentChart"
import MonthlyTransactionChart from "./MonthlyTransactionChart"
import MonthlyUniqueTradersChart from "./MonthlyUniqueTradersChart"
import CompanyMonthlyUniquePaidTradersChart from "./CompanyMonthlyUniquePaidTradersChart"
import ChurnRateChart from "./ChurnRateChart"
import HighEarnersChart from "./HighEarnersChart"
import PropFirmPayouts from "./PropFirmPayouts"
import AllTransactions from "./AllTransactions"
import HighEarnersLeaderboard from "./HighEarnersLeaderboard"

// Define type based on your screenshot
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
  payoutStats?: PayoutStat[]
  churnRate?: any
  topPayouts?: any[]
  transactions?: any
  topTraders?: any
}

interface StatsTabContentProps {
  activeTab: string
  stats: Stats | null
  companyName: string // Company name prop
}

const CompanyStatsTabContent = ({ activeTab, stats, companyName }: StatsTabContentProps) => {
  console.log("CompanyStatsTabContent received company name:", companyName)

  return (
    <div className="w-full">
      {activeTab === "stats" && (
        <>
          {/* Pass only the company name to the chart component */}
          <CompanyCombinedPaymentChart companyName={companyName} />
          <CompanyMonthlyUniquePaidTradersChart companyName={companyName} />

          {/* Only render these if stats is available */}
          {stats && (
            <>
              {stats.monthlyTransactionStats && (
                <MonthlyUniqueTradersChart uniqueTradersStats={stats.monthlyTransactionStats} />
              )}
              {Array.isArray(stats.payoutStats) && stats.payoutStats.length > 0 && (
                <HighEarnersChart payoutStats={stats.payoutStats} />
              )}
              {stats.churnRate && <ChurnRateChart companyStats={stats.churnRate} />}
            </>
          )}
        </>
      )}

      {activeTab === "transactions" && stats && (
        <>
          {stats.monthlyTransactionStats && <MonthlyTransactionChart monthlyStats={stats.monthlyTransactionStats} />}
          {stats.topPayouts && stats.topPayouts.length > 0 && <PropFirmPayouts topPayouts={stats.topPayouts} />}
          {stats.transactions && <AllTransactions transactions={stats.transactions} />}
        </>
      )}

      {activeTab === "high-earners" && stats && (
        <>{stats.topTraders && <HighEarnersLeaderboard topTraders={stats.topTraders} />}</>
      )}
    </div>
  )
}

export default CompanyStatsTabContent

