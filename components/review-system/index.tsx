"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ReviewList from "./review-list"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Map of propfirm slugs to their IDs in the database
// This should be populated from your database or API
const PROPFIRM_MAP: Record<string, number> = {
  brightfunded: 1, // Example mapping - replace with actual IDs
  "blue-guardian": 2,
  "chart-nomads": 3,
  // Add more mappings as needed
}

export default function PropFirmPage() {
  const params = useParams()
  const [propfirmData, setPropfirmData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Get the slug from the URL
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : ""

  // Fetch propfirm data
  useEffect(() => {
    async function fetchPropfirmData() {
      setLoading(true)

      try {
        // First, try to get the propfirm ID from our mapping
        const propfirmId = PROPFIRM_MAP[slug]

        if (propfirmId) {
          // If we have an ID, fetch the propfirm data
          const { data, error } = await supabase.from("propfirms").select("*").eq("id", propfirmId).single()

          if (data && !error) {
            setPropfirmData(data)
          } else {
            // If we don't have data, create a fallback object
            setPropfirmData({
              id: propfirmId,
              name: slug
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
              logo: "/placeholder.svg?height=100&width=100",
            })
          }
        } else {
          // If we don't have an ID mapping, try to find the propfirm by slug
          const { data, error } = await supabase.from("propfirms").select("*").eq("slug", slug).single()

          if (data && !error) {
            setPropfirmData(data)
            // Update our mapping for future use
            PROPFIRM_MAP[slug] = data.id
          } else {
            // If we still don't have data, create a fallback object
            setPropfirmData({
              id: null,
              name: slug
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
              logo: "/placeholder.svg?height=100&width=100",
            })
          }
        }
      } catch (error) {
        console.error("Error fetching propfirm data:", error)
        // Create a fallback object
        setPropfirmData({
          id: null,
          name: slug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          logo: "/placeholder.svg?height=100&width=100",
        })
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchPropfirmData()
    }
  }, [slug])

  const handleOpenReviewModal = () => {
    // Implement your modal opening logic here
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {/* Other prop firm page content */}

      {/* Reviews section */}
      <ReviewList
        onOpenReviewModal={handleOpenReviewModal}
        companyName={propfirmData?.name || ""}
        companySlug={slug}
        propfirmId={propfirmData?.id || null}
        companyLogo={propfirmData?.logo || ""}
      />
    </div>
  )
}

