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
    console.log(`[API] Using Supabase URL: ${supabaseUrl?.substring(0, 15)}...`)
    console.log(`[API] Service Role Key exists: ${!!supabaseKey}`)

    // Check if the stored procedure exists
    console.log(`[API] Checking if stored procedure exists...`)
    const { data: procedureCheck, error: procedureError } = await supabase.rpc("check_function_exists", {
      function_name: "get_transaction_stats_by_company",
    })

    console.log(`[API] Procedure check result:`, procedureCheck)

    if (procedureError) {
      console.error("[API] Error checking for stored procedure:", procedureError)
      return res.status(200).json({
        error: "Failed to check if stored procedure exists",
        details: procedureError,
        mockData: true,
        "24h": mockCompanyStats(company, "24h"),
        "7d": mockCompanyStats(company, "7d"),
        "30d": mockCompanyStats(company, "30d"),
        all: mockCompanyStats(company, "all"),
      })
    }

    if (!procedureCheck) {
      console.log("[API] Stored procedure does not exist, returning mock data")
      return res.status(200).json({
        error: "Stored procedure does not exist",
        mockData: true,
        "24h": mockCompanyStats(company, "24h"),
        "7d": mockCompanyStats(company, "7d"),
        "30d": mockCompanyStats(company, "30d"),
        all: mockCompanyStats(company, "all"),
      })
    }

    // If the procedure exists, try to call it
    console.log(`[API] Calling stored procedure for company: ${company}`)

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
    console.log("[API] 24h stats data length:", stats24h.data?.length || 0)
    console.log("[API] 7d stats data length:", stats7d.data?.length || 0)
    console.log("[API] 30d stats data length:", stats30d.data?.length || 0)
    console.log("[API] all stats data length:", statsAll.data?.length || 0)

    if (stats24h.error || stats7d.error || stats30d.error || statsAll.error) {
      console.error("[API] One or more Supabase errors:", {
        stats24h: stats24h.error,
        stats7d: stats7d.error,
        stats30d: stats30d.error,
        statsAll: statsAll.error,
      })

      // Return mock data if there are errors
      return res.status(200).json({
        error: "Error fetching data from stored procedure",
        details: {
          stats24h: stats24h.error,
          stats7d: stats7d.error,
          stats30d: stats30d.error,
          statsAll: statsAll.error,
        },
        mockData: true,
        "24h": mockCompanyStats(company, "24h"),
        "7d": mockCompanyStats(company, "7d"),
        "30d": mockCompanyStats(company, "30d"),
        all: mockCompanyStats(company, "all"),
      })
    }

    // If we have real data, return it
    if (stats24h.data?.length || stats7d.data?.length || stats30d.data?.length || statsAll.data?.length) {
      console.log("[API] Returning real data from database")
      return res.status(200).json({
        mockData: false,
        "24h": stats24h.data?.[0] || null,
        "7d": stats7d.data?.[0] || null,
        "30d": stats30d.data?.[0] || null,
        all: statsAll.data?.[0] || null,
      })
    }

    // If no data was returned, use mock data
    console.log("[API] No data returned from database, using mock data")
    return res.status(200).json({
      error: "No data found for this company",
      mockData: true,
      "24h": mockCompanyStats(company, "24h"),
      "7d": mockCompanyStats(company, "7d"),
      "30d": mockCompanyStats(company, "30d"),
      all: mockCompanyStats(company, "all"),
    })
  } catch (err) {
    console.error("[API] Unexpected Error:", err)
    return res.status(500).json({
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : String(err),
      mockData: true,
      "24h": mockCompanyStats(req.query.company as string, "24h"),
      "7d": mockCompanyStats(req.query.company as string, "7d"),
      "30d": mockCompanyStats(req.query.company as string, "30d"),
      all: mockCompanyStats(req.query.company as string, "all"),
    })
  }
}

// Function to generate mock data for testing
function mockCompanyStats(companyName: string, period: string) {
  const baseAmount = period === "24h" ? 50000 : period === "7d" ? 350000 : period === "30d" ? 1500000 : 5000000

  const baseTx = period === "24h" ? 25 : period === "7d" ? 175 : period === "30d" ? 750 : 2500

  const baseTraders = period === "24h" ? 20 : period === "7d" ? 120 : period === "30d" ? 500 : 1500

  // Add some randomness to make it look realistic
  const randomFactor = 0.8 + Math.random() * 0.4 // Between 0.8 and 1.2

  return {
    total_amount: baseAmount * randomFactor,
    total_amount_change: (Math.random() * 20 - 10).toFixed(2),
    total_transactions: Math.floor(baseTx * randomFactor),
    total_transactions_change: (Math.random() * 20 - 10).toFixed(2),
    unique_traders: Math.floor(baseTraders * randomFactor),
    unique_traders_change: (Math.random() * 20 - 10).toFixed(2),
    average_payout: (baseAmount * randomFactor) / (baseTx * randomFactor),
    average_payout_change: (Math.random() * 20 - 10).toFixed(2),
    largest_payout: baseAmount * randomFactor * 0.2,
    largest_payout_change: (Math.random() * 20 - 10).toFixed(2),
    avg_transactions_per_trader: (baseTx * randomFactor) / (baseTraders * randomFactor),
    avg_transactions_per_trader_change: (Math.random() * 20 - 10).toFixed(2),
    time_since_last_transaction: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m ago`,
  }
}

