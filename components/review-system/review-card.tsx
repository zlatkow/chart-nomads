/* eslint-disable */
"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Calendar,
  X,
  ArrowLeft,
  ArrowRight,
  Instagram,
  Youtube,
  ChevronRight,
  Info,
  Check,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FaTiktok } from "react-icons/fa"
import { RiTwitterXFill } from "react-icons/ri"

// Add this import instead
import { createClient } from "@supabase/supabase-js"

// Add the useNoise import at the top of the file
import { useNoise } from "../../components/providers/noise-provider"

// Update the ReviewCard component to use the new UpvoteButton component
// Find the existing upvote button in the ReviewCard component and replace it with:

import UpvoteButton from "./upvote-button"
import ProblemReportDisplay from "./problem-report-display"

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

// Update the CompanyResponse interface to match the new structure
interface CompanyResponse {
  companyName: string
  companyLogo: string
  date: string
  content: string
  brandColor?: string
}

// Updated ProofImage interface to match the actual data structure
interface ProofImage {
  id?: string
  url: string
  label: string
}

interface SocialLinks {
  instagram?: string
  twitter?: string
  youtube?: string
  tiktok?: string
}

// 1. Update the interface to change fundedStatus from boolean to string
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
  problem_report?: any
  reported_issues?: boolean
  companyResponse?: CompanyResponse
  certificates?: number
  firmCount?: number
  payoutStatus?: string
  fundedStatus?: string // Changed from boolean to string
  proofImages?: ProofImage[] | Record<string, string> | any
  tradingStats?: {
    winRate?: number
    avgWin?: number
    avgLoss?: number
    totalTrades?: number
    profitFactor?: number
  }
  socialLinks?: SocialLinks
}

// Completely revised navbar handling function that also manages background color
const adjustNavbar = (lower: boolean) => {
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
        // Store the original z-index and background if we haven't already
        if (!htmlEl.getAttribute("data-original-zindex")) {
          htmlEl.setAttribute("data-original-zindex", htmlEl.style.zIndex || "")
          htmlEl.setAttribute("data-original-bg", htmlEl.style.backgroundColor || "")

          // Force the background to be solid black during the transition
          htmlEl.style.backgroundColor = "#0f0f0f"
          htmlEl.style.zIndex = "10"
        }
      } else {
        // Restore the original z-index and background
        const originalZIndex = htmlEl.getAttribute("data-original-zindex")
        const originalBg = htmlEl.getAttribute("data-original-bg")

        if (originalZIndex !== null) {
          htmlEl.style.zIndex = originalZIndex
        } else {
          htmlEl.style.zIndex = "100" // Default fallback
        }

        if (originalBg !== null && originalBg !== "") {
          htmlEl.style.backgroundColor = originalBg
        }

        // Remove the data attributes to ensure clean state for next time
        htmlEl.removeAttribute("data-original-zindex")
        htmlEl.removeAttribute("data-original-bg")
      }
    })
  })
}

