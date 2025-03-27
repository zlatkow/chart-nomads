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

interface ReviewSystemProps {
  companyName?: string
  companySlug?: string
  propfirmId?: number
  companyLogo?: string
}

export default function ReviewSystem({
  companyName = "CHART NOMADS",
  companySlug,
  propfirmId,
  companyLogo,
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

  // Handle case where modalContext is not available
  if (!modalContext) {
    console.error("ModalContext is not available in ReviewSystem")
    return null
  }

  const { openReviewModal } = modalContext

  const handleOpenReviewModal = () => {
    console.log("Opening review modal for:", companyName)

    // Only pass the properties that the modal accepts
    openReviewModal({
      companyName,
      companyLogo,
    })

    // We don't pass propfirmId because the modal doesn't accept it
    // The propfirmId will be used by ReviewList to fetch reviews
  }

  return (
    <div className="w-full">
      <ReviewList
        companyName={companyName}
        companyLogo={companyLogo}
        companySlug={companySlug}
        propfirmId={resolvedPropfirmId}
        onOpenReviewModal={handleOpenReviewModal}
        isLoading={isLoading}
      />
    </div>
  )
}

