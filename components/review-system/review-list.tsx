/* eslint-disable */
"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import ReviewCard from "./review-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { getCountryCode } from "@/lib/utils/country-codes"

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

// Calculate average rating
const calculateAverageRating = (reviews: any[]) => {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, review) => acc + (review.overall_rating || 0), 0)
  return sum / reviews.length
}

// Count ratings by star
const countRatingsByStars = (reviews: any[]) => {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

  reviews.forEach((review) => {
    const roundedRating = Math.round(review.overall_rating || 0)
    if (roundedRating >= 1 && roundedRating <= 5) {
      counts[roundedRating as keyof typeof counts]++
    }
  })

  return counts
}

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

  const averageRating = calculateAverageRating(reviews)
  const ratingCounts = countRatingsByStars(reviews)
  const totalReviews = reviews.length

  // Fetch propfirm ID if we have a slug but no ID
  useEffect(() => {
    // If we already have a propfirmId or no companySlug, skip this
    if (propfirmId !== null || !companySlug) {
      return
    }

    const fetchPropfirmId = async () => {
      try {
        console.log("Fetching propfirm ID for slug:", companySlug)

        // Query the prop_firms table to get the ID for the given slug
        const { data, error } = await supabase.from("prop_firms").select("id").eq("slug", companySlug).single()

        if (error) {
          console.error("Error fetching propfirm ID:", error)
          return
        }

        if (data) {
          console.log("Found propfirm ID:", data.id, "for slug:", companySlug)
          setPropfirmId(data.id)
        } else {
          console.error("Could not find propfirm ID for slug:", companySlug)
        }
      } catch (error) {
        console.error("Exception when fetching propfirm ID:", error)
      }
    }

    fetchPropfirmId()
  }, [companySlug, propfirmId])

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

        // 1. Fetch reviews for the specific propfirm
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("propfirm_reviews")
          .select("*")
          .eq("prop_firm", propfirmId)

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
                } else {
                  // Fallback to formatted user ID if user data fetch fails
                  authorName = review.reviewer.replace("user_", "User ")
                  console.log("No user data found, using fallback name:", authorName)
                }
              } catch (err) {
                console.error("Exception when fetching user data:", err)
                // Fallback to formatted user ID if user data fetch fails
                authorName = review.reviewer.replace("user_", "User ")
              }
            } else {
              console.log("Reviewer ID not in expected format:", review.reviewer)
            }

            console.log("Social links for review:", review.id, socialLinks)

            // 3. Map the review data to the format expected by ReviewCard
            return {
              id: review.id,
              authorId: review.reviewer || "",
              authorName: authorName,
              authorAvatar: "/placeholder.svg?height=100&width=100", // Default avatar
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
              upvotes: 0,
              hasUserUpvoted: false,
              report: review.reported_issues
                ? {
                    reason: "Payout Denial",
                    description: review.reported_issues || "No details provided",
                    deniedAmount: "N/A",
                  }
                : null,
              companyResponse: null,
              certificates: 0,
              firmCount: 0,
              payoutStatus: review.received_payout === "Yes" ? "Yes" : "No",
              fundedStatus: review.funded_status === "Yes" ? "Yes" : "No",
              proofImages: review.proofs
                ? typeof review.proofs === "string"
                  ? JSON.parse(review.proofs)
                  : review.proofs
                : [],
              tradingStats: {
                winRate: 0,
                avgWin: 0,
                avgLoss: 0,
                totalTrades: 0,
                profitFactor: 0,
              },
              socialLinks: socialLinks,
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

  // Calculate percentages
  const calculatePercentages = () => {
    const percentages: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

    Object.keys(ratingCounts).forEach((star) => {
      const starNum = Number.parseInt(star) as keyof typeof ratingCounts
      percentages[starNum] = totalReviews > 0 ? (ratingCounts[starNum] / totalReviews) * 100 : 0
    })

    return percentages
  }

  // Run animation on initial mount
  useEffect(() => {
    const percentages = calculatePercentages()

    // Start with zero width
    setBarWidths({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })

    // Animate to actual percentages after a short delay
    const timer = setTimeout(() => {
      setBarWidths(percentages)

      // Disable animation after it completes
      const disableTimer = setTimeout(() => {
        setAnimateOnce(false)
      }, 1000)

      return () => clearTimeout(disableTimer)
    }, 100)

    return () => clearTimeout(timer)
  }, [reviews]) // Update when reviews change

  // Update bar widths when reviews change (without animation)
  useEffect(() => {
    if (!animateOnce) {
      setBarWidths(calculatePercentages())
    }
  }, [reviews, animateOnce])

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
      sortedReviews.sort((a, b) => b.upvotes - a.upvotes)
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
    router.push("/login")
  }

  // Handle signup button click
  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push("/sign-up")
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
              <span className="text-3xl font-bold text-[#edb900]">{averageRating.toFixed(1)}</span>
              <span className="text-gray-400">Out of 5.00 • {totalReviews} reviews</span>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingCounts[star as keyof typeof ratingCounts]
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 w-15">{star}-star</span>
                    <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-[#edb900] ${animateOnce ? "transition-all duration-1000 ease-out" : ""}`}
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
          <Button className="bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90" onClick={onOpenReviewModal}>
            Leave a review
          </Button>
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

