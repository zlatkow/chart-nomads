"use client"

import { useContext, useEffect, useState } from "react"
import ReviewList from "./review-list"
import { ModalContext } from "../../pages/_app"
import { useRouter } from "next/router"

// Map of propfirm slugs to their IDs in the database
// This should be populated from your database or API
const PROPFIRM_MAP: Record<string, number> = {
  brightfunded: 1, // Example mapping - replace with actual IDs
  "blue-guardian": 2,
  "chart-nomads": 3,
  // Add more mappings as needed
}

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

  // Try to determine the propfirm ID if not provided directly
  useEffect(() => {
    // If propfirmId is already provided, use it
    if (propfirmId !== undefined) {
      setResolvedPropfirmId(propfirmId)
      return
    }

    // Try to get the propfirm ID from the URL path
    const pathSegments = router.asPath.split("/")
    const slugFromUrl = pathSegments[pathSegments.length - 1]

    // First check if we have a direct mapping for the slug
    if (companySlug && PROPFIRM_MAP[companySlug]) {
      setResolvedPropfirmId(PROPFIRM_MAP[companySlug])
      return
    }

    // Then check if we can extract it from the URL
    if (slugFromUrl && PROPFIRM_MAP[slugFromUrl]) {
      setResolvedPropfirmId(PROPFIRM_MAP[slugFromUrl])
      return
    }

    // Default to null if we can't determine the ID
    setResolvedPropfirmId(null)
  }, [companyName, companySlug, propfirmId, router.asPath])

  // Handle case where modalContext is not available
  if (!modalContext) {
    console.error("ModalContext is not available in ReviewSystem")
    return null
  }

  const { openReviewModal } = modalContext

//   // Option 1: Pass the ID directly without a property name
//   const handleOpenReviewModal = () => {
//     console.log("Opening review modal for:", companyName)
//     openReviewModal(companyName, companyLogo, resolvedPropfirmId)
//   }

  // If Option 1 doesn't work, try Option 2 by commenting Option 1 and uncommenting below:

//   const handleOpenReviewModal = () => {
//     console.log("Opening review modal for:", companyName)
//     openReviewModal({
//       companyName, 
//       companyLogo,
//       // Try different property names:
//       propfirmId: resolvedPropfirmId,
//       // propfirm: resolvedPropfirmId,
//       // id: resolvedPropfirmId,
//       // firmId: resolvedPropfirmId,
//       // companyId: resolvedPropfirmId
//     })
//   }


  // If neither Option 1 nor Option 2 works, try Option 3:
  
  const handleOpenReviewModal = () => {
    console.log("Opening review modal for:", companyName)
    // Just pass the basic info and let the modal handle the ID
    openReviewModal({
      companyName,
      companyLogo
    })
  }

  return (
    <div className="w-full">
      <ReviewList
        companyName={companyName}
        companyLogo={companyLogo}
        companySlug={companySlug}
        propfirmId={resolvedPropfirmId}
        onOpenReviewModal={handleOpenReviewModal}
      />
    </div>
  )
}

