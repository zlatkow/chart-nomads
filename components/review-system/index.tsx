"use client"

import { useContext } from "react"
import ReviewList from "./review-list"
import { ModalContext } from "../../pages/_app"

interface ReviewSystemProps {
  companyName?: string
  companyLogo?: string
}

export default function ReviewSystem({ companyName = "CHART NOMADS", companyLogo }: ReviewSystemProps) {
  // Get the openReviewModal function from context
  const modalContext = useContext(ModalContext)

  if (!modalContext) {
    console.error("ModalContext is not available in ReviewSystem")
    return null
  }

  const { openReviewModal } = modalContext

  const handleOpenReviewModal = () => {
    console.log("Opening review modal for:", companyName)
    openReviewModal({ companyName, companyLogo })
  }

  return (
    <div className="w-full">
      <ReviewList companyName={companyName} companyLogo={companyLogo} onOpenReviewModal={handleOpenReviewModal} />
    </div>
  )
}

