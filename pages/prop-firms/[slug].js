/* eslint-disable */
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

  // Static rating breakdown - not from database
  const ratingBreakdown = {
    five_star: 58,
    four_star: 30,
    three_star: 7,
    two_star: 3,
    one_star: 2,
  }

  return {
    props: {
      firm,
      ratingBreakdown
    }
  }
}

// Client component
export default function PropFirmPage({ firm, ratingBreakdown }) {
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
      formatCurrency={formatCurrency}
    />
  )
}
