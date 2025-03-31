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

    // Use a single query approach with direct SQL
    const { data: stats24h, error: error24h } = await supabase
      .from("transactions_stats") // Use your actual table name
      .select("*")
      .eq("company_name", company)
      .eq("period", "24h")
      .limit(1)

    const { data: stats7d, error: error7d } = await supabase
      .from("transactions_stats") // Use your actual table name
      .select("*")
      .eq("company_name", company)
      .eq("period", "7d")
      .limit(1)

    const { data: stats30d, error: error30d } = await supabase
      .from("transactions_stats") // Use your actual table name
      .select("*")
      .eq("company_name", company)
      .eq("period", "30d")
      .limit(1)

    const { data: statsAll, error: errorAll } = await supabase
      .from("transactions_stats") // Use your actual table name
      .select("*")
      .eq("company_name", company)
      .eq("period", "all")
      .limit(1)

    // Log the results for debugging
    console.log("[API] 24h stats:", { data: stats24h, error: error24h })
    console.log("[API] 7d stats:", { data: stats7d, error: error7d })
    console.log("[API] 30d stats:", { data: stats30d, error: error30d })
    console.log("[API] all stats:", { data: statsAll, error: errorAll })

    // Check for errors
    if (error24h || error7d || error30d || errorAll) {
      return res.status(500).json({
        error: "Error fetching data from database",
        details: {
          error24h,
          error7d,
          error30d,
          errorAll,
        },
      })
    }

    // Return the data
    return res.status(200).json({
      "24h": stats24h?.[0] || null,
      "7d": stats7d?.[0] || null,
      "30d": stats30d?.[0] || null,
      all: statsAll?.[0] || null,
    })
  } catch (err) {
    console.error("[API] Unexpected Error:", err)
    return res.status(500).json({
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : String(err),
    })
  }
}

