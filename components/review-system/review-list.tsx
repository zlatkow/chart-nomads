/* eslint-disable */
"use client"

import type React from "react"

import { useState, useEffect, useRef, useContext } from "react"
import ReviewCard from "./review-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { getCountryCode } from "@/lib/utils/country-codes"
import Tippy from "@tippyjs/react"
import { useAuth } from "@clerk/nextjs"
import { ModalContext } from "../../pages/_app"

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

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface ReviewListProps {
  onOpenReviewModal: () => void
  companyName?: string
  companySlug?: string
  propfirmId?: number | null
  companyLogo?: string
  isLoading?: boolean
}

// Define the social links interface
interface SocialLinks {
  instagram?: string
  twitter?: string
  youtube?: string
  tiktok?: string
}

// Function to process proof images from different formats
const processProofImages = (proofImages: any): any[] => {
  if (!proofImages) return []

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

  // If it's already an array, return it
  if (Array.isArray(proofImages)) {
    return proofImages
  }

  return []
}

export default function ReviewList({
  onOpenReviewModal,
  companyName = "CHART NOMADS",
  companySlug,
  propfirmId: externalPropfirmId,
  companyLogo,
  isLoading: externalLoading = false,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<any[]>([])
  const [sortBy, setSortBy] = useState("newest")
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [animateOnce, setAnimateOnce] = useState(true)
  const [barWidths, setBarWidths] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })
  const [showAuthMessage, setShowAuthMessage] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [propfirmId, setPropfirmId] = useState<number | null>(externalPropfirmId || null)
  const [userHasReviewed, setUserHasReviewed] = useState(false)

  // Add these state variables inside the component
  const [averageRating, setAverageRating] = useState<number>(0)
  const [totalReviews, setTotalReviews] = useState<number>(0)
  const [ratingPercentages, setRatingPercentages] = useState<Record<number, number>>({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  })

  // Add this near the other state variables
  const { setShowLoginModal } = useContext(ModalContext)

  // Replace the existing useEffect that fetches propfirmId with this updated version that also fetches rating data
  useEffect(() => {
    // If we already have a propfirmId or no companySlug, skip this
    if (propfirmId !== null || !companySlug) {
      return
    }

    const fetchPropfirmId = async () => {
      try {
        console.log("Fetching propfirm ID for slug:", companySlug)

        // Query the prop_firms table to get the ID and rating data for the given slug
        const { data, error } = await supabase
          .from("prop_firms")
          .select(
            "id, rating, reviews_count, 1_star_reviews, 2_star_reviews, 3_star_reviews, 4_star_reviews, 5_star_reviews",
          )
          .eq("slug", companySlug)
          .single()

        if (error) {
          console.error("Error fetching propfirm ID:", error)
          return
        }

        if (data) {
          console.log("Found propfirm ID:", data.id, "for slug:", companySlug)
          setPropfirmId(data.id)

          // Set the rating data from the database
          setAverageRating(data.rating || 0)
          setTotalReviews(data.reviews_count || 0)

          // Set the rating percentages from the database
          setRatingPercentages({
            5: data["5_star_reviews"] || 0,
            4: data["4_star_reviews"] || 0,
            3: data["3_star_reviews"] || 0,
            2: data["2_star_reviews"] || 0,
            1: data["1_star_reviews"] || 0,
          })

          // Set the bar widths directly from the percentages
          setBarWidths({
            5: data["5_star_reviews"] || 0,
            4: data["4_star_reviews"] || 0,
            3: data["3_star_reviews"] || 0,
            2: data["2_star_reviews"] || 0,
            1: data["1_star_reviews"] || 0,
          })
        } else {
          console.error("Could not find propfirm ID for slug:", companySlug)
        }
      } catch (error) {
        console.error("Exception when fetching propfirm ID:", error)
      }
    }

    fetchPropfirmId()
  }, [companySlug, propfirmId])

  // Add this effect to fetch rating data when propfirmId changes or is provided externally
  useEffect(() => {
    if (propfirmId === null) {
      return
    }

    const fetchRatingData = async () => {
      try {
        // Query the prop_firms table to get the rating data for the given ID
        const { data, error } = await supabase
          .from("prop_firms")
          .select(
            "rating, reviews_count, 1_star_reviews, 2_star_reviews, 3_star_reviews, 4_star_reviews, 5_star_reviews",
          )
          .eq("id", propfirmId)
          .single()

        if (error) {
          console.error("Error fetching rating data:", error)
          return
        }

        if (data) {
          console.log("Found rating data for propfirm ID:", propfirmId)

          // Set the rating data from the database
          setAverageRating(data.rating || 0)
          setTotalReviews(data.reviews_count || 0)

          // Set the rating percentages from the database
          setRatingPercentages({
            5: data["5_star_reviews"] || 0,
            4: data["4_star_reviews"] || 0,
            3: data["3_star_reviews"] || 0,
            2: data["2_star_reviews"] || 0,
            1: data["1_star_reviews"] || 0,
          })

          // Set the bar widths directly from the percentages
          setBarWidths({
            5: data["5_star_reviews"] || 0,
            4: data["4_star_reviews"] || 0,
            3: data["3_star_reviews"] || 0,
            2: data["2_star_reviews"] || 0,
            1: data["1_star_reviews"] || 0,
          })
        }
      } catch (error) {
        console.error("Exception when fetching rating data:", error)
      }
    }

    fetchRatingData()
  }, [propfirmId])

  // Update propfirmId if externalPropfirmId changes
  useEffect(() => {
    if (externalPropfirmId !== undefined && externalPropfirmId !== null) {
      setPropfirmId(externalPropfirmId)
    }
  }, [externalPropfirmId])

  // Fetch reviews from Supabase
  useEffect(() => {
    // If we're still loading externally, don't fetch reviews yet
    if (externalLoading) {
      console.log("External loading is true, waiting...")
      return
    }

    // If propfirmId is undefined or null, don't fetch reviews
    if (propfirmId === null) {
      console.log("propfirmId is null or undefined:", propfirmId)
      setIsLoading(false) // Important: Set loading to false even when there's no propfirmId
      return
    }

    console.log("Fetching reviews for propfirmId:", propfirmId)
    setIsLoading(true)

    const fetchReviews = async () => {
      try {
        console.log("Starting to fetch reviews for prop_firm:", propfirmId)

        const { data: reviewsData, error: reviewsError } = await supabase
          .from("propfirm_reviews")
          .select("*")
          .eq("prop_firm", propfirmId)
          .eq("review_status", "published")
          .order("created_at", { ascending: false }) // Sort by newest first by default

        if (reviewsError) {
          console.error("Error fetching reviews:", reviewsError)
          setReviews([])
          setIsLoading(false)
          return
        }

        console.log(`Found ${reviewsData.length} reviews for prop_firm ${propfirmId}`)

        // Process each review to get user data
        const processedReviews = await Promise.all(
          reviewsData.map(async (review) => {
            // 2. For each review, fetch the user data using the reviewer ID
            let userData = null
            let authorName = "Anonymous"
            const socialLinks: SocialLinks = {}
            let authorLocation = ""
            let authorCountryCode = "us"
            let profileImageUrl = "/placeholder.svg?height=100&width=100" // Default avatar

            if (review.reviewer && review.reviewer.startsWith("user_")) {
              console.log("Processing reviewer:", review.reviewer)

              try {
                // Query the users table with the FULL reviewer ID
                const { data: user, error: userError } = await supabase
                  .from("users")
                  .select(
                    "id, first_name, last_name, country, instagram_handle, x_handle, youtube_handle, tiktok_handle, country_code",
                  )
                  .eq("id", review.reviewer)
                  .single()

                if (userError) {
                  console.error("Error fetching user data:", userError)
                }

                if (!userError && user) {
                  userData = user
                  console.log("Found user data:", user.first_name, user.last_name)

                  // Create author name from first and last name
                  if (userData.first_name || userData.last_name) {
                    authorName = `${userData.first_name || ""} ${userData.last_name || ""}`.trim()
                  } else {
                    authorName = review.reviewer.replace("user_", "User ")
                  }

                  // Set location data if available
                  authorLocation = userData.country || ""
                  authorCountryCode = userData.country_code || getCountryCode(userData.country)

                  // Add social links only if the handles exist
                  if (userData.instagram_handle) {
                    socialLinks.instagram = `https://instagram.com/${userData.instagram_handle}`
                  }
                  if (userData.x_handle) {
                    socialLinks.twitter = `https://x.com/${userData.x_handle}`
                  }
                  if (userData.youtube_handle) {
                    // YouTube handles can be in different formats
                    socialLinks.youtube = userData.youtube_handle.includes("youtube.com")
                      ? userData.youtube_handle
                      : `https://youtube.com/@${userData.youtube_handle.replace("@", "")}`
                    console.log("Added YouTube link:", socialLinks.youtube)
                  }
                  if (userData.tiktok_handle) {
                    // TikTok handles can be in different formats
                    socialLinks.tiktok = userData.tiktok_handle.includes("tiktok.com")
                      ? userData.tiktok_handle
                      : `https://tiktok.com/@${userData.tiktok_handle.replace("@", "")}`
                    console.log("Added TikTok link:", socialLinks.tiktok)
                  }

                  // NEW CODE: Try to fetch the Clerk profile image
                  try {
                    const clerkProfileResponse = await fetch(`/api/user-profile?userId=${review.reviewer}`)
                    if (clerkProfileResponse.ok) {
                      const clerkProfileData = await clerkProfileResponse.json()
                      if (clerkProfileData.profileImageUrl) {
                        profileImageUrl = clerkProfileData.profileImageUrl
                        console.log("Found Clerk profile image for user:", review.reviewer)
                      }
                    }
                  } catch (error) {
                    console.error("Error fetching Clerk profile:", error)
                  }
                } else {
                  // Fallback to formatted user ID if user data fetch fails
                  authorName = review.reviewer.replace("user_", "User ")
                  console.log("No user data found, using fallback name:", authorName)

                  // Even if we don't have user data from Supabase, try to get Clerk profile
                  try {
                    const clerkProfileResponse = await fetch(`/api/user-profile?userId=${review.reviewer}`)
                    if (clerkProfileResponse.ok) {
                      const clerkProfileData = await clerkProfileResponse.json()
                      if (clerkProfileData.profileImageUrl) {
                        profileImageUrl = clerkProfileData.profileImageUrl
                        console.log("Found Clerk profile image for user:", review.reviewer)
                      }

                      // If we have first/last name from Clerk but not from Supabase
                      if (clerkProfileData.firstName || clerkProfileData.lastName) {
                        authorName = `${clerkProfileData.firstName || ""} ${clerkProfileData.lastName || ""}`.trim()
                        if (!authorName) {
                          authorName = review.reviewer.replace("user_", "User ")
                        }
                      }
                    }
                  } catch (error) {
                    console.error("Error fetching Clerk profile:", error)
                  }
                }
              } catch (err) {
                console.error("Exception when fetching user data:", err)
                // Fallback to formatted user ID if user data fetch fails
                authorName = review.reviewer.replace("user_", "User ")

                // Try to get Clerk profile even if Supabase fetch failed
                try {
                  const clerkProfileResponse = await fetch(`/api/user-profile?userId=${review.reviewer}`)
                  if (clerkProfileResponse.ok) {
                    const clerkProfileData = await clerkProfileResponse.json()
                    if (clerkProfileData.profileImageUrl) {
                      profileImageUrl = clerkProfileData.profileImageUrl
                      console.log("Found Clerk profile image for user:", review.reviewer)
                    }

                    // If we have first/last name from Clerk
                    if (clerkProfileData.firstName || clerkProfileData.lastName) {
                      authorName = `${clerkProfileData.firstName || ""} ${clerkProfileData.lastName || ""}`.trim()
                      if (!authorName) {
                        authorName = review.reviewer.replace("user_", "User ")
                      }
                    }
                  }
                } catch (error) {
                  console.error("Error fetching Clerk profile:", error)
                }
              }
            } else {
              console.log("Reviewer ID not in expected format:", review.reviewer)
            }

            console.log("Social links for review:", review.id, socialLinks)

            // Process proof images
            const processedProofs = processProofImages(review.proofs)
            console.log("Processed proof images for review:", review.id, processedProofs)

            // Process problem report data correctly
            let problemReport = null
            if (review.reported_issues && review.problem_report) {
              // If problem_report is a string (JSON), parse it
              if (typeof review.problem_report === "string") {
                try {
                  problemReport = JSON.parse(review.problem_report)
                } catch (e) {
                  console.error("Failed to parse problem report:", e)
                }
              } else {
                // If it's already an object, use it directly
                problemReport = review.problem_report
              }
            }

            // Create a legacy report object for backward compatibility
            const legacyReport = review.reported_issues
              ? {
                  reason: review.problem_report?.reportReason || "Issue Reported",
                  description:
                    review.problem_report?.reportDescription ||
                    review.problem_report?.breachDetails ||
                    review.problem_report?.payoutDenialDetails ||
                    "No details provided",
                  deniedAmount: review.problem_report?.deniedAmount || "N/A",
                }
              : null

            // 3. Map the review data to the format expected by ReviewCard
            return {
              id: review.id,
              authorId: review.reviewer || "",
              authorName: authorName,
              authorAvatar: profileImageUrl, // Use the Clerk profile image
              authorLocation: authorLocation,
              authorCountryCode: authorCountryCode,
              date: new Date(review.created_at || new Date()).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              rating: review.overall_rating || 0,
              content: review.detailed_review || "",
              accountSize: review.account_size || "",
              accountType: review.account_type || "",
              tradingDuration: review.trading_period || "",
              detailedRatings: [
                { category: "Trading Conditions", value: review.trading_conditions_rating || 0 },
                { category: "Dashboard/UX", value: review.dashboard_ux_rating || 0 },
                { category: "Customer Support", value: review.customer_support_rating || 0 },
                { category: "Education & Community", value: review.education_community_rating || 0 },
                { category: "Inner processes", value: review.inner_processes_rating || 0 },
              ].filter((rating) => rating.value > 0),
              likedAspect: review.most_liked_aspect || "",
              dislikedAspect: review.most_disliked_aspect || "",
              upvotes: review.upvotes_count || 0,
              hasUserUpvoted: false,
              reported_issues: review.reported_issues || false,
              problem_report: problemReport,
              report: legacyReport,
              companyResponse: null,
              certificates: 0,
              firmCount: 0,
              payoutStatus: review.received_payout === "Yes" ? "Yes" : "No",
              fundedStatus: review.funded_status === "Yes" ? "Yes" : "No",
              tradingStats: {
                winRate: 0,
                avgWin: 0,
                avgLoss: 0,
                totalTrades: 0,
                profitFactor: 0,
              },
              socialLinks: socialLinks,
              proofImages: processedProofs,
            }
          }),
        )

        setReviews(processedReviews)
      } catch (error) {
        console.error("Error in fetchReviews:", error)
        setReviews([])
      } finally {
        console.log("Finished fetching reviews, setting isLoading to false")
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [propfirmId, externalLoading])

  // Add useAuth hook to get current user ID
  const { userId } = useAuth()

  // Check if the current user has already reviewed this prop firm
  useEffect(() => {
    if (!userId || !propfirmId) return

    const checkUserReview = async () => {
      try {
        const { data, error } = await supabase
          .from("propfirm_reviews")
          .select("id")
          .eq("prop_firm", propfirmId)
          .eq("reviewer", userId)
          .limit(1)

        if (error) {
          console.error("Error checking user review:", error)
          return
        }

        setUserHasReviewed(data && data.length > 0)
        console.log("User has already reviewed:", data && data.length > 0)
      } catch (error) {
        console.error("Exception when checking user review:", error)
      }
    }

    checkUserReview()
  }, [userId, propfirmId])

  // Update the useEffect that handles animation to use ratingPercentages instead of calculating them
  useEffect(() => {
    // Determine if we're in a loading state (either external or internal)
    const isCurrentlyLoading = isLoading || externalLoading

    if (isCurrentlyLoading) {
      // Keep bar widths at 0 during loading
      setBarWidths({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })
      return
    }

    // Start with zero width
    setBarWidths({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })

    // Animate to actual percentages after a short delay
    const timer = setTimeout(() => {
      setBarWidths(ratingPercentages)

      // Disable animation after it completes
      const disableTimer = setTimeout(() => {
        setAnimateOnce(false)
      }, 1000)

      return () => clearTimeout(disableTimer)
    }, 100)

    return () => clearTimeout(timer)
  }, [ratingPercentages, isLoading, externalLoading]) // Update when ratingPercentages or loading states change

  // Also update the useEffect that updates bar widths without animation
  useEffect(() => {
    // Determine if we're in a loading state (either external or internal)
    const isCurrentlyLoading = isLoading || externalLoading

    if (!animateOnce && !isCurrentlyLoading) {
      setBarWidths(ratingPercentages)
    }
  }, [ratingPercentages, animateOnce, isLoading, externalLoading])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAuthMessage(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Add the shimmer animation to the document
  useEffect(() => {
    if (typeof document !== "undefined") {
      const style = document.createElement("style")
      style.textContent = shimmerAnimation
      document.head.appendChild(style)

      return () => {
        document.head.removeChild(style)
      }
    }
  }, [])

  const handleSort = (value: string) => {
    setSortBy(value)
    const sortedReviews = [...reviews]

    if (value === "newest") {
      sortedReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else if (value === "oldest") {
      sortedReviews.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } else if (value === "highest") {
      sortedReviews.sort((a, b) => b.rating - a.rating)
    } else if (value === "lowest") {
      sortedReviews.sort((a, b) => a.rating - b.rating)
    } else if (value === "most-upvoted") {
      // Use upvotes_count from the database if available, otherwise fall back to upvotes
      sortedReviews.sort((a, b) => (b.upvotes_count || b.upvotes || 0) - (a.upvotes_count || a.upvotes || 0))
    }

    setReviews(sortedReviews)
  }

  // Toggle auth message for non-signed-in users
  const toggleAuthMessage = () => {
    setShowAuthMessage(!showAuthMessage)
  }

  // Handle login button click
  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowLoginModal(true)
    setShowAuthMessage(false) // Close the auth message when opening the modal
  }

  // Handle signup button click
  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowLoginModal(true) // Use the same modal for signup
    setShowAuthMessage(false) // Close the auth message
  }

  // Determine if we're in a loading state (either external or internal)
  const showLoading = isLoading || externalLoading

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Community Reviews Header */}
      <div id="reviewBreakdownContainer" className="mb-[75px]">
        <h2 className="text-2xl font-bold text-[#edb900] mb-4">Community Reviews</h2>

        {showLoading ? (
          // Skeleton loading for review breakdown
          <div className="animate-pulse">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 bg-[rgba(237,185,0,0.1)] rounded-full"></div>
              <div className="h-8 w-16 bg-[rgba(237,185,0,0.1)] rounded"></div>
              <div className="h-5 w-40 bg-[rgba(255,255,255,0.05)] rounded"></div>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <div className="h-4 w-15 bg-[rgba(255,255,255,0.05)] rounded"></div>
                  <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className="h-full bg-[rgba(237,185,0,0.1)]" style={{ width: "0%" }}></div>
                  </div>
                  <div className="h-4 w-16 bg-[rgba(255,255,255,0.05)] rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-6 w-6 fill-[#edb900] text-[#edb900]" />
              <span className="text-3xl font-bold text-[#edb900]">{averageRating.toFixed(2)}</span>
              <span className="text-gray-400">Out of 5.00 • {totalReviews} reviews</span>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const percentage = ratingPercentages[star as keyof typeof ratingPercentages]

                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 w-15">{star}-star</span>
                    <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-[#edb900] ${animateOnce && !(isLoading || externalLoading) ? "transition-all duration-1000 ease-out" : ""}`}
                        style={{ width: `${barWidths[star]}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-16 text-left">{percentage.toFixed(0)}%</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between items-start mb-6">
        {/* Conditional rendering based on authentication status */}
        <SignedIn>
          {userHasReviewed ? (
            <Tippy
              content="You can review a company only once, you can update your review via your user dashboard."
              placement="bottom"
            >
              <div>
                <Button className="bg-[#edb900]/40 text-[#0f0f0f] cursor-not-allowed" disabled>
                  Leave a review
                </Button>
              </div>
            </Tippy>
          ) : (
            <Button className="bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90" onClick={onOpenReviewModal}>
              Leave a review
            </Button>
          )}
        </SignedIn>

        <SignedOut>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleAuthMessage}
              className="flex items-center justify-between w-auto bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90 px-4 py-2 rounded-md font-medium"
            >
              <span className="text-sm">Leave a review</span>
            </button>

            {showAuthMessage && (
              <div className="absolute top-full left-0 w-[700px] mt-2 bg-[#edb900] text-[#0f0f0f] p-4 rounded-lg z-10">
                <h3 className="font-bold text-xl mb-2">Action required!</h3>
                <p className="mb-4">
                  We take reviews on our platform very seriously, ensuring they are authentic and trustworthy. To
                  maintain this standard, only registered users can leave reviews.
                </p>
                <p>
                  Please{" "}
                  <button onClick={handleLoginClick} className="font-bold underline cursor-pointer">
                    Login
                  </button>{" "}
                  or{" "}
                  <button onClick={handleSignupClick} className="font-bold underline cursor-pointer">
                    Signup
                  </button>{" "}
                  to proceed with the review process.
                </p>
              </div>
            )}
          </div>
        </SignedOut>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Sort by:</span>
          <Select value={sortBy} onValueChange={handleSort}>
            <SelectTrigger className="w-[180px] bg-[#1a1a1a] border border-[#333333] text-gray-300">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border border-[#333333] text-gray-300">
              <SelectItem value="newest">Date (newest)</SelectItem>
              <SelectItem value="oldest">Date (oldest)</SelectItem>
              <SelectItem value="highest">Rating (highest)</SelectItem>
              <SelectItem value="lowest">Rating (lowest)</SelectItem>
              <SelectItem value="most-upvoted">Most upvoted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews Display */}
      {showLoading ? (
        // Skeleton loading UI
        <div className="space-y-6">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[rgba(237,185,0,0.1)]"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-[rgba(237,185,0,0.1)] rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-1/3 mb-4"></div>
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div key={star} className="w-4 h-4 bg-[rgba(237,185,0,0.1)] rounded-full"></div>
                      ))}
                    </div>
                    <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-full mb-2"></div>
                    <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-full mb-2"></div>
                    <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-3/4 mb-4"></div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="h-8 bg-[rgba(255,255,255,0.05)] rounded w-24"></div>
                      <div className="h-8 bg-[rgba(255,255,255,0.05)] rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} {...review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-400">No reviews found for {companyName}.</p>
          <p className="text-gray-500 mt-2">Be the first to leave a review!</p>
        </div>
      )}
    </div>
  )
}

