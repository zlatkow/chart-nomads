/* eslint-disable */

import CompanyCombinedPaymentChart from "./CompanyCombinedPaymentChart"
import CompanyMonthlyTransactionChart from "./CompanyMonthlyTransactionChart"
import CompanyMonthlyUniqueTradersChart from "./CompanyMonthlyUniqueTradersChart"
import CompanyMonthlyUniquePaidTradersChart from "./CompanyMonthlyUniquePaidTradersChart"
import CompanyChurnRateChart from "./CompanyChurnRateChart"
import CompanyHighEarnersChart from "./CompanyHighEarnersChart"
import CompanyTopPayouts from "./CompanyTopPayouts"
import CompanyAllTransactions from "./CompanyAllTransactions"
import CompanyHighEarnersLeaderboard from "./CompanyHighEarnersLeaderboard"

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
          <CompanyCombinedPaymentChart companyName={companyName} />
          <CompanyMonthlyUniquePaidTradersChart companyName={companyName} />
          <CompanyMonthlyUniqueTradersChart companyName={companyName} />
          <CompanyHighEarnersChart companyName={companyName} />
          <CompanyChurnRateChart companyName={companyName} />
        </>
      )}

      {activeTab === "transactions" && (
        <>
          <CompanyMonthlyTransactionChart companyName={companyName} />
          <CompanyTopPayouts companyName={companyName} />
          <CompanyAllTransactions companyName={companyName} />
        </>
      )}

      {activeTab === "high-earners" && (
        <CompanyHighEarnersLeaderboard companyName={companyName} />
      )}
    </div>
  )
}

export default CompanyStatsTabContent