// New function to only adjust navbar z-index
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
        htmlEl.style.zIndex = "10"
      } else {
        const originalZIndex = htmlEl.getAttribute("data-original-zindex")
        htmlEl.style.zIndex = originalZIndex || "100" // Default fallback
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

// Function to process proof images from different formats
const processProofImages = (proofImages: any): ProofImage[] => {
  if (!proofImages) return []

  // If it's already an array of ProofImage objects, return it
  if (Array.isArray(proofImages) && proofImages.length > 0 && typeof proofImages[0] === "object") {
    return proofImages
  }

  // If it's a string (JSON), try to parse it
  if (typeof proofImages === "string") {
    try {
      const parsed = JSON.parse(proofImages)
      return processProofImages(parsed)
    } catch (e) {
      console.error("Failed to parse proof images string:", e)
      return []
    }
  }

  // If it's an object with URLs as values (like {proof_of_funding: "url1", proof_of_purchase: "url2"})
  if (typeof proofImages === "object" && proofImages !== null && !Array.isArray(proofImages)) {
    return Object.entries(proofImages).map(([key, value], index) => ({
      id: `proof-${index}`,
      url: value as string,
      label: key
        .replace(/_/g, " ")
        .replace(/of/g, "of ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    }))
  }

  return []
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
  problem_report,
  reported_issues,
  companyResponse,
  certificates = 0,
  firmCount = 0,
  payoutStatus = "No",
  fundedStatus = "No",
  proofImages = [],
  tradingStats = {},
  socialLinks = {},
}: ReviewProps) {
  // Process proof images
  const [processedProofImages, setProcessedProofImages] = useState<ProofImage[]>([])

  // Add this state variable near the top of your component, with the other state variables
  const [profileImage, setProfileImage] = useState<string | null>(authorAvatar || null)
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
  const [scrollPosition, setScrollPosition] = useState(0)

  // Add these state variables inside the ReviewCard component, after the existing state variables:
  const [reviewerStats, setReviewerStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    fundedAccounts: 0,
    receivedPayouts: 0,
    joinedDate: "",
  })
  const [previousReviews, setPreviousReviews] = useState<any[]>([])
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  // Reference to the sidebar element for animation
  const sidebarRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)

  // Process proof images when the component mounts or proofImages changes
  useEffect(() => {
    setProcessedProofImages(processProofImages(proofImages))
  }, [proofImages])

  // Add this useEffect to fetch the profile image if needed
  useEffect(() => {
    // If we already have an avatar and it's not the placeholder, don't fetch again
    if (authorAvatar && !authorAvatar.includes("placeholder.svg")) {
      return
    }

    // Only try to fetch if authorId is a Clerk user ID
    if (authorId && authorId.startsWith("user_")) {
      // Create a flag to handle component unmounting
      let isMounted = true

      const fetchProfileImage = async () => {
        try {
          const response = await fetch(`/api/user-profile?userId=${authorId}`)

          if (!response.ok) {
            throw new Error(`Failed to fetch profile: ${response.status}`)
          }

          const data = await response.json()

          // Only update state if component is still mounted
          if (isMounted && data.profileImageUrl) {
            // Update the avatar image with the one from Clerk
            setProfileImage(data.profileImageUrl)
            console.log("Updated profile image for:", authorId)
          }
        } catch (error) {
          console.error("Error fetching Clerk profile image:", error)
        }
      }

      fetchProfileImage()

      // Cleanup function to prevent state updates on unmounted component
      return () => {
        isMounted = false
      }
    }
  }, [authorId, authorAvatar])

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
    setCurrentImageIndex((prev) => (prev === processedProofImages.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? processedProofImages.length - 1 : prev - 1))
  }

  // Update the gallery and sidebar functions to ensure they properly hide/show noise
  const openGallery = (index: number) => {
    // Save current scroll position
    setScrollPosition(window.scrollY)

    // First hide the noise completely before showing the gallery
    hideNoise()

    setCurrentImageIndex(index)
    setShowFullscreenGallery(true)

    // Fix the body at the current scroll position without shifting content
    document.body.style.top = `-${window.scrollY}px`
    document.body.style.position = "fixed"
    document.body.style.width = "100%"
    document.body.style.overflow = "hidden"
    document.body.style.left = "0"
    document.body.style.right = "0"

    // Lower navbar z-index but don't change its position
    adjustNavbarZIndex(true)
    console.log("Gallery opened - hiding noise")
  }

  // Update the closeGallery function to restore the exact position
  const closeGallery = () => {
    // Set closing state to prevent noise from showing prematurely
    setIsClosing(true)

    setShowFullscreenGallery(false)

    // Restore navbar z-index IMMEDIATELY
    adjustNavbarZIndex(false)
    console.log("Navbar z-index restored immediately")

    // Restore body styles
    document.body.style.position = ""
    document.body.style.width = ""
    document.body.style.overflow = ""
    document.body.style.top = ""
    document.body.style.left = ""
    document.body.style.right = ""

    // Restore scroll position immediately to prevent layout shift
    window.scrollTo(0, scrollPosition)

    // Wait a bit before showing noise to ensure smooth transition
    setTimeout(() => {
      setIsClosing(false)
      showNoise()
      console.log("Gallery closed - showing noise")
    }, 100)
  }

  // Update the openProfileSidebar function to properly disable scrolling and hide noise
  const openProfileSidebar = () => {
    // Save current scroll position
    setScrollPosition(window.scrollY)

    // First hide the noise completely before showing the sidebar
    hideNoise()

    // Then set up the sidebar
    setShowProfileSidebar(true)

    // Fix the body at the current scroll position without shifting content
    document.body.style.top = `-${window.scrollY}px`
    document.body.style.position = "fixed"
    document.body.style.width = "100%"
    document.body.style.overflow = "hidden"
    document.body.style.left = "0"
    document.body.style.right = "0"

    // Lower navbar z-index but don't change its position
    adjustNavbarZIndex(true)
    console.log("Sidebar opened - hiding noise")
  }

  // Completely revised closeProfileSidebar function with adjusted timing
  const closeProfileSidebar = () => {
    // Set closing state to prevent noise from showing prematurely
    setIsClosing(true)

    // First hide both the sidebar and backdrop with animation
    setSidebarVisible(false)
    setBackdropVisible(false)

    // Restore navbar z-index IMMEDIATELY - this is the key change
    adjustNavbarZIndex(false)
    console.log("Navbar z-index restored immediately")

    // After animation completes (300ms), clean up everything else
    setTimeout(() => {
      // Restore scrolling
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""

      // Restore scroll position immediately to prevent layout shift
      window.scrollTo(0, scrollPosition)

      // Hide the sidebar component
      setShowProfileSidebar(false)

      // Wait a bit longer before showing noise
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

  // First, add a new useEffect for keyboard navigation
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
  }, [showFullscreenGallery])

  // Add this useEffect to handle clicks outside the gallery
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!showFullscreenGallery) return

      // Check if the click is outside the gallery content
      if (galleryRef.current && !galleryRef.current.contains(e.target as Node)) {
        closeGallery()
      }
    }

    if (showFullscreenGallery) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showFullscreenGallery])

  // Add this useEffect to fetch reviewer profile data and previous reviews
  // Replace the line that imports supabase directly
  // import { supabase } "@/supabaseClient"

  // With this line that uses the hook you already have
  // import { useSupabaseClient } from '@supabase/auth-helpers-react'

  // And update the useEffect that fetches reviewer profile data
  // Replace the useSupabaseClient hook with a direct client initialization
  // const supabaseClient = useSupabaseClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project-url.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

  // Check if we have valid Supabase credentials
  const hasValidSupabaseConfig = supabaseUrl.includes("supabase.co") && supabaseAnonKey.length > 10
  console.log("Has valid Supabase config:", hasValidSupabaseConfig)

  // Debug Supabase connection
  console.log("Supabase URL:", supabaseUrl)
  console.log("Supabase Anon Key exists:", !!supabaseAnonKey)

  useEffect(() => {
    // Only fetch if we have a valid authorId and the sidebar is being opened
    if (!authorId || !showProfileSidebar) return

    const fetchReviewerProfile = async () => {
      // Skip Supabase queries if we don't have valid credentials
      if (!hasValidSupabaseConfig) {
        console.warn("Missing valid Supabase credentials - using mock data instead")

        // Set mock data for testing
        setReviewerStats({
          totalReviews: 3,
          averageRating: 4.5,
          fundedAccounts: 2,
          receivedPayouts: 1,
          joinedDate: "January 2023",
        })

        // Create mock previous reviews
        setPreviousReviews([
          {
            id: "mock-1",
            companyName: "Test Prop Firm",
            date: "Jan 15, 2023",
            rating: 4.5,
            content: "This is a great prop firm with excellent customer service and fast payouts.",
            accountSize: "$10,000",
            accountType: "Standard",
            tradingDuration: "30 days",
            fundedStatus: true,
            payoutStatus: true,
            likedAspect: "Fast customer service",
            dislikedAspect: "High monthly fee",
            proofImages: [],
            prop_firm: { id: "mock-firm-1", slug: "test-prop-firm" },
          },
          {
            id: "mock-2",
            companyName: "Another Firm",
            date: "Mar 22, 2023",
            rating: 3.5,
            content: "Decent firm but slow verification process.",
            accountSize: "$25,000",
            accountType: "Swing",
            tradingDuration: "45 days",
            fundedStatus: true,
            payoutStatus: false,
            likedAspect: "Good platform",
            dislikedAspect: "Slow verification",
            proofImages: [],
            prop_firm: { id: "mock-firm-2", slug: "another-firm" },
          },
        ])

        setIsLoadingProfile(false)
        return
      }
      setIsLoadingProfile(true)
      try {
        // 1. Fetch user profile data
        const { data: userData, error: userError } = await supabaseClient
          .from("users")
          .select("member_since, total_reviews, funded_accounts_count, payouts_count")
          .eq("id", authorId)
          .single()

        if (userError) {
          console.error("Error fetching user profile data:", userError)
        } else if (userData) {
          // Format the member_since date to only show month and year
          const memberSince = userData.member_since
            ? new Date(userData.member_since).toLocaleDateString("en-US", { month: "long", year: "numeric" })
            : "Unknown"

          setReviewerStats({
            totalReviews: userData.total_reviews || 0,
            averageRating: 0, // We'll calculate this from reviews
            fundedAccounts: userData.funded_accounts_count || 0,
            receivedPayouts: userData.payouts_count || 0,
            joinedDate: memberSince,
          })
        }

        // 2. Fetch user's previous reviews
        const { data: reviewsData, error: reviewsError } = await supabaseClient
          .from("propfirm_reviews")
          .select(`
    id,
    overall_rating,
    detailed_review,
    created_at,
    account_size,
    account_type,
    trading_period,
    funded_status,
    received_payout,
    most_liked_aspect,
    most_disliked_aspect,
    proofs,
    prop_firm(id, propfirm_name, slug)
  `)
          .eq("reviewer", authorId)
          .order("created_at", { ascending: false })
          .limit(3)

        // After the reviewsData query, add:
        console.log("Reviews data fetched:", reviewsData)
        console.log("Reviews error:", reviewsError)

        if (reviewsError) {
          console.error("Error fetching user reviews:", reviewsError)
        } else if (reviewsData && reviewsData.length > 0) {
          // Process reviews with minimal data
          const processedReviews = reviewsData.map((review) => {
            // Get the company name from the prop_firm relation
            let companyName = "Unknown Company"
            if (review.prop_firm) {
              // If prop_firm is an object with propfirm_name property
              if (typeof review.prop_firm === "object" && review.prop_firm !== null) {
                // Try to access the name using different possible property names
                // Use type assertion to avoid TypeScript errors
                const propFirmObj = review.prop_firm as Record<string, any>
                companyName = propFirmObj.propfirm_name || propFirmObj.name || "Unknown Company"

                // Debug log to see what properties are available
                console.log("Prop firm object:", propFirmObj)
              } else if (typeof review.prop_firm === "number") {
                // If prop_firm is just the ID, we can't get the name directly
                console.log("Prop firm is just an ID:", review.prop_firm)
              } else if (typeof review.prop_firm === "string") {
                // If prop_firm is a string, use it directly
                companyName = review.prop_firm
              }
            }

            // Process proof images if they exist
            let processedImages: ProofImage[] = []
            if (review.proof_images) {
              processedImages = processProofImages(review.proof_images)
            }

            return {
              id: review.id,
              companyName: companyName,
              date: new Date(review.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
              rating: review.overall_rating || 0,
              content: review.detailed_review || "",
              accountSize: review.account_size || "",
              accountType: review.account_type || "Standard",
              tradingDuration: review.trading_period || "N/A",
              fundedStatus: review.funded_status === "Yes",
              payoutStatus: review.received_payout === "Yes",
              likedAspect: review.liked_aspect || "Not specified",
              dislikedAspect: review.disliked_aspect || "Not specified",
              proofImages: processedImages,
              prop_firm: review.prop_firm,
            }
          })

          setPreviousReviews(processedReviews)
        } else {
          setPreviousReviews([])
        }
      } catch (error) {
        console.error("Error fetching reviewer profile:", error)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchReviewerProfile()
  }, [authorId, showProfileSidebar])

  // Add this log at the beginning of the ReviewCard component:
  useEffect(() => {
    console.log(`ReviewCard ${id} - Has company response:`, !!companyResponse)
    if (companyResponse) {
      console.log(`ReviewCard ${id} - Company response details:`, {
        companyName: companyResponse.companyName,
        date: companyResponse.date,
        contentLength: companyResponse.content.length,
      })
    }
  }, [id, companyResponse])

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
                {/* Update the Avatar component to use the profileImage state instead of authorAvatar */}
                <Avatar className="h-16 w-16 border-2 border-[rgba(237,185,0,0.2)] group-hover:border-[#edb900] transition-colors">
                  <AvatarImage
                    src={profileImage || authorAvatar || "/placeholder.svg?height=100&width=100"}
                    alt={authorName}
                  />
                  <AvatarFallback className="bg-[#edb900] text-[#0f0f0f] font-bold">
                    {authorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="mt-2 w-full">
                <p className="group-hover:text-[#edb900] transition-colors font-[balboa]">{authorName}</p>
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
                  <RiTwitterXFill className="h-4 w-4" />
                </a>
              )}
              {socialLinks.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#edb900]"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
              {socialLinks.tiktok && (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#edb900]"
                >
                  <FaTiktok className="h-4 w-4" />
                </a>
              )}
            </div>
            {/* Then replace the existing upvote button JSX with: */}
            <UpvoteButton reviewId={id} initialUpvotes={upvotes} initialUserUpvoted={hasUserUpvoted} className="mt-8" />
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
              {/* // 2. Update the StatusIndicator usage for fundedStatus */}
              <div className="bg-[#1a1a1a] rounded-md p-2">
                <p className="text-xs text-gray-400 mb-1 text-center">Funded Status</p>
                <div className="flex justify-center">
                  <StatusIndicator
                    isPositive={fundedStatus === "Yes"}
                    label={fundedStatus === "Yes" ? "Funded" : "Not Funded"}
                  />
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
          {processedProofImages.length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-[balboa] mb-2 border-b border-[#edb900] pb-1 inline-block">
                Proof & Certificates
              </h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {processedProofImages.map((image, index) => (
                  <button
                    key={image.id || `proof-${index}`}
                    className="relative h-16 w-16 rounded-md overflow-hidden border border-[rgba(237,185,0,0.2)] hover:border-[#edb900] transition-colors"
                    onClick={() => openGallery(index)}
                  >
                    <Image
                      src={image.url || "/placeholder.svg?height=100&width=100"}
                      alt={image.label || `Proof ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Problem Report Display */}
          {reported_issues && problem_report && <ProblemReportDisplay report={problem_report} />}

          {/* Company Response as Accordion */}
          {companyResponse &&
            (() => {
              console.log(`Rendering company response for review ${id}`)
              // Use the brand color from the company or default to #edb900
              const brandColor = companyResponse.brandColor || "#edb900"
              console.log(`Using brand color for company response: ${brandColor}`)

              return (
                <Accordion
                  type="single"
                  collapsible
                  className="mt-6 border-[1px] border-[#edb900] rounded-md overflow-hidden"
                >
                  <AccordionItem value="company-response" className="border-b-0">
                    <AccordionTrigger
                      className="py-2 px-4 hover:no-underline group"
                      style={{
                        backgroundColor: "rgba(237,185,0,0.05)", // 20% opacity
                      }}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-[10px] p-1"
                          style={{ backgroundColor: brandColor }}
                        >
                          {companyResponse.companyLogo && (
                            <img
                              src={companyResponse.companyLogo || "/placeholder.svg"}
                              alt={companyResponse.companyName}
                              className="w-full h-full object-contain rounded-full"
                            />
                          )}
                        </div>
                        <div className="flex flex-col items-start">
                          <div className="flex items-center">
                            <span className="font-[balboa]" style={{ color: "white" }}>
                              Reply from {companyResponse.companyName}
                            </span>
                          </div>
                          <span className="text-xs text-gray-300">{companyResponse.date}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 py-5" style={{ backgroundColor: "#0f0f0f" }}>
                      <div className="prose prose-sm max-w-none prose-p:text-gray-200 prose-headings:text-white prose-strong:text-white prose-strong:font-semibold">
                        {companyResponse.content.split("\n").map((paragraph, index) => (
                          <p key={index} className="mb-3 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )
            })()}
        </CardContent>
      </Card>

      {/* Fullscreen Gallery */}
      {showFullscreenGallery &&
        isBrowser() &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-auto bg-black/80 backdrop-blur-md transition-opacity duration-200 ease-in-out"
            onClick={closeGallery} // Close when clicking anywhere in the backdrop
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Container with max width/height to make images smaller */}
              <div
                ref={galleryRef}
                className="relative max-w-3xl max-h-[80vh] w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image container
              >
                <Image
                  src={processedProofImages[currentImageIndex].url || "/placeholder.svg"}
                  alt={processedProofImages[currentImageIndex].label || `Proof ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority={true}
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
                  {processedProofImages[currentImageIndex].label || `Proof ${currentImageIndex + 1}`}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {currentImageIndex + 1} of {processedProofImages.length}
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
              className="fixed top-0 bottom-0 right-0 w-full max-w-[40rem] bg-[#0f0f0f] text-white shadow-2xl transition-transform duration-500 ease-out"
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
                    {/* Update the Avatar in the sidebar to also use profileImage */}
                    <Avatar className="h-24 w-24 border-2 border-[#edb900] mb-3">
                      <AvatarImage
                        src={profileImage || authorAvatar || "/placeholder.svg?height=100&width=100"}
                        alt={authorName}
                      />
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
                        <RiTwitterXFill className="h-4 w-4" />
                      </a>
                    )}
                    {socialLinks.youtube && (
                      <a
                        href={socialLinks.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#edb900]"
                      >
                        <Youtube className="h-4 w-4" />
                      </a>
                    )}
                    {socialLinks.tiktok && (
                      <a
                        href={socialLinks.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#edb900]"
                      >
                        <FaTiktok className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Update the JSX in the sidebar to use the dynamic data */}
                {/* Replace the reviewer stats section with: */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-[#1a1a1a] p-3 rounded-md text-center">
                    <p className="text-xs text-gray-400">Total Reviews</p>
                    <p className="font-semibold text-[#edb900] text-lg">{reviewerStats.totalReviews}</p>
                  </div>
                  <div className="bg-[#1a1a1a] p-3 rounded-md text-center">
                    <p className="text-xs text-gray-400">Member Since</p>
                    <p className="font-semibold text-[#edb900]">{reviewerStats.joinedDate}</p>
                  </div>
                  <div className="bg-[#1a1a1a] p-3 rounded-md text-center">
                    <p className="text-xs text-gray-400">Funded Accounts</p>
                    <div className="flex items-center justify-center mt-1">
                      <StatusIndicator
                        isPositive={reviewerStats.fundedAccounts > 0}
                        label={reviewerStats.fundedAccounts.toString()}
                      />
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] p-3 rounded-md text-center">
                    <p className="text-xs text-gray-400">Received Payouts</p>
                    <div className="flex items-center justify-center mt-1">
                      <StatusIndicator
                        isPositive={reviewerStats.receivedPayouts > 0}
                        label={reviewerStats.receivedPayouts.toString()}
                      />
                    </div>
                  </div>
                </div>

                {/* Replace the previous reviews section with: */}
                <h4 className="text-lg font-semibold mb-3">Previous Reviews</h4>

                <div className="space-y-6 flex-1 overflow-y-auto">
                  {isLoadingProfile ? (
                    // Loading state
                    Array(3)
                      .fill(0)
                      .map((_, index) => (
                        <div key={`skeleton-${index}`} className="bg-[#1a1a1a] rounded-md p-3 animate-pulse">
                          <div className="h-5 bg-[rgba(237,185,0,0.1)] rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-full mb-2"></div>
                          <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-3/4 mb-4"></div>
                          <div className="h-8 bg-[rgba(255,255,255,0.05)] rounded w-full"></div>
                        </div>
                      ))
                  ) : previousReviews && previousReviews.length > 0 ? (
                    previousReviews.map((review) => (
                      <div key={review.id} className="w-full text-white mb-4">
                        <div className="flex items-start gap-3">
                          {/* Company logo square */}
                          <div className="flex flex-col items-center text-center">
                            <div className="h-16 w-16 bg-[#edb900] flex items-center justify-center rounded-md">
                              <span className="text-[#0f0f0f] font-bold text-2xl">
                                {review.companyName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs mt-1 text-[#edb900]">{review.companyName}</span>
                          </div>

                          {/* Rating and date */}
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-sm text-gray-400">Overall Rating</span>
                                <div className="flex items-center">
                                  <span className="text-[#edb900] font-bold mr-2">{review.rating.toFixed(1)}</span>
                                  <div className="text-sm">{renderStars(review.rating)}</div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-400 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {review.date}
                              </div>
                            </div>

                            {/* Account size and funded status */}
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div className="bg-[#1a1a1a] rounded-md p-2 text-center">
                                <p className="text-xs text-gray-400">Account Size</p>
                                <p className="text-sm text-white">{review.accountSize}</p>
                              </div>
                              <div className="bg-[#1a1a1a] rounded-md p-2 text-center">
                                <p className="text-xs text-gray-400">Funded Status</p>
                                <div className="flex items-center justify-center gap-1">
                                  <X className="h-3 w-3 text-red-500" />
                                  <span className="text-xs text-red-500">Not Funded</span>
                                </div>
                              </div>
                            </div>

                            {/* Account type and trading duration */}
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div className="bg-[#1a1a1a] rounded-md p-2 text-center">
                                <p className="text-xs text-gray-400">Account Type</p>
                                <p className="text-sm text-white">{review.accountType}</p>
                              </div>
                              <div className="bg-[#1a1a1a] rounded-md p-2 text-center">
                                <p className="text-xs text-gray-400">Trading Duration</p>
                                <p className="text-sm text-white">{review.tradingDuration}</p>
                              </div>
                            </div>

                            {/* Payout status */}
                            <div className="bg-[#1a1a1a] rounded-md p-2 text-center mt-2">
                              <p className="text-xs text-gray-400">Payout Status</p>
                              <div className="flex items-center justify-center gap-1">
                                <X className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-500">No Payout</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Review content */}
                        <div className="mt-3">
                          <p className="text-sm text-gray-200 leading-relaxed line-clamp-2">{review.content}</p>

                          {/* Most Liked and Disliked Aspects */}
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-[#1a1a1a] p-2 rounded-md">
                              <p className="text-xs text-gray-400 border-b border-[#edb900] pb-1 mb-1 inline-block">
                                Most Liked
                              </p>
                              <p className="text-xs text-gray-300 line-clamp-1">{review.likedAspect}</p>
                            </div>
                            <div className="bg-[#1a1a1a] p-2 rounded-md">
                              <p className="text-xs text-gray-400 border-b border-[#edb900] pb-1 mb-1 inline-block">
                                Most Disliked
                              </p>
                              <p className="text-xs text-gray-300 line-clamp-1">{review.dislikedAspect}</p>
                            </div>
                          </div>

                          {/* Proof Images Gallery - if any */}
                          {review.proofImages && review.proofImages.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-400 border-b border-[#edb900] pb-1 mb-1 inline-block">
                                Proof & Certificates
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {review.proofImages.slice(0, 3).map((image: ProofImage, index: number) => (
                                  <div
                                    key={image.id || `proof-${index}`}
                                    className="relative h-10 w-10 rounded-md overflow-hidden border border-[rgba(237,185,0,0.2)]"
                                  >
                                    <Image
                                      src={image.url || "/placeholder.svg?height=100&width=100"}
                                      alt={image.label || `Proof ${index + 1}`}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ))}
                                {review.proofImages.length > 3 && (
                                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-[#1a1a1a] text-[#edb900] text-xs">
                                    +{review.proofImages.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2 text-[#edb900] hover:bg-gray-800 h-8 text-xs"
                            onClick={() => {
                              // Check if we have the prop_firm ID
                              if (review.id) {
                                // Get the prop firm slug or ID
                                let propFirmIdentifier = ""

                                // Try to get the slug first (preferred)
                                if (typeof review.prop_firm === "object" && review.prop_firm !== null) {
                                  const propFirmObj = review.prop_firm as Record<string, any>
                                  propFirmIdentifier = propFirmObj.slug || propFirmObj.id
                                } else if (typeof review.prop_firm === "number") {
                                  propFirmIdentifier = review.prop_firm.toString()
                                }

                                // If we have a prop firm identifier, navigate to the page
                                if (propFirmIdentifier) {
                                  // Navigate to the prop firm page with reviews tab active and highlight this review
                                  window.open(
                                    `/prop-firm/${propFirmIdentifier}?tab=reviews&highlight=${review.id}`,
                                    "_blank",
                                  )
                                } else {
                                  // Fallback to just opening the review directly
                                  window.open(`/review/${review.id}`, "_blank")
                                }
                              }
                            }}
                          >
                            View Full Review <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-400 bg-[#1a1a1a] rounded-md">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-[#edb900]/50" />
                      No previous reviews found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

