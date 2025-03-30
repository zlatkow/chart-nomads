/* eslint-disable */
"use client"

import { useState, useEffect, useRef } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { createPortal } from "react-dom"
import { X, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProblemReportProps {
  report: any // Use any to handle different report structures
}

// Add this function to check if we're in the browser
const isBrowser = () => typeof window !== "undefined"

export default function ProblemReportDisplay({ report }: ProblemReportProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const galleryRef = useRef<HTMLDivElement>(null)

  if (!report || Object.keys(report).length === 0) {
    return null
  }

  // Get the appropriate title based on report reason
  const getReportTitle = () => {
    switch (report.reportReason) {
      case "unjustified-breach":
        return "Unjustified Breach Report"
      case "payout-denial":
        return "Payout Denial Report"
      case "imposing-limitations":
        return "Limitations Imposed"
      case "payment-issues":
        return "Payment Issues"
      case "false-advertising":
        return "False Advertising"
      case "rule-changes":
        return "Rule Changes After Funding"
      case "technical-issues":
        return "Technical Issues"
      default:
        return report.reportReason ? formatReportReason(report.reportReason) : "Problem Report"
    }
  }

  // Format the report reason for display
  const formatReportReason = (reason: string) => {
    if (!reason) return ""
    return reason
      .replace(/-/g, " ")
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Gallery navigation functions
  const nextImage = () => {
    if (!report.proofs) return
    const proofKeys = Object.keys(report.proofs)
    setCurrentImageIndex((prev) => (prev === proofKeys.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    if (!report.proofs) return
    const proofKeys = Object.keys(report.proofs)
    setCurrentImageIndex((prev) => (prev === 0 ? proofKeys.length - 1 : prev - 1))
  }

  const openGallery = (index: number) => {
    // Save current scroll position
    setScrollPosition(window.scrollY)
    setCurrentImageIndex(index)
    setShowFullscreenGallery(true)

    // Fix the body at the current scroll position without shifting content
    document.body.style.top = `-${window.scrollY}px`
    document.body.style.position = "fixed"
    document.body.style.width = "100%"
    document.body.style.overflow = "hidden"
    document.body.style.left = "0"
    document.body.style.right = "0"
  }

  const closeGallery = () => {
    setShowFullscreenGallery(false)

    // Restore body styles
    document.body.style.position = ""
    document.body.style.width = ""
    document.body.style.overflow = ""
    document.body.style.top = ""
    document.body.style.left = ""
    document.body.style.right = ""

    // Restore scroll position immediately to prevent layout shift
    window.scrollTo(0, scrollPosition)
  }

  // Add keyboard navigation for the gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showFullscreenGallery) return

      if (e.key === "ArrowRight") {
        nextImage()
      } else if (e.key === "ArrowLeft") {
        prevImage()
      } else if (e.key === "Escape") {
        closeGallery()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [showFullscreenGallery, nextImage, prevImage, closeGallery])

  // Add this useEffect to handle clicks outside the gallery
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!showFullscreenGallery) return

      // Check if the click is outside the gallery content
      if (galleryRef.current && !galleryRef.current.contains(e.target as Node)) {
        closeGallery()
      }
    }

    const handleShowFullscreenGallery = () => {
      if (showFullscreenGallery) {
        document.addEventListener("mousedown", handleClickOutside)
      } else {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }

    handleShowFullscreenGallery()

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showFullscreenGallery, closeGallery])

  // Render the content based on report type
  const renderReportContent = () => {
    // For unjustified breach reports
    if (report.reportReason === "unjustified-breach") {
      return (
        <>
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {report.breachedAccountSize && (
              <div>
                <p className="text-xs text-red-400">Account Size</p>
                <p className="text-sm text-white">${report.breachedAccountSize.replace("k", ",000")}</p>
              </div>
            )}
            {report.receivedLastPayout && (
              <div className="mb-4">
                <p className="text-xs text-red-400">Paid Upon Breack</p>
                <p className="text-sm text-white">{report.receivedLastPayout}</p>
              </div>
            )}
          </div>

          {report.deniedAmount && (
            <div className="mb-4">
              <p className="text-xs text-red-400 mb-1">Owed Amount</p>
              <p className="text-sm text-white">{report.deniedAmount}</p>
            </div>
          )}

          {report.breachReason && (
            <div className="mb-4">
              <p className="text-xs text-red-400 mb-1">Reason Given by the Firm</p>
              <p className="text-sm text-white">{report.breachReason}</p>
            </div>
          )}

          {report.breachDetails && (
            <div className="mb-4">
              <p className="text-xs text-red-400 mb-1">Case Details</p>
              <p className="text-sm text-white whitespace-pre-line">{report.breachDetails}</p>
            </div>
          )}

          {renderProofImages()}
        </>
      )
    }

    // For payout denial reports
    if (report.reportReason === "payout-denial") {
      return (
        <>
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {report.deniedAmount && (
              <div>
                <p className="text-xs text-red-400 mb-1">Denied Amount</p>
                <p className="text-sm text-white">{report.deniedAmount}</p>
              </div>
            )}
            {report.payoutDenialReason && (
              <div>
                <p className="text-xs text-red-400 mb-1">Reason Given by the Firm</p>
                <p className="text-sm text-white">{report.payoutDenialReason}</p>
              </div>
            )}
          </div>

          {report.payoutDenialDetails && (
            <div className="mb-4">
              <p className="text-xs text-red-400 mb-1">Case Details</p>
              <p className="text-sm text-white whitespace-pre-line">{report.payoutDenialDetails}</p>
            </div>
          )}

          {renderProofImages()}
        </>
      )
    }

    // For other report types
    return (
      <>
        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {report.deniedAmount && (
            <div>
              <p className="text-xs text-red-400 mb-1">Denied Amount</p>
              <p className="text-sm text-white">{report.deniedAmount}</p>
            </div>
          )}
        </div>

        {(report.reportDescription || report.description) && (
          <div>
            <p className="text-xs text-red-400 mb-1">Case Details</p>
            <p className="text-sm text-white">{report.reportDescription || report.description}</p>
          </div>
        )}

        {renderProofImages()}
      </>
    )
  }

  // Render proof images
  const renderProofImages = () => {
    if (!report.proofs || Object.keys(report.proofs).length === 0) {
      return null
    }

    const proofKeys = Object.keys(report.proofs)

    return (
      <div className="mt-4">
        <p className="text-xs text-red-400 mb-2">Supporting Evidence</p>
        <div className="flex flex-wrap gap-2">
          {proofKeys.map((key, index) => (
            <button
              key={key}
              className="relative h-16 w-16 rounded-md overflow-hidden border border-[rgba(237,185,0,0.2)] hover:border-[#edb900] transition-colors"
              onClick={() => openGallery(index)}
            >
              <img
                src={report.proofs[key] || "/placeholder.svg?height=100&width=100"}
                alt={`Proof ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If image fails to load, show a placeholder
                  e.currentTarget.src = "/placeholder.svg?height=100&width=100"
                }}
              />
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Fullscreen gallery
  const renderFullscreenGallery = () => {
    if (!showFullscreenGallery || !report.proofs) return null

    const proofKeys = Object.keys(report.proofs)
    if (proofKeys.length === 0) return null

    const currentProofKey = proofKeys[currentImageIndex]
    const currentProofUrl = report.proofs[currentProofKey]

    return createPortal(
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-auto bg-black/80 backdrop-blur-md transition-opacity duration-200 ease-in-out"
        onClick={closeGallery}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <div
            ref={galleryRef}
            className="gallery-content relative max-w-3xl max-h-[80vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentProofUrl || "/placeholder.svg"}
              alt={`Proof ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-black/50 border-0 text-white hover:bg-black/70 pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                prevImage()
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-black/50 border-0 text-white hover:bg-black/70 pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                nextImage()
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 text-center pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white text-sm">
              Proof {currentImageIndex + 1} of {proofKeys.length}
            </p>
          </div>

          <button
            className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            onClick={(e) => {
              e.stopPropagation()
              closeGallery()
            }}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>,
      document.body,
    )
  }

  return (
    <>
      <Accordion type="single" collapsible className="mt-6">
        <AccordionItem value="report" className="border border-red-500 bg-red-900/20 rounded-md overflow-hidden">
          <AccordionTrigger className="py-3 px-4 hover:bg-red-900/30 hover:no-underline group">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <h4>Report: {getReportTitle()}</h4>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-0 bg-red-900/30">{renderReportContent()}</AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Render fullscreen gallery */}
      {isBrowser() && renderFullscreenGallery()}
    </>
  )
}

