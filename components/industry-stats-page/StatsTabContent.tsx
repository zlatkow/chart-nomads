/* eslint-disable */

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

// The rest of your StatsTabContent.tsx file remains unchanged

// ✅ Define type based on your screenshot
interface PayoutStat {
  category: string;
  count: number;
  percentage: number;
  total_unique_traders: number;
  category_type: string;
}

interface Stats {
  monthlyTransactionStats?: any;
  companyTransactionStats?: any;
  payoutStats?: PayoutStat[]; // ✅ Use the correct type
  churnRate?: any;
  topPayouts?: any[];
  transactions?: any;
  topTraders?: any;
}

interface StatsTabContentProps {
  activeTab: string;
  stats: Stats | null;
}

const StatsTabContent = ({ activeTab, stats }: StatsTabContentProps) => {
  if (!stats) return null;

  return (
    <div className="w-full">
      {/* ✅ Keep all content inside the same JSX block */}
      {activeTab === "stats" && (
        <>
           {stats?.monthlyTransactionStats && <CombinedPaymentChart monthlyStats={stats.monthlyTransactionStats} />}
           {stats?.monthlyTransactionStats && <MonthlyUniquePaidTradersChart uniquePaidTradersStats={stats.monthlyTransactionStats} />}
           {stats?.monthlyTransactionStats && <MonthlyUniqueTradersChart uniqueTradersStats={stats.monthlyTransactionStats} />}
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
        <>
          {stats?.topTraders && <HighEarnersLeaderboard topTraders={stats.topTraders} />}
        </>
      )}
    </div>
  );
};

export default StatsTabContent;
