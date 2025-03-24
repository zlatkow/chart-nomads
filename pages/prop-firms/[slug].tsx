"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import PropFirmUI from "./PropFirmPageUI"

// Define types for the firm and rating data
interface Firm {
  id: number
  propfirm_name: string
  logo_url?: string
  category?: string
  rating?: number
  reviews_count?: number
  likes_count?: number
  social_links?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
    youtube?: string
  }
  ceo?: string
  established?: string
  country?: string
  website?: string
  broker?: string
  platform?: string
  platform_details?: string
  instruments?: string[]
  leverage?: Record<string, string>
  // Add other properties as needed
}

interface RatingBreakdown {
  five_star: number
  four_star: number
  three_star: number
  two_star: number
  one_star: number
  // Add other properties as needed
}

interface PageParams {
  slug: string
}

export default function PropFirmPage() {
  const params = useParams<{ slug: string }>()
  const [firm, setFirm] = useState<Firm | null>(null)
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFirmData() {
      // Add a more robust check for params and params.slug
      if (!params?.slug) {
        console.error("Missing slug parameter")
        setLoading(false)
        return
      }

      try {
        // Fetch the firm data
        const { data: firmData, error: firmError } = await supabase
          .from("prop_firms")
          .select("*")
          .eq("slug", params.slug)
          .single()

        if (firmError) {
          console.error("Error fetching firm data:", firmError)
          return
        }

        setFirm(firmData)

        // Fetch rating breakdown
        const { data: ratingData, error: ratingError } = await supabase
          .from("prop_firm_ratings")
          .select("*")
          .eq("firm_id", firmData.id)
          .single()

        if (ratingError && ratingError.code !== "PGRST116") {
          console.error("Error fetching rating data:", ratingError)
        } else if (ratingData) {
          setRatingBreakdown(ratingData)
        }
      } catch (error) {
        console.error("Error in fetchFirmData:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFirmData()
  }, [params])

  // Format currency helper function
  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return <PropFirmUI firm={firm} ratingBreakdown={ratingBreakdown} formatCurrency={formatCurrency} />
}

