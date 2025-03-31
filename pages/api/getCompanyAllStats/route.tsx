import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const company = searchParams.get("company")

  if (!company) {
    return NextResponse.json({ error: "Missing 'company' query parameter" }, { status: 400 })
  }

  try {
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

    if (stats24h.error || stats7d.error || stats30d.error || statsAll.error) {
      console.error("One or more Supabase errors:", {
        stats24h: stats24h.error,
        stats7d: stats7d.error,
        stats30d: stats30d.error,
        statsAll: statsAll.error,
      })

      return NextResponse.json({ error: "Failed to fetch one or more timeframes" }, { status: 500 })
    }

    return NextResponse.json({
      "24h": stats24h.data?.[0] || null,
      "7d": stats7d.data?.[0] || null,
      "30d": stats30d.data?.[0] || null,
      all: statsAll.data?.[0] || null,
    })
  } catch (err) {
    console.error("Unexpected Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

