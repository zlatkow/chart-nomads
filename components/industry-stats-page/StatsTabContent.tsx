/* eslint-disable */

import CombinedPaymentChart from "./CombinedPaymentChart";
import MonthlyTransactionChart from "./MonthlyTransactionChart";
import CompanyTransactionCharts from "./CompanyTransactionCharts";
import MonthlyUniqueTradersChart from "./MonthlyUniqueTradersChart";
import MonthlyUniquePaidTradersChart from "./MonthlyUniquePaidTradersChart";
import ChurnRateChart from "./ChurnRateChart";
import HighEarnersChart from "./HighEarnersChart";
import PropFirmPayouts from "./PropFirmPayouts";
import AllTransactions from "./AllTransactions";
import HighEarnersLeaderboard from "./HighEarnersLeaderboard";

/** ✅ Define a proper type for payoutStats */
interface PayoutStat {
  amount: number;
  trader: string;
  company: string;
}

/** ✅ Define the main Stats interface */
interface Stats {
  monthlyTransactionStats?: any;
  companyTransactionStats?: any;
  payoutStats?: PayoutStat[]; // ✅ Correctly typed payout stats
  churnRate?: any;
  topPayouts?: any[];
  transactions?: any;
  topTraders?: any;
}

/** ✅ Define Props for the component */
interface StatsTabContentProps {
  activeTab: string;
  stats: Stats | null; // ✅ Ensure it's nullable if needed
}

const StatsTabContent = ({ activeTab, stats }: StatsTabContentProps) => {
  if (!stats) return null; // ✅ Early return for safety

  return (
    <div className="w-full">
      {/* ✅ Stats Tab */}
      {activeTab === "stats" && (
        <>
          {stats?.monthlyTransactionStats && (
            <MonthlyUniqueTradersChart uniqueTradersStats={stats.monthlyTransactionStats} />
          )}
          {stats?.companyTransactionStats && (
            <CompanyTransactionCharts companyStats={stats.companyTransactionStats} />
          )}
          {Array.isArray(stats?.payoutStats) && stats.payoutStats.length > 0 && (
            <HighEarnersChart payoutStats={stats.payoutStats} />
          )}
          {stats?.churnRate && <ChurnRateChart companyStats={stats.churnRate} />}
        </>
      )}

      {/* ✅ Transactions Tab */}
      {activeTab === "transactions" && (
        <>
          {stats?.monthlyTransactionStats && (
            <MonthlyTransactionChart monthlyStats={stats.monthlyTransactionStats} />
          )}
          {Array.isArray(stats?.topPayouts) && stats.topPayouts.length > 0 && (
            <PropFirmPayouts topPayouts={stats.topPayouts} />
          )}
          {stats?.transactions && <AllTransactions transactions={stats.transactions} />}
        </>
      )}

      {/* ✅ High Earners Tab */}
      {activeTab === "high-earners" && (
        <>
          {Array.isArray(stats?.topTraders) && stats.topTraders.length > 0 && (
            <HighEarnersLeaderboard topTraders={stats.topTraders} />
          )}
        </>
      )}
    </div>
  );
};

export default StatsTabContent;
