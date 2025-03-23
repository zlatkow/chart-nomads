import { createClient } from "@supabase/supabase-js"
import PropFirmUI from "./PropFirmPageUI"

// Set up Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side data fetching for Pages Router
export async function getServerSideProps({ params }) {
  // Check if params exists
  if (!params || !params.slug) {
    return {
      notFound: true
    }
  }
  
  const { slug } = params

  // Fetch data from Supabase
  const { data: firm, error } = await supabase.from("prop_firms").select("*").eq("slug", slug).single()

  // Handle not found case
  if (error || !firm) {
    return {
      notFound: true
    }
  }

  // Calculate rating percentages or use defaults
  const ratingBreakdown = firm.rating_breakdown || {
    five_star: 58,
    four_star: 30,
    three_star: 7,
    two_star: 3,
    one_star: 2,
  }

  // Default payout stats if not provided
  const payoutStats = firm.payout_stats || {
    last_24_hours: 222406.69,
    last_7_days: 1488860.85,
    last_30_days: 6244829.7,
    since_start: 97849875.27,
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
      cumulativePayouts
    }
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
    />
  )
}