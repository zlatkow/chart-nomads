import { createClient } from "@supabase/supabase-js"
import type { NextApiRequest, NextApiResponse } from "next"

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "")

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const company = req.query.company as string

    if (!company) {
      return res.status(400).json({ error: "Missing 'company' query parameter" })
    }

    console.log(`[API] Fetching stats for company: ${company}`)

    // Call the function with the exact parameter names from your SQL definition
    const [stats24h, stats7d, stats30d, statsAll] = await Promise.all([
      supabase.rpc("get_transaction_stats_by_company", {
        input_propfirm_name: company,
        input_period: "24h",
      }),
      supabase.rpc("get_transaction_stats_by_company", {
        input_propfirm_name: company,
        input_period: "7d",
      }),
      supabase.rpc("get_transaction_stats_by_company", {
        input_propfirm_name: company,
        input_period: "30d",
      }),
      supabase.rpc("get_transaction_stats_by_company", {
        input_propfirm_name: company,
        input_period: "all",
      }),
    ])

    // Log the results for debugging
    console.log("[API] 24h stats data:", stats24h.data)
    console.log("[API] 24h stats error:", stats24h.error)
    console.log("[API] 7d stats data:", stats7d.data)
    console.log("[API] 7d stats error:", stats7d.error)
    console.log("[API] 30d stats data:", stats30d.data)
    console.log("[API] 30d stats error:", stats30d.error)
    console.log("[API] all stats data:", statsAll.data)
    console.log("[API] all stats error:", statsAll.error)

    if (stats24h.error || stats7d.error || stats30d.error || statsAll.error) {
      console.error("[API] One or more Supabase errors:", {
        stats24h: stats24h.error,
        stats7d: stats7d.error,
        stats30d: stats30d.error,
        statsAll: statsAll.error,
      })

      return res.status(500).json({
        error: "Error fetching data from stored procedure",
        details: {
          stats24h: stats24h.error,
          stats7d: stats7d.error,
          stats30d: stats30d.error,
          statsAll: statsAll.error,
        },
      })
    }

    // Map the column names from your SQL function to the expected format
    const mapData = (data) => {
      if (!data || !data[0]) return null

      return {
        total_amount: data[0].totalamount || 0,
        total_amount_change: data[0].totalamountchange || "0%",
        total_transactions: data[0].totaltransactions || 0,
        total_transactions_change: data[0].totaltransactionschange || "0%",
        unique_traders: data[0].uniquetraders || 0,
        unique_traders_change: data[0].uniquetraderschange || "0%",
        average_payout: data[0].averagepayout || 0,
        average_payout_change: "0%", // Not provided by your function
        largest_payout: data[0].largestpayout || 0,
        largest_payout_change: "0%", // Not provided by your function
        avg_transactions_per_trader: data[0].avgtransactionspertrader || 0,
        avg_transactions_per_trader_change: "0%", // Not provided by your function
        time_since_last_transaction: data[0].timesincelasttransaction || "No data",
      }
    }

    // Return the data with mapped column names
    return res.status(200).json({
      "24h": mapData(stats24h.data),
      "7d": mapData(stats7d.data),
      "30d": mapData(stats30d.data),
      all: mapData(statsAll.data),
    })
  } catch (err) {
    console.error("[API] Unexpected Error:", err)
    return res.status(500).json({
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : String(err),
    })
  }
}

