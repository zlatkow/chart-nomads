/* eslint-disable */
import { createClient } from "@supabase/supabase-js"
import PropFirmUI from "./PropFirmPageUI"

// Set up Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side data fetching for Pages Router
export async function getServerSideProps({ params }) {
  console.log("getServerSideProps called with params:", params)

  // Check if params exists
  if (!params || !params.slug) {
    console.log("No slug parameter found")
    return {
      notFound: true,
    }
  }

  const { slug } = params
  console.log("Fetching data for slug:", slug)

  try {
    // Fetch data from Supabase
    const { data: firm, error } = await supabase.from("prop_firms").select("*").eq("slug", slug).single()

    // Handle not found case
    if (error) {
      console.error("Error fetching firm data:", error)
      return {
        notFound: true,
      }
    }

    if (!firm) {
      console.log("No firm found for slug:", slug)
      return {
        notFound: true,
      }
    }

    console.log("Firm data fetched successfully:", firm)

    // Static rating breakdown - not from database
    const ratingBreakdown = {
      five_star: 58,
      four_star: 30,
      three_star: 7,
      two_star: 3,
      one_star: 2,
    }

    // Ensure firm has all required properties with defaults
    const sanitizedFirm = {
      ...firm,
      instruments: firm.instruments || [],
      leverage: firm.leverage || {},
      social_links: firm.social_links || {},
      rating: firm.rating || 4.5,
      reviews_count: firm.reviews_count || "4.5k",
      likes_count: firm.likes_count || 91,
    }

    return {
      props: {
        firm: sanitizedFirm,
        ratingBreakdown,
      },
    }
  } catch (err) {
    console.error("Unexpected error in getServerSideProps:", err)
    return {
      notFound: true,
    }
  }
}

// Client component
export default function PropFirmPage({ firm, ratingBreakdown }) {
  // Ensure firm is defined
  if (!firm) {
    return <div>Loading...</div>
  }

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return <PropFirmUI firm={firm} ratingBreakdown={ratingBreakdown} formatCurrency={formatCurrency} />
}

