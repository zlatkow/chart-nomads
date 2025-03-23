/* eslint-disable */
import { createClient } from "@supabase/supabase-js"
import PropFirmUI from "./PropFirmPageUI"

// Server-side data fetching for Pages Router
export async function getServerSideProps({ params }) {
    // Set up Supabase client for server-side
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
    // Check if params exists
    if (!params || !params.slug) {
      return {
        notFound: true,
      }
    }
  
    const { slug } = params
  
    // Fetch data from Supabase
    const { data: firm, error } = await supabase.from("prop_firms").select("*").eq("slug", slug).single()
  
    // Handle not found case
    if (error || !firm) {
      return {
        notFound: true,
      }
    }
  
    // Calculate rating percentages or use defaults
    let ratingBreakdown = {
      five_star: 58,
      four_star: 30,
      three_star: 7,
      two_star: 3,
      one_star: 2,
    }
  
    // Only override with firm data if it exists and has the expected structure
    if (firm && firm.rating_breakdown && typeof firm.rating_breakdown === "object") {
      ratingBreakdown = {
        five_star: firm.rating_breakdown.five_star ?? ratingBreakdown.five_star,
        four_star: firm.rating_breakdown.four_star ?? ratingBreakdown.four_star,
        three_star: firm.rating_breakdown.three_star ?? ratingBreakdown.three_star,
        two_star: firm.rating_breakdown.two_star ?? ratingBreakdown.two_star,
        one_star: firm.rating_breakdown.one_star ?? ratingBreakdown.one_star,
      }
    }
  
    // Make the payoutStats more robust as well
    let payoutStats = {
      last_24_hours: 222406.69,
      last_7_days: 1488860.85,
      last_30_days: 6244829.7,
      since_start: 97849875.27,
    }
  
    // Only override with firm data if it exists and has the expected structure
    if (firm && firm.payout_stats && typeof firm.payout_stats === "object") {
      payoutStats = {
        last_24_hours: firm.payout_stats.last_24_hours ?? payoutStats.last_24_hours,
        last_7_days: firm.payout_stats.last_7_days ?? payoutStats.last_7_days,
        last_30_days: firm.payout_stats.last_30_days ?? payoutStats.last_30_days,
        since_start: firm.payout_stats.since_start ?? payoutStats.since_start,
      }
    }
  
    // Default chart data if not provided
    const monthlyPayouts = firm.monthly_payouts || [15, 20, 25, 35, 45, 65, 75, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40]
    const cumulativePayouts = firm.cumulative_payouts || [
      300, 290, 285, 280, 275, 270, 260, 240, 220, 190, 150, 120, 80, 50, 30, 20, 10,
    ]
  
    return {
      props: {
        firm,
        ratingBreakdown,
        payoutStats,
        monthlyPayouts,
        cumulativePayouts,
      },
    }
  }
  
  // Client component
  export default function PropFirmPage({ firm, ratingBreakdown, payoutStats, monthlyPayouts, cumulativePayouts }) {
    // Format currency values
    const formatCurrency = (value) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    }
  
    return (
      <PropFirmUI
        firm={firm}
        ratingBreakdown={ratingBreakdown}
        payoutStats={payoutStats}
        monthlyPayouts={monthlyPayouts}
        cumulativePayouts={cumulativePayouts}
        formatCurrency={formatCurrency}
        setPropFirms={() => {}} // Add empty function to prevent errors
      />
    )
  }

