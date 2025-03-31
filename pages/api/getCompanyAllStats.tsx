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

    // Call the stored procedure directly with the two required parameters
    const [stats24h, stats7d, stats30d, statsAll] = await Promise.all([
      supabase.rpc("get_transaction_stats_by_company", {
        company_name: company, // Changed parameter name to match your function
        period: "24h",
      }),
      supabase.rpc("get_transaction_stats_by_company", {
        company_name: company, // Changed parameter name to match your function
        period: "7d",
      }),
      supabase.rpc("get_transaction_stats_by_company", {
        company_name: company, // Changed parameter name to match your function
        period: "30d",
      }),
      supabase.rpc("get_transaction_stats_by_company", {
        company_name: company, // Changed parameter name to match your function
        period: "all",
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

    // Return the data
    return res.status(200).json({
      "24h": stats24h.data?.[0] || null,
      "7d": stats7d.data?.[0] || null,
      "30d": stats30d.data?.[0] || null,
      all: statsAll.data?.[0] || null,
    })
  } catch (err) {
    console.error("[API] Unexpected Error:", err)
    return res.status(500).json({
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : String(err),
    })
  }
}

