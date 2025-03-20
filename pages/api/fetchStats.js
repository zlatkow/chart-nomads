import { createClient } from "@supabase/supabase-js";

// ✅ Initialize Supabase (only on the backend)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {

    // ✅ Fetch all stats in parallel
    const [
      payoutStats,
      companyTransactionStats,
      monthlyTransactionStats,
      allTransactions,
      transactions24h,
      transactions7d,
      transactions30d,
      topPayouts,
      transactions,
      churnRate,
      topTraders
    ] = await Promise.all([
      supabase.rpc("get_combined_payout_stats"),
      supabase.rpc("get_company_transaction_stats"),
      supabase.rpc("get_monthly_combined_transaction_stats"),
      supabase.rpc("get_combined_transaction_stats", { period: "all" }),
      supabase.rpc("get_combined_transaction_stats", { period: "24h" }),
      supabase.rpc("get_combined_transaction_stats", { period: "7d" }),
      supabase.rpc("get_combined_transaction_stats", { period: "30d" }),
      supabase.rpc("get_top_10_payouts_across_industry", { timefilter: "all" }), // ✅ Fetch payouts!
      supabase.rpc("print_all_transactions", { timefilter: "all", limitrows: 10, offsetrows: 0 }), // ✅ Fetch transactions
      supabase.rpc("calculate_churn_rate"),
      supabase.rpc("fetch_top_traders")
    ]);

    // ✅ Check for any Supabase errors
    if (
      payoutStats.error || 
      companyTransactionStats.error || 
      monthlyTransactionStats.error || 
      allTransactions.error ||
      transactions24h.error ||
      transactions7d.error ||
      transactions30d.error ||
      topPayouts.error ||
      transactions.error ||
      churnRate.error ||
      topTraders.error 
    ) {
      return res.status(500).json({ error: "Error fetching data from Supabase" });
    }

    // ✅ Send JSON response
    return res.status(200).json({
      payoutStats: payoutStats.data || [],
      companyTransactionStats: companyTransactionStats.data || [],
      monthlyTransactionStats: monthlyTransactionStats.data || [],
      allTransactions: allTransactions.data || [],
      transactions24h: transactions24h.data || [],
      transactions7d: transactions7d.data || [],
      transactions30d: transactions30d.data || [],
      topPayouts: topPayouts.data || [],
      transactions: transactions.data || [],
      churnRate: churnRate.data || [],
      topTraders: topTraders.data || []
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
