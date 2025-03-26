"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import ReviewCard from "./review-card"
import ReviewModal from "./review-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

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

// Sample data for demonstration
const sampleReviews = [
  {
    id: "1",
    authorId: "alex123",
    authorName: "Alex Johnson",
    authorAvatar: "/placeholder.svg?height=100&width=100",
    authorLocation: "New York",
    authorCountryCode: "us",
    date: "March 15, 2025",
    rating: 4.5,
    content:
      "I have had the opportunity to try out several prop firms, and I can confidently say that this is one of the best in the industry. Everything from the customer support, to the fast distribution of credentials, down to the trader friendly rules is worth commending. What's more, is the maximum and daily drawdown of every of their accounts is 10% and 5% which is a significant improvement to other firms' 8% and 4%.",
    accountSize: "$10k",
    accountType: "2 Step",
    tradingDuration: "less than 1 month",
    detailedRatings: [
      { category: "Trading Conditions", value: 5 },
      { category: "Dashboard/UX", value: 5 },
      { category: "Customer Support", value: 5 },
      { category: "Education & Community", value: 4 },
      { category: "Inner processes", value: 4 },
    ],
    likedAspect:
      "Aside the great customer support and platform, the maximum and daily drawdown of every of their accounts is 10% and 5% which is a significant improvement to other firms' 8% and 4%",
    dislikedAspect:
      "Nothing significant to mention, but the education section could be expanded with more advanced strategies.",
    upvotes: 12,
    hasUserUpvoted: false,
    report: null,
    companyResponse: {
      responderName: "Sarah Miller",
      position: "Customer Support Manager",
      date: "March 16, 2025",
      content:
        "Thank you for your positive feedback, Alex! We're thrilled to hear that you're enjoying your experience with us. We work hard to provide the best possible conditions for our traders, and it's great to know that our efforts are appreciated. If you have any questions or need assistance in the future, please don't hesitate to reach out to our support team.",
    },
    certificates: 2,
    firmCount: 3,
    payoutStatus: "Yes",
    fundedStatus: true,
    proofImages: [
      {
        id: "proof1",
        thumbnail: "/placeholder.svg?height=100&width=100",
        fullImage: "/placeholder.svg?height=800&width=600",
        caption: "Account Statement",
      },
      {
        id: "proof2",
        thumbnail: "/placeholder.svg?height=100&width=100",
        fullImage: "/placeholder.svg?height=800&width=600",
        caption: "Trading Dashboard",
      },
      {
        id: "proof3",
        thumbnail: "/placeholder.svg?height=100&width=100",
        fullImage: "/placeholder.svg?height=800&width=600",
        caption: "Payout Confirmation",
      },
    ],
    tradingStats: {
      winRate: 68,
      avgWin: 2.3,
      avgLoss: 1.1,
      totalTrades: 124,
      profitFactor: 2.1,
    },
    socialLinks: {
      instagram: "https://instagram.com/alexjohnson",
      twitter: "https://twitter.com/alexjohnson",
      linkedin: "https://linkedin.com/in/alexjohnson",
    },
  },
  {
    id: "2",
    authorId: "zaid456",
    authorName: "Zaid",
    authorAvatar: "/placeholder.svg?height=100&width=100",
    authorLocation: "Jordan",
    authorCountryCode: "jo",
    date: "February 23, 2025",
    rating: 1.0,
    content:
      "I regret to say that my experience has been highly disappointing. After successfully passing their evaluation process and managing a $400,000 funded account, my account was abruptly terminated under false accusations. They claimed that I engaged in 'latency arbitrage,' which is completely untrue. I have never used automated trading, arbitrage strategies, or any exploitative methods. My trading approach involves holding positions for several hours to days, adhering to standard market conditions and risk management.",
    accountSize: "$400k",
    accountType: "2 Steps",
    tradingDuration: "3 months",
    detailedRatings: [
      { category: "User Friendliness", value: 1 },
      { category: "Payout Process", value: 1 },
      { category: "Customer Care", value: 1 },
      { category: "Trading Conditions", value: 1 },
    ],
    likedAspect: "The initial evaluation process was straightforward and the platform was easy to use.",
    dislikedAspect: "Fraudulent denials and poor communication when issues arise.",
    upvotes: 2,
    hasUserUpvoted: false,
    report: {
      reason: "Payout Denial",
      description:
        "I still haven't understood the reason, they quoted many things but only unclear answers come from them. Honestly it just feels like they had to breach to avoid keep paying out. I received two payouts from them, also never risked more than they allowed (2%) as they were saying on discord and never received any warning about risk or anything like that",
      deniedAmount: "N/A",
    },
    companyResponse: null,
    certificates: 1,
    firmCount: 0,
    payoutStatus: "No",
    fundedStatus: false,
    proofImages: [
      {
        id: "proof4",
        thumbnail: "/placeholder.svg?height=100&width=100",
        fullImage: "/placeholder.svg?height=800&width=600",
        caption: "Account Termination Email",
      },
      {
        id: "proof5",
        thumbnail: "/placeholder.svg?height=100&width=100",
        fullImage: "/placeholder.svg?height=800&width=600",
        caption: "Trading History",
      },
    ],
    tradingStats: {
      winRate: 62,
      avgWin: 1.8,
      avgLoss: 1.5,
      totalTrades: 87,
      profitFactor: 1.2,
    },
    socialLinks: {
      twitter: "https://twitter.com/zaid",
      facebook: "https://facebook.com/zaid",
    },
  },
]

// Calculate average rating
const calculateAverageRating = (reviews: typeof sampleReviews) => {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return sum / reviews.length
}

// Count ratings by star
const countRatingsByStars = (reviews: typeof sampleReviews) => {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

  reviews.forEach((review) => {
    const roundedRating = Math.round(review.rating)
    if (roundedRating >= 1 && roundedRating <= 5) {
      counts[roundedRating as keyof typeof counts]++
    }
  })

  return counts
}

interface ReviewListProps {
  onOpenReviewModal: () => void
  companyName?: string
  companyLogo?: string
}

export default function ReviewList({ onOpenReviewModal, companyName = "CHART NOMADS", companyLogo }: ReviewListProps) {
  const [reviews, setReviews] = useState(sampleReviews)
  const [sortBy, setSortBy] = useState("newest")
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [animateOnce, setAnimateOnce] = useState(true)
  const [barWidths, setBarWidths] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })
  const [showAuthMessage, setShowAuthMessage] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const averageRating = calculateAverageRating(reviews)
  const ratingCounts = countRatingsByStars(reviews)
  const totalReviews = reviews.length

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
  }, []) // Empty dependency array ensures this only runs once on mount

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

  // Simulate loading for demonstration purposes
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleSort = (value: string) => {
    setSortBy(value)
    // In a real app, you would sort the reviews based on the selected value
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

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Community Reviews Header */}
      <div id="reviewBreakdownContainer" className="mb-[75px]">
        <h2 className="text-2xl font-bold text-[#edb900] mb-4">Community Reviews</h2>

        {isLoading ? (
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
      {isLoading ? (
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
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} {...review} />
          ))}
        </div>
      )}

      {/* Review Modal - Only rendered for signed-in users */}
      <SignedIn>
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          companyName={companyName}
          companyLogo={companyLogo}
        />
      </SignedIn>
    </div>
  )
}

