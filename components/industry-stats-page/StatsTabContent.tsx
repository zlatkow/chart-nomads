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

interface Stats {
  monthlyTransactionStats?: any;
  companyTransactionStats?: any;
  payoutStats?: any[];
  churnRate?: any;
  topPayouts?: any[];  // ✅ Ensure this exists in the type definition
  transactions?: any;
  topTraders?: any;
}

interface StatsTabContentProps {
  activeTab: string;
  stats: Stats | null; // ✅ Ensure it's nullable if needed
}

const StatsTabContent = ({ activeTab, stats }: StatsTabContentProps) => {
  if (!stats) return null;

  return (
    <div className="w-full">
      {activeTab === "stats" && (
        <>
          {stats?.monthlyTransactionStats && <CombinedPaymentChart monthlyStats={stats.monthlyTransactionStats} />}
          {stats?.monthlyTransactionStats && <MonthlyUniquePaidTradersChart uniquePaidTradersStats={stats.monthlyTransactionStats} />}
          {stats?.monthlyTransactionStats && <MonthlyUniqueTradersChart uniqueTradersStats={stats.monthlyTransactionStats} />}
          {stats?.companyTransactionStats && <CompanyTransactionCharts companyStats={stats.companyTransactionStats} />}
          {stats?.payoutStats && stats.payoutStats.length > 0 && <HighEarnersChart payoutStats={stats.payoutStats} />}
          {stats?.churnRate && <ChurnRateChart companyStats={stats.churnRate} />}
        </>
      )}

      {activeTab === "transactions" && (
        <>
          {stats?.monthlyTransactionStats && <MonthlyTransactionChart monthlyStats={stats.monthlyTransactionStats} />}
          {stats?.topPayouts && stats.topPayouts.length > 0 && <PropFirmPayouts topPayouts={stats.topPayouts} />}  {/* ✅ No more TypeScript error */}
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


