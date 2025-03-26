/* eslint-disable */
"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  ThumbsUp,
  Flag,
  Calendar,
  MessageSquare,
  AlertCircle,
  X,
  ArrowLeft,
  ArrowRight,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Globe,
  ChevronRight,
  Info,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Add the useNoise import at the top of the file
import { useNoise } from "../../components/providers/noise-provider"

// Define types for our review data
interface ReviewRating {
  category: string
  value: number
}

interface ReviewReport {
  reason: string
  description: string
  deniedAmount?: string
}

interface CompanyResponse {
  responderName: string
  position: string
  date: string
  content: string
}

interface ProofImage {
  id: string
  thumbnail: string
  fullImage: string
  caption?: string
}

interface SocialLinks {
  instagram?: string
  twitter?: string
  facebook?: string
  linkedin?: string
  website?: string
}

interface ReviewProps {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  authorLocation?: string
  authorCountryCode?: string
  date: string
  rating: number
  content: string
  accountSize: string
  accountType: string
  tradingDuration: string
  detailedRatings: ReviewRating[]
  likedAspect?: string
  dislikedAspect?: string
  upvotes: number
  hasUserUpvoted?: boolean
  report?: ReviewReport
  companyResponse?: CompanyResponse
  certificates?: number
  firmCount?: number
  payoutStatus?: string
  fundedStatus?: boolean
  proofImages?: ProofImage[]
  tradingStats?: {
    winRate?: number
    avgWin?: number
    avgLoss?: number
    totalTrades?: number
    profitFactor?: number
  }
  socialLinks?: SocialLinks
}

// Sample data for the reviewer profile sidebar
const sampleReviewerStats = {
  totalReviews: 8,
  averageRating: 3.7,
  fundedAccounts: 3,
  receivedPayouts: 2,
  joinedDate: "Jan 2024",
}

const samplePreviousReviews = [
  {
    id: "prev1",
    companyName: "Alpha Trading",
    date: "Feb 15, 2025",
    rating: 4.5,
    content: "Great experience with Alpha Trading. The platform is intuitive and the support team is responsive.",
    accountSize: "$25k",
    fundedStatus: true,
    payoutStatus: "Yes",
  },
  {
    id: "prev2",
    companyName: "Beta Funds",
    date: "Jan 10, 2025",
    rating: 3.0,
    content: "Average experience. The platform works well but the rules are quite strict compared to other firms.",
    accountSize: "$50k",
    fundedStatus: true,
    payoutStatus: "Yes",
  },
  {
    id: "prev3",
    companyName: "Gamma Capital",
    date: "Dec 5, 2024",
    rating: 2.0,
    content: "Disappointing experience. The platform had technical issues and support was slow to respond.",
    accountSize: "$100k",
    fundedStatus: false,
    payoutStatus: "No",
  },
]

// Add this function at the top of the file, outside the component
const adjustNavbarZIndex = (lower: boolean) => {
  if (typeof document === "undefined") return

  // Target all possible navbar elements
  const navbarSelectors = [
    "nav",
    "header",
    ".navbar",
    '[class*="navbar"]',
    '[id*="navbar"]',
    '[class*="header"]',
    '[id*="header"]',
  ]

  navbarSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector)
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement
      if (lower) {
        // Store the original z-index if we haven't already
        if (!htmlEl.getAttribute("data-original-zindex")) {
          htmlEl.setAttribute("data-original-zindex", htmlEl.style.zIndex || "")
        }
        // Set to a low z-index
        htmlEl.style.zIndex = "10"
      } else {
        // Restore the original z-index
        const originalZIndex = htmlEl.getAttribute("data-original-zindex")
        if (originalZIndex !== null) {
          htmlEl.style.zIndex = originalZIndex
        } else {
          htmlEl.style.zIndex = "100" // Default fallback
        }
        // Remove the data attribute to ensure clean state for next time
        htmlEl.removeAttribute("data-original-zindex")
      }
    })
  })
}

// Add this function to check if we're in the browser
const isBrowser = () => typeof window !== "undefined"

// Status indicator component for funded and payout status
const StatusIndicator = ({ isPositive, label }: { isPositive: boolean; label: string }) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex items-center justify-center rounded-full w-6 h-6",
          isPositive ? "bg-green-500/20" : "bg-red-500/20",
        )}
      >
        {isPositive ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
      </div>
      <span className={cn("font-medium", isPositive ? "text-green-500" : "text-red-500")}>{label}</span>
    </div>
  )
}

