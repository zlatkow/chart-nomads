/* eslint-disable */

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

// Add shimmer animation CSS
const shimmerAnimation = `
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-pulse {
  position: relative;
  overflow: hidden;
}

.animate-pulse::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.05) 20%,
    rgba(255, 255, 255, 0.1) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
  pointer-events: none;
}
`

export default function PropFirmPage() {
  const params = useParams<{ slug: string }>()
  const [firm, setFirm] = useState<Firm | null>(null)
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Add the shimmer animation to the document
    if (typeof document !== "undefined") {
      const style = document.createElement("style")
      style.textContent = shimmerAnimation
      document.head.appendChild(style)

      return () => {
        document.head.removeChild(style)
      }
    }
  }, [])

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
          setLoading(false)
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
    return (
      <div className="w-full max-w-5xl mx-auto pt-[200px]">
        {/* Firm Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            {/* Logo placeholder */}
            <div className="w-24 h-24 bg-[rgba(255,255,255,0.05)] rounded-lg"></div>
            <div className="flex-1">
              {/* Name placeholder */}
              <div className="h-8 w-64 bg-[rgba(255,255,255,0.05)] rounded mb-2"></div>
              {/* Category placeholder */}
              <div className="h-5 w-40 bg-[rgba(255,255,255,0.05)] rounded"></div>
            </div>
            {/* Rating placeholder */}
            <div className="flex flex-col items-end">
              <div className="h-6 w-24 bg-[rgba(255,255,255,0.05)] rounded mb-2"></div>
              <div className="h-4 w-32 bg-[rgba(255,255,255,0.05)] rounded"></div>
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <div key={`detail-${index}`} className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4">
                  <div className="h-5 w-24 bg-[rgba(255,255,255,0.05)] rounded mb-3"></div>
                  <div className="h-6 w-full bg-[rgba(255,255,255,0.05)] rounded"></div>
                </div>
              ))}
          </div>

          {/* Description Skeleton */}
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 mb-8">
            <div className="h-6 w-40 bg-[rgba(255,255,255,0.05)] rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-[rgba(255,255,255,0.05)] rounded"></div>
              <div className="h-4 w-full bg-[rgba(255,255,255,0.05)] rounded"></div>
              <div className="h-4 w-3/4 bg-[rgba(255,255,255,0.05)] rounded"></div>
            </div>
          </div>

          {/* Rating Breakdown Skeleton */}
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6">
            <div className="h-6 w-48 bg-[rgba(255,255,255,0.05)] rounded mb-4"></div>
            <div className="space-y-3">
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <div key={`rating-${index}`} className="flex items-center gap-2">
                    <div className="h-4 w-32 bg-[rgba(255,255,255,0.05)] rounded"></div>
                    <div className="flex-1 h-2 bg-[#0f0f0f] rounded-full overflow-hidden">
                      <div className="h-full bg-[rgba(237,185,0,0.1)]" style={{ width: "0%" }}></div>
                    </div>
                    <div className="h-4 w-16 bg-[rgba(255,255,255,0.05)] rounded"></div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <PropFirmUI firm={firm} ratingBreakdown={ratingBreakdown} formatCurrency={formatCurrency} />
}

