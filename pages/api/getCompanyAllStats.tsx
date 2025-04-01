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
    const dataType = (req.query.dataType as string) || "stats" // Default to "stats" if not specified
    const timeFilter = (req.query.timeFilter as string) || "all" // Default to "all" if not specified
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10

    if (dataType === "transactions") {
      try {
        console.log(
          `[API] Fetching transactions with timeFilter: ${timeFilter}, page: ${page}, limit: ${limit}, company: ${company || "all"}`,
        )

        // Calculate offset based on page and limit
        const offset = (page - 1) * limit

        // Call the SQL function using Supabase
        const { data: transactions, error } = await supabase.rpc("print_all_transactions", {
          timefilter: timeFilter,
          limitrows: limit,
          offsetrows: offset,
          companyfilter: company || null,
        })

        if (error) {
          console.error("[API] Error fetching transactions:", error)
          return res.status(500).json({
            error: "Error fetching transaction data",
            details: error,
          })
        }

        // Extract pagination info from the first result (if available)
        const pagination =
          transactions && transactions.length > 0
            ? {
                total: transactions[0].total_count,
                pages: transactions[0].page_count,
                currentPage: page,
                limit: limit,
              }
            : {
                total: 0,
                pages: 0,
                currentPage: page,
                limit: limit,
              }

        console.log(`[API] Found ${transactions?.length || 0} transactions, total: ${pagination.total}`)

        return res.status(200).json({
          transactions: transactions || [],
          pagination,
        })
      } catch (error) {
        console.error("[API] Unexpected error in transactions:", error)
        return res.status(500).json({
          error: "Unexpected error processing transactions",
          details: error instanceof Error ? error.message : String(error),
        })
      }
    } else if (!company) {
      return res.status(400).json({ error: "Missing 'company' query parameter" })
    } else if (dataType === "monthly") {
      // Call the monthly stats function
      const { data: monthlyStats, error: monthlyError } = await supabase.rpc(
        "get_monthly_combined_transaction_stats_by_firm",
        { firm_name: company },
      )

      if (monthlyError) {
        console.error("[API] Error fetching monthly stats:", monthlyError)
        return res.status(500).json({
          error: "Error fetching monthly data",
          details: monthlyError,
        })
      }

      console.log("[API] Monthly stats data:", monthlyStats)

      return res.status(200).json({
        monthly: monthlyStats || [],
      })
    } else if (dataType === "topPayouts") {
      try {
        console.log(`[API] Fetching top payouts for company: ${company}, timeFilter: ${timeFilter}`)

        // First, get the prop_firm_id for the company name
        const { data: propFirmData, error: propFirmError } = await supabase
          .from("prop_firms")
          .select("id")
          .eq("propfirm_name", company)
          .single()

        if (propFirmError) {
          console.error("[API] Error fetching prop_firm_id:", propFirmError)
          return res.status(500).json({
            error: "Error finding company in database",
            details: propFirmError,
          })
        }

        if (!propFirmData || !propFirmData.id) {
          console.error(`[API] Company not found: ${company}`)
          return res.status(404).json({
            error: "Company not found",
            details: `No company found with name: ${company}`,
          })
        }

        const propFirmId = propFirmData.id
        console.log(`[API] Found prop_firm_id: ${propFirmId} for company: ${company}`)

        // Now fetch the top payouts for this prop_firm_id
        const { data: topPayouts, error: topPayoutsError } = await supabase
          .from("company_top_payouts")
          .select(`
            id,
            rank,
            payout_amount,
            transaction_date,
            time_frame,
            prop_firm_id
          `)
          .eq("prop_firm_id", propFirmId)
          .eq("time_frame", timeFilter)
          .order("rank", { ascending: true })
          .limit(10)

        if (topPayoutsError) {
          console.error("[API] Error fetching top payouts:", topPayoutsError)
          return res.status(500).json({
            error: "Error fetching top payouts data",
            details: topPayoutsError,
          })
        }

        console.log(`[API] Found ${topPayouts?.length || 0} top payouts for ${company}`)

        // Get the company details from prop_firms table
        const { data: companyDetails, error: companyDetailsError } = await supabase
          .from("prop_firms")
          .select("propfirm_name, logo_url, rating, brand_colour")
          .eq("id", propFirmId)
          .single()

        if (companyDetailsError) {
          console.error("[API] Error fetching company details:", companyDetailsError)
        }

        // Format the data for the frontend with both camelCase and snake_case for compatibility
        const formatted = topPayouts.map((row) => ({
          id: `payout-${row.rank}`,
          rank: row.rank,
          // Support both naming conventions for maximum compatibility
          payoutAmount: row.payout_amount,
          payoutamount: row.payout_amount,
          transactionDate: row.transaction_date,
          transactiondate: row.transaction_date,
          companyName: company,
          companyname: company,
          // Use some default values if company details are not available
          brandColour: companyDetails?.brand_colour, // Default gold color
          brandcolour: companyDetails?.brand_colour,
          logoUrl: companyDetails?.logo_url || null,
          logourl: companyDetails?.logo_url || null,
          timeFrame: row.time_frame,
          timeframe: row.time_frame,
        }))

        console.log("[API] Formatted top payouts sample:", formatted?.[0])

        return res.status(200).json({ topPayouts: formatted })
      } catch (error) {
        console.error("[API] Unexpected error in topPayouts:", error)
        return res.status(500).json({
          error: "Unexpected error processing top payouts",
          details: error instanceof Error ? error.message : String(error),
        })
      }
    } else if (dataType === "donutStats") {
      try {
        console.log(`[API] Fetching donut chart stats for company: ${company}`)

        // First, get the prop_firm_id for the company name
        const { data: propFirmData, error: propFirmError } = await supabase
          .from("prop_firms")
          .select("id")
          .eq("propfirm_name", company)
          .single()

        if (propFirmError) {
          console.error("[API] Error fetching prop_firm_id:", propFirmError)
          return res.status(500).json({
            error: "Error finding company in database",
            details: propFirmError,
          })
        }

        if (!propFirmData || !propFirmData.id) {
          console.error(`[API] Company not found: ${company}`)
          return res.status(404).json({
            error: "Company not found",
            details: `No company found with name: ${company}`,
          })
        }

        const propFirmId = propFirmData.id
        console.log(`[API] Found prop_firm_id: ${propFirmId} for company: ${company}`)

        // Now fetch the donut chart stats for this prop_firm_id
        const { data: stats, error } = await supabase
          .from("donutchart_company_highearners_stats")
          .select(`
            company_id,
            category,
            count,
            percentage,
            total_unique_traders,
            category_type,
            created_at
          `)
          .eq("company_id", propFirmId)

        if (error) {
          console.error("[API] Error fetching donut stats:", error)
          return res.status(500).json({
            error: "Error fetching donut chart data",
            details: error,
          })
        }

        console.log(`[API] Found ${stats?.length || 0} donut chart stats for ${company}`)

        // Organize into category_type groups
        const grouped = {
          payoutCount: stats.filter((d) => d.category_type === "Payout Count"),
          paidAmount: stats.filter((d) => d.category_type === "Paid Amount"),
        }

        console.log("[API] Grouped donut stats:", {
          payoutCount: grouped.payoutCount.length,
          paidAmount: grouped.paidAmount.length,
        })

        return res.status(200).json({ donutStats: grouped })
      } catch (error) {
        console.error("[API] Unexpected error in donutStats:", error)
        return res.status(500).json({
          error: "Unexpected error processing donut stats",
          details: error instanceof Error ? error.message : String(error),
        })
      }
    } else if (dataType === "churnRate") {
      try {
        console.log(`[API] Fetching churn rate data for company: ${company}`)

        // Step 1: Get company ID
        const { data: companyData, error: companyError } = await supabase
          .from("prop_firms")
          .select("id")
          .eq("propfirm_name", company)
          .single()

        if (companyError || !companyData?.id) {
          console.error("[API] Error fetching company ID:", companyError)
          return res.status(404).json({
            error: "Company not found",
            details: companyError?.message || "Invalid company name",
          })
        }

        const companyId = companyData.id

        // Step 2: Get churn stats
        const { data: churnStats, error: churnError } = await supabase
          .from("monthly_company_churn_stats")
          .select(`
            month_year,
            total_users_last_year,
            active_users_last_6_months,
            churn_rate,
            churn_rate_change
          `)
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })

        if (churnError) {
          console.error("[API] Error fetching churn data:", churnError)
          return res.status(500).json({
            error: "Error fetching churn data",
            details: churnError.message,
          })
        }

        return res.status(200).json({ churnRate: churnStats || [] })
      } catch (error) {
        console.error("[API] Unexpected error in churnRate:", error)
        return res.status(500).json({
          error: "Unexpected error processing churn rate",
          details: error instanceof Error ? error.message : String(error),
        })
      }
    } else {
      // Original functionality for regular stats
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
    }
  } catch (err) {
    console.error("[API] Unexpected Error:", err)
    return res.status(500).json({
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : String(err),
    })
  }
}