// In the ReviewCard component, add the useNoise hook
export default function ReviewCard({
  id,
  authorId = "user123",
  authorName,
  authorAvatar,
  authorLocation,
  authorCountryCode = "us",
  date,
  rating,
  content,
  accountSize,
  accountType,
  tradingDuration,
  detailedRatings,
  likedAspect = "Not specified",
  dislikedAspect = "Not specified",
  upvotes,
  hasUserUpvoted = false,
  report,
  companyResponse,
  certificates = 0,
  firmCount = 0,
  payoutStatus = "No",
  fundedStatus = false,
  proofImages = [],
  tradingStats = {},
  socialLinks = {},
}: ReviewProps) {
  // Add the useNoise hook to control noise visibility
  const { hideNoise, showNoise } = useNoise()

  const [isUpvoted, setIsUpvoted] = useState(hasUserUpvoted)
  const [upvoteCount, setUpvoteCount] = useState(upvotes)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false)
  const [showProfileSidebar, setShowProfileSidebar] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [backdropVisible, setBackdropVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Reference to the sidebar element for animation
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Force noise to be hidden when sidebar or gallery is open
  useEffect(() => {
    if (showProfileSidebar || showFullscreenGallery || isClosing) {
      // Force noise to be hidden in these states
      hideNoise()
    } else {
      // Only show noise when everything is fully closed
      showNoise()
    }
  }, [showProfileSidebar, showFullscreenGallery, isClosing, hideNoise, showNoise])

  // Handle animation states
  useEffect(() => {
    if (showProfileSidebar) {
      // First show the backdrop
      setBackdropVisible(true)
      // Then after a small delay, slide in the sidebar
      setTimeout(() => {
        setSidebarVisible(true)
      }, 50)
    }
    // We'll handle the closing animation in the closeProfileSidebar function
  }, [showProfileSidebar])

  const handleUpvote = () => {
    if (isUpvoted) {
      setUpvoteCount((prev) => prev - 1)
      setIsUpvoted(false)
    } else {
      setUpvoteCount((prev) => prev + 1)
      setIsUpvoted(true)
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === proofImages.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? proofImages.length - 1 : prev - 1))
  }

  // Update the gallery and sidebar functions to ensure they properly hide/show noise
  const openGallery = (index: number) => {
    setCurrentImageIndex(index)
    setShowFullscreenGallery(true)
    document.body.style.overflow = "hidden"
    document.body.style.position = "fixed"
    document.body.style.width = "100%"
    adjustNavbarZIndex(true)
    hideNoise()
    console.log("Gallery opened - hiding noise")
  }

  const closeGallery = () => {
    setShowFullscreenGallery(false)
    document.body.style.overflow = ""
    document.body.style.position = ""
    document.body.style.width = ""

    // First restore the navbar z-index
    adjustNavbarZIndex(false)

    // Then show the noise
    setTimeout(() => {
      showNoise()
      console.log("Gallery closed - showing noise")
    }, 50)
  }

  // Update the openProfileSidebar function to properly disable scrolling and hide noise
  const openProfileSidebar = () => {
    // First hide the noise completely before showing the sidebar
    hideNoise()

    // Then set up the sidebar
    setShowProfileSidebar(true)
    document.body.style.overflow = "hidden"
    document.body.style.position = "fixed"
    document.body.style.width = "100%"
    document.body.style.top = `-${window.scrollY}px`
    adjustNavbarZIndex(true)
    console.log("Sidebar opened - hiding noise")
  }

  // Completely revised closeProfileSidebar function with a simpler approach
  const closeProfileSidebar = () => {
    // Set closing state to prevent noise from showing prematurely
    setIsClosing(true)

    // First hide both the sidebar and backdrop with animation
    setSidebarVisible(false)
    setBackdropVisible(false)

    // Keep the navbar z-index low until the animation is complete
    // We'll restore it at the exact same time as we hide the sidebar component

    // After animation completes (300ms), clean up everything at once
    setTimeout(() => {
      // Restore scrolling
      const scrollY = document.body.style.top
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
      document.body.style.top = ""
      window.scrollTo(0, Number.parseInt(scrollY || "0") * -1)

      // Hide the sidebar component AND restore navbar z-index in the same frame
      setShowProfileSidebar(false)
      adjustNavbarZIndex(false)

      // Wait a bit longer before showing noise to ensure everything is settled
      setTimeout(() => {
        setIsClosing(false)
        showNoise()
        console.log("Sidebar closed - showing noise")
      }, 50)
    }, 300) // Match this with the transition duration
  }

  // Generate stars based on rating
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-[#edb900]">
            ★
          </span>,
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="text-[#edb900]">
            ★
          </span>,
        )
      } else {
        stars.push(
          <span key={i} className="text-gray-400">
            ★
          </span>,
        )
      }
    }
    return stars
  }

  return (
    <>
      <Card className="w-full border-[rgba(237,185,0,0.2)] shadow-md bg-[#0f0f0f] text-white overflow-hidden">
        <CardHeader className="pb-2 flex flex-row items-start gap-4">
          <div className="flex flex-col items-center text-center w-[120px]">
            <button
              className="group cursor-pointer focus:outline-none flex flex-col items-center w-full"
              onClick={openProfileSidebar}
              aria-label="View reviewer profile"
            >
              <div className="flex justify-center w-full">
                <Avatar className="h-16 w-16 border-2 border-[#edb900] group-hover:border-white transition-colors">
                  <AvatarImage src={authorAvatar} alt={authorName} />
                  <AvatarFallback className="bg-[#edb900] text-[#0f0f0f] font-bold">
                    {authorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="mt-2 w-full">
                <p className="group-hover:text-[#edb900] transition-colors">{authorName}</p>
                {authorLocation && (
                  <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1">
                    <span className="inline-block w-4 h-3 overflow-hidden">
                      <img
                        src={`https://flagcdn.com/w20/${authorCountryCode.toLowerCase()}.png`}
                        alt={authorLocation}
                        className="w-full h-auto object-cover"
                      />
                    </span>
                    {authorLocation}
                  </p>
                )}
              </div>
            </button>

            {/* Social Icons */}
            <div className="flex items-center justify-center gap-2 mt-2 w-full">
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#edb900]"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#edb900]"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#edb900]"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#edb900]"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {socialLinks.website && (
                <a
                  href={socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#edb900]"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-gray-400 hover:text-black hover:bg-[#edb900] mt-8",
                isUpvoted && "text-black hover:bg-[#edb900]",
              )}
              onClick={handleUpvote}
            >
              <ThumbsUp className={cn("h-4 w-4 mr-1", isUpvoted && "fill-[#edb900]")} />
              Upvote {upvoteCount > 0 && `(${upvoteCount})`}
            </Button>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-start gap-1 cursor-help bg-gradient-to-b from-[rgba(237,185,0,0.1)] rounded-md p-1">
                        <div className="flex items-center justify-between w-full px-1 ">
                          <span className="text-xs text-gray-400">Overall Rating</span>
                          <Info className="h-3.5 w-3.5 text-gray-400 hover:text-[#edb900] transition-colors" />
                        </div>
                        <div className=" rounded-full px-3 flex items-center gap-2 transition-colors">
                          <div className="font-bold text-[#edb900] text-lg">{rating.toFixed(1)}</div>
                          <div className="text-xl">{renderStars(rating)}</div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-[#0f0f0f] border border-[#edb900] p-3 w-64">
                      <h4 className="text-[#edb900] mb-2">Detailed Ratings</h4>
                      <div className="space-y-2">
                        {detailedRatings.map((item, index) => (
                          <div key={index} className="flex items-center justify-between gap-2">
                            <span className="text-xs text-white">{item.category}</span>
                            <div className="flex items-center gap-1 text-[#edb900] text-xs">
                              {renderStars(item.value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#edb900] hover:text-black">
                  <Flag className="h-4 w-4 mr-1" />
                  Report
                </Button>
                <div className="text-gray-500 mx-1">|</div>
                <Calendar className="h-4 w-4 ml-3 mr-1" />
                {date}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-[#1a1a1a] rounded-md p-2 text-center">
                <p className="text-xs text-gray-400">Account Size</p>
                <p className="text-lg text-white">{accountSize}</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-md p-2 text-center">
                <p className="text-xs text-gray-400">Account Type</p>
                <p className="text-lg text-white">{accountType}</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-md p-2 text-center">
                <p className="text-xs text-gray-400">Trading Duration</p>
                <p className="text-lg text-white">{tradingDuration}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-[#1a1a1a] rounded-md p-2">
                <p className="text-xs text-gray-400 mb-1 text-center">Funded Status</p>
                <div className="flex justify-center">
                  <StatusIndicator isPositive={fundedStatus} label={fundedStatus ? "Funded" : "Not Funded"} />
                </div>
              </div>
              <div className="bg-[#1a1a1a] rounded-md p-2">
                <p className="text-xs text-gray-400 mb-1 text-center">Payout Status</p>
                <div className="flex justify-center">
                  <StatusIndicator
                    isPositive={payoutStatus === "Yes"}
                    label={payoutStatus === "Yes" ? "Received" : "No Payout"}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <p className="text-gray-200 leading-relaxed mb-4">{content}</p>

          {/* Most Liked and Disliked Aspects - Always show both in two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-[#1a1a1a] p-3 rounded-md">
              <h4 className="text-md font-[balboa] border-b border-[#edb900] pb-1 mb-2 inline-block">
                Most Liked Aspect
              </h4>
              <p className="text-sm text-gray-300">{likedAspect}</p>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-md">
              <h4 className="text-md font-[balboa] border-b border-[#edb900] pb-1 mb-2 inline-block">
                Most Disliked Aspect
              </h4>
              <p className="text-sm text-gray-300">{dislikedAspect}</p>
            </div>
          </div>

          {/* Proof Images Gallery - Moved below most liked/disliked aspects */}
          {proofImages.length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-[balboa] mb-2 border-b border-[#edb900] pb-1 inline-block">
                Proof & Certificates
              </h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {proofImages.map((image, index) => (
                  <button
                    key={image.id}
                    className="relative h-16 w-16 rounded-md overflow-hidden border border-[rgba(237,185,0,0.2)] hover:border-[#edb900] transition-colors"
                    onClick={() => openGallery(index)}
                  >
                    <Image
                      src={image.thumbnail || "/placeholder.svg"}
                      alt={image.caption || `Proof ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Report section as accordion */}
          {report && (
            <Accordion type="single" collapsible className="mt-6">
              <AccordionItem value="report" className="border border-red-500 bg-red-900/20 rounded-md overflow-hidden">
                <AccordionTrigger className="py-3 px-4 hover:bg-red-900/30 hover:no-underline">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <h4>Report: {report.reason}</h4>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-red-400 mb-1">Denied Amount</p>
                      <p className="text-sm text-white">{report.deniedAmount || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-red-400 mb-1">Reason</p>
                      <p className="text-sm text-white">{report.reason}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-red-400 mb-1">Summary</p>
                    <p className="text-sm text-gray-300">{report.description}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Company Response as Accordion */}
          {companyResponse && (
            <Accordion
              type="single"
              collapsible
              className="mt-6 border border-[rgba(237,185,0,0.2)] rounded-md overflow-hidden"
            >
              <AccordionItem value="company-response" className="border-b-0">
                <AccordionTrigger className="py-3 px-4 hover:bg-[rgba(237,185,0,0.03)] hover:no-underline">
                  <div className="flex items-center gap-2 text-[#edb900]">
                    <MessageSquare className="h-5 w-5" />
                    <span>Company Response</span>
                    <span className="text-xs text-gray-400 ml-2">{companyResponse.date}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 mt-4 pt-0">
                  <p className="text-sm text-gray-300 mb-2">{companyResponse.content}</p>
                  <p className="text-xs text-[#edb900]">
                    {companyResponse.responderName}, {companyResponse.position}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Fullscreen Gallery */}
      {showFullscreenGallery &&
        isBrowser() &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              backgroundColor: "black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "auto",
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={proofImages[currentImageIndex].fullImage || "/placeholder.svg"}
                alt={proofImages[currentImageIndex].caption || `Proof ${currentImageIndex + 1}`}
                fill
                className="object-contain"
              />

              <div className="absolute inset-0 flex items-center justify-between p-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-black/50 border-0 text-white hover:bg-black/70"
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-black/50 border-0 text-white hover:bg-black/70"
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 text-center">
                <p className="text-white text-sm">
                  {proofImages[currentImageIndex].caption || `Proof ${currentImageIndex + 1}`}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {currentImageIndex + 1} of {proofImages.length}
                </p>
              </div>

              <button
                className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                onClick={closeGallery}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>,
          document.body,
        )}

      {/* Backdrop and Sidebar Container */}
      {(showProfileSidebar || backdropVisible) &&
        isBrowser() &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              overflow: "hidden",
              pointerEvents: "auto",
            }}
          >
            {/* Backdrop with animation */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-200 ease-in-out"
              style={{
                opacity: backdropVisible ? 1 : 0,
                pointerEvents: backdropVisible ? "auto" : "none",
              }}
              onClick={closeProfileSidebar}
              aria-hidden="true"
            />

            {/* Sidebar with animation */}
            <div
              ref={sidebarRef}
              className="fixed top-0 bottom-0 right-0 w-full max-w-[40rem] bg-[#0f0f0f] text-white shadow-2xl transition-transform duration-250 ease-out"
              style={{
                transform: sidebarVisible ? "translateX(0)" : "translateX(100%)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                overflowY: "auto",
                zIndex: 100000,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-10 h-full flex flex-col">
                <div className="flex justify-between items-center mb-[75px]">
                  <h2 className="text-xl">Reviewer Profile</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeProfileSidebar}
                    className="text-gray-400 hover:text-white hover:text-black hover:bg-[#edb900]"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex flex-col items-center text-center mb-6">
                  <div className="flex justify-center w-full">
                    <Avatar className="h-24 w-24 border-2 border-[#edb900] mb-3">
                      <AvatarImage src={authorAvatar} alt={authorName} />
                      <AvatarFallback className="bg-[#edb900] text-[#0f0f0f] text-2xl font-bold">
                        {authorName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <h3 className="text-xl">{authorName}</h3>

                  {authorLocation && (
                    <p className="text-sm text-gray-400 flex items-center justify-center gap-1 mt-1">
                      <span className="inline-block w-4 h-3 overflow-hidden">
                        <img
                          src={`https://flagcdn.com/w20/${authorCountryCode.toLowerCase()}.png`}
                          alt={authorLocation}
                          className="w-full h-auto object-cover"
                        />
                      </span>
                      {authorLocation}
                    </p>
                  )}

                  {/* Social Icons */}
                  <div className="flex items-center justify-center gap-2 mt-2 w-full">
                    {socialLinks.instagram && (
                      <a
                        href={socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#edb900]"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                    {socialLinks.twitter && (
                      <a
                        href={socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#edb900]"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                    {socialLinks.facebook && (
                      <a
                        href={socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#edb900]"
                      >
                        <Facebook className="h-4 w-4" />
                      </a>
                    )}
                    {socialLinks.linkedin && (
                      <a
                        href={socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#edb900]"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {socialLinks.website && (
                      <a
                        href={socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#edb900]"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-[#1a1a1a] p-3 rounded-md text-center">
                    <p className="text-xs text-gray-400">Total Reviews</p>
                    <p className="font-semibold text-[#edb900] text-lg">{sampleReviewerStats.totalReviews}</p>
                  </div>
                  <div className="bg-[#1a1a1a] p-3 rounded-md text-center">
                    <p className="text-xs text-gray-400">Member Since</p>
                    <p className="font-semibold text-[#edb900]">{sampleReviewerStats.joinedDate}</p>
                  </div>
                  <div className="bg-[#1a1a1a] p-3 rounded-md text-center">
                    <p className="text-xs text-gray-400">Funded Accounts</p>
                    <div className="flex items-center justify-center mt-1">
                      <StatusIndicator
                        isPositive={sampleReviewerStats.fundedAccounts > 0}
                        label={sampleReviewerStats.fundedAccounts.toString()}
                      />
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] p-3 rounded-md text-center">
                    <p className="text-xs text-gray-400">Received Payouts</p>
                    <div className="flex items-center justify-center mt-1">
                      <StatusIndicator
                        isPositive={sampleReviewerStats.receivedPayouts > 0}
                        label={sampleReviewerStats.receivedPayouts.toString()}
                      />
                    </div>
                  </div>
                </div>

                <h4 className="text-lg font-semibold mb-3">Previous Reviews</h4>

                <div className="space-y-4 flex-1 overflow-y-auto">
                  {samplePreviousReviews.map((review) => (
                    <div key={review.id} className="bg-[#1a1a1a] rounded-md p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold">{review.companyName}</h5>
                        <div className="flex items-center">{renderStars(review.rating)}</div>
                      </div>

                      <p className="text-sm text-gray-300 line-clamp-2 mb-2">{review.content}</p>

                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <div
                              className={cn(
                                "flex items-center justify-center rounded-full w-4 h-4",
                                review.fundedStatus ? "bg-green-500/20" : "bg-red-500/20",
                              )}
                            >
                              {review.fundedStatus ? (
                                <Check className="h-2.5 w-2.5 text-green-500" />
                              ) : (
                                <X className="h-2.5 w-2.5 text-red-500" />
                              )}
                            </div>
                            <span className="ml-1 text-gray-400">{review.accountSize}</span>
                          </div>
                        </div>
                        <span className="text-gray-400">{review.date}</span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-[#edb900] hover:bg-gray-700"
                        onClick={() => window.open(`/review/${review.id}`, "_blank")}
                      >
                        View Full Review
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

