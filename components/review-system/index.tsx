"use client"

import { useContext, useEffect, useState } from "react"
import ReviewList from "./review-list"
import { ModalContext } from "../../pages/_app"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Update the ReviewSystemProps interface to include highlightReviewId
interface ReviewSystemProps {
  companyName?: string
  companySlug?: string
  propfirmId?: number
  companyLogo?: string
  highlightReviewId?: string | null
}

// Update the function parameters to include highlightReviewId with a default value of null
export default function ReviewSystem({
  companyName = "CHART NOMADS",
  companySlug,
  propfirmId,
  companyLogo,
  highlightReviewId = null,
}: ReviewSystemProps) {
  // Get the openReviewModal function from context
  const modalContext = useContext(ModalContext)
  const router = useRouter()
  const [resolvedPropfirmId, setResolvedPropfirmId] = useState<number | null>(propfirmId || null)
  const [isLoading, setIsLoading] = useState(false)

  // Dynamically fetch propfirm ID based on slug
  useEffect(() => {
    async function fetchPropfirmId() {
      // If propfirmId is already provided, use it
      if (propfirmId !== undefined) {
        setResolvedPropfirmId(propfirmId)
        return
      }

      setIsLoading(true)

      try {
        // Determine which slug to use
        const slugToUse =
          companySlug ||
          (typeof router.query.slug === "string" ? router.query.slug : "") ||
          router.asPath.split("/").pop() ||
          ""

        if (!slugToUse) {
          console.error("No slug available to fetch propfirm ID")
          setResolvedPropfirmId(null)
          return
        }

        // First try to find by exact slug match
        let { data, error } = await supabase.from("prop_firms").select("id").eq("slug", slugToUse).single()

        // If no exact match, try to find by normalized slug
        if (!data && error) {
          const normalizedSlug = slugToUse.toLowerCase().replace(/[^a-z0-9]+/g, "-")
          ;({ data, error } = await supabase.from("prop_firms").select("id").eq("slug", normalizedSlug).single())

          // If still no match, try a more flexible search
          if (!data && error) {
            ;({ data, error } = await supabase
              .from("prop_firms")
              .select("id")
              .ilike("name", `%${slugToUse.replace(/-/g, " ")}%`)
              .single())
          }
        }

        if (data) {
          setResolvedPropfirmId(data.id)
        } else {
          console.error("Could not find propfirm ID for slug:", slugToUse)
          setResolvedPropfirmId(null)
        }
      } catch (error) {
        console.error("Error fetching propfirm ID:", error)
        setResolvedPropfirmId(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPropfirmId()
  }, [companySlug, propfirmId, router.asPath, router.query.slug])

  // Add a useEffect to handle highlighting the review
  useEffect(() => {
    if (highlightReviewId) {
      console.log(`ReviewSystem: Looking for review with ID: review-${highlightReviewId}`)

      // Use a longer delay to ensure the reviews have loaded
      const timer = setTimeout(() => {
        const reviewElement = document.getElementById(`review-${highlightReviewId}`)
        if (reviewElement) {
          console.log(`ReviewSystem: Found review element, scrolling to it`)

          // Scroll to the review with smooth behavior
          reviewElement.scrollIntoView({ behavior: "smooth", block: "center" })

          // Add a highlight effect
          reviewElement.classList.add("highlight-review")

          // Remove the highlight effect after a few seconds
          setTimeout(() => {
            reviewElement.classList.remove("highlight-review")
          }, 3000)
        } else {
          console.warn(`ReviewSystem: Review element with ID review-${highlightReviewId} not found after delay`)
        }
      }, 1000) // Longer delay to ensure DOM is ready

      return () => clearTimeout(timer)
    }
  }, [highlightReviewId, isLoading])

  // Handle case where modalContext is not available
  if (!modalContext) {
    console.error("ModalContext is not available in ReviewSystem")
    return null
  }

  const { openReviewModal } = modalContext

  const handleOpenReviewModal = () => {
    console.log("Opening review modal for:", companyName)

    // Make sure we have a valid propfirmId to pass
    if (resolvedPropfirmId === null) {
      console.error("Cannot open review modal: No propfirmId available")
      return
    }

    // Pass all required properties including companyId
    openReviewModal({
      companyName,
      companyLogo,
      companyId: resolvedPropfirmId.toString(), // Convert number to string
    })
  }

  // Add the highlightReviewId prop to the ReviewList component
  return (
    <div className="w-full">
      <ReviewList
        companyName={companyName}
        companyLogo={companyLogo}
        companySlug={companySlug}
        propfirmId={resolvedPropfirmId}
        onOpenReviewModal={handleOpenReviewModal}
        isLoading={isLoading}
        highlightReviewId={highlightReviewId}
      />
    </div>
  )
}

