"use client"

/* eslint-disable */
import { useRouter } from "next/router"
import { useState, useContext } from "react"
import type { GetServerSideProps } from "next"
import { ArrowLeft, Check, Copy, Info, Calendar, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Tippy from "@tippyjs/react"
import "tippy.js/dist/tippy.css"
import "tippy.js/themes/light.css"
import Navbar from "@/components/Navbar"
import Noise from "@/components/Noise"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import ChallengeDetailsSidebar from "@/components/challenge-details-sidebar"
import { ModalContext } from "../_app"

// Using the same FontAwesome imports as in AllPropFirms
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons"
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons"
import { faStar } from "@fortawesome/free-solid-svg-icons"

// Define types for our data
interface PropFirm {
  id: number
  propfirm_name: string
  category?: string
  rating: number
  reviews_count: number
  likes?: number
  logo_url: string
  brand_colour: string
  isLiked?: boolean
  slug?: string
}

interface Challenge {
  id: number
  slug: string
  program_name: string
  size: string
  steps: string
  discount_price: number
  original_price: number
  loyalty_points: number
  prop_firm_id: number
  prop_firm: PropFirm
}

interface Discount {
  id: number
  discount_type: string
  description: string
  discount_code: string
  no_code: boolean
  expiry_date: string
  cashback_bonus: string | null
}

// Get server side props to fetch the challenge data
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params || {}

  try {
    // Get the absolute URL for the API endpoint
    const protocol = context.req.headers["x-forwarded-proto"] || "http"
    const host = context.req.headers.host
    const baseUrl = `${protocol}://${host}`

    console.log(`Fetching challenge data for slug: ${slug}`)

    // Use a direct approach instead of relying on the API
    // This is a temporary solution to bypass the API issue

    // Sample challenge data - replace with actual data from your database
    const challenge = {
      id: 1,
      slug: slug,
      program_name: "Alpha Pro - 2-Step 100K",
      size: "100K",
      steps: "2 Steps",
      discount_price: 397.6,
      original_price: 497.0,
      loyalty_points: 125,
      prop_firm_id: 1,
      prop_firm: {
        id: 1,
        propfirm_name: "BrightFunded",
        category: "Gold",
        rating: 4.6,
        reviews_count: 4,
        likes: 35,
        logo_url: "/placeholder.svg?height=40&width=40",
        brand_colour: "#0f0f0f",
      },
    }

    // Sample discount data
    const discounts = {
      limitedTimeOffers: [
        {
          id: 1,
          discount_type: "Limited Time",
          description: "20%OFF",
          discount_code: "WELCOME20",
          no_code: false,
          expiry_date: "2025-05-30",
          cashback_bonus: "5% cashback",
        },
      ],
      exclusiveOffers: [
        {
          id: 2,
          discount_type: "Exclusive",
          description: "10%OFF",
          discount_code: "EXCLUSIVE10",
          no_code: false,
          expiry_date: "2025-06-15",
          cashback_bonus: null,
        },
      ],
      reviewEarnOffers: [
        {
          id: 3,
          discount_type: "Review & earn",
          description: "15%OFF",
          discount_code: "REVIEW15",
          no_code: false,
          expiry_date: "2025-07-01",
          cashback_bonus: "10% cashback",
        },
      ],
    }

    return {
      props: {
        challenge,
        discounts,
      },
    }
  } catch (error) {
    console.error("Error fetching challenge:", error)
    return { notFound: true }
  }
}

export default function PropFirmChallengePage({
  challenge,
  discounts,
}: {
  challenge: Challenge
  discounts: {
    limitedTimeOffers: Discount[]
    exclusiveOffers: Discount[]
    reviewEarnOffers: Discount[]
  }
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const router = useRouter()
  const [userLikedFirms, setUserLikedFirms] = useState<Set<number>>(new Set())
  const [receiveLoyaltyPoints, setReceiveLoyaltyPoints] = useState(true)
  const [email, setEmail] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { setShowLoginModal } = useContext(ModalContext)
  const [termsAccepted, setTermsAccepted] = useState(true)

  // If the page is still loading the slug, show a simple loading state
  if (router.isFallback) {
    return <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">Loading...</div>
  }

  const propFirm = challenge.prop_firm
  const { limitedTimeOffers, exclusiveOffers, reviewEarnOffers } = discounts

  // Handle like toggle
  const handleLikeToggle = (firmId: number) => {
    setUserLikedFirms((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(firmId)) {
        newSet.delete(firmId)
      } else {
        newSet.add(firmId)
      }
      return newSet
    })
  }

  // Handle login modal
  const handleLoginModalOpen = () => {
    setShowLoginModal(true)
  }

  // Handle copy code
  const handleCopyCode = (code: string, discountId: number) => {
    navigator.clipboard.writeText(code)
    setCopiedCodes((prev) => ({ ...prev, [`${code}-${discountId}`]: true }))

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedCodes((prev) => ({ ...prev, [`${code}-${discountId}`]: false }))
    }, 2000)
  }

  // Handle opening the challenge details sidebar
  const handleShowDetails = () => {
    setIsSidebarOpen(true)
  }

  // Tooltip content
  const bonusTooltipContent = (
    <div className="font-medium">
      This cashback is applied when you write a review for the prop firm. Submit your review to earn the additional
      cashback.
    </div>
  )

  // Render discount card
  const renderDiscountCard = (offer: Discount) => (
    <div
      key={offer.id}
      className="bg-[#0f0f0f] border border-[rgba(237,185,0,0.3)] rounded-lg overflow-hidden discount-card mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 items-center">
        {/* Discount Description */}
        <div className="text-center">
          <div className="relative p-5 to-transparent rounded-lg border border-[rgba(237,185,0,0.15)]">
            <div className="flex flex-col items-center">
              <div className="text-5xl font-extrabold text-[#edb900] mb-1 leading-tight">{offer.description}</div>
              <div className="text-sm text-gray-300 mb-2">(on first purchase only)</div>

              {offer.cashback_bonus && (
                <Tippy content={bonusTooltipContent} theme="custom" placement="top" arrow={true}>
                  <div className="mt-2 w-full border-t border-[rgba(237,185,0,0.2)] pt-2 bg-gradient-to-b from-[rgba(237,185,0,0.1)] rounded-md relative">
                    <div className="absolute top-1 right-1">
                      <Info className="h-4 w-4 text-[#edb900] cursor-pointer" />
                    </div>
                    <div className="text-xs text-gray-400 pt-1">
                      Optional cashback:
                      <div className="flex items-center justify-center gap-1 text-[#edb900] text-sm font-medium mt-1">
                        {offer.cashback_bonus}
                      </div>
                    </div>
                  </div>
                </Tippy>
              )}
            </div>
          </div>
        </div>

        {/* Code */}
        <div className="flex justify-center">
          <div className="relative min-w-[150px] w-auto">
            <button
              className={`relative w-full bg-[#edb900] text-black font-medium rounded-md py-3 px-4 transition-all duration-300 shadow-md hover:shadow-lg ${
                copiedCodes[`${offer.discount_code}-${offer.id}`] ? "bg-green-500 scale-105" : "hover:brightness-110"
              }`}
              onClick={() => handleCopyCode(offer.discount_code, offer.id)}
            >
              <div className="flex items-center justify-center">
                <span className="font-bold tracking-wider mr-5">
                  {copiedCodes[`${offer.discount_code}-${offer.id}`] ? "COPIED!" : offer.discount_code}
                </span>
              </div>

              <div
                className={`absolute top-2 right-2 transition-all duration-300 ${
                  copiedCodes[`${offer.discount_code}-${offer.id}`] ? "opacity-100 scale-110" : "opacity-80"
                }`}
              >
                {copiedCodes[`${offer.discount_code}-${offer.id}`] ? (
                  <Check className="h-5 w-5 stroke-[3]" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </div>
            </button>

            <div className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                Ends:{" "}
                {new Date(offer.expiry_date).toLocaleDateString("en-US", {
                  month: "numeric",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white py-8 px-4">
      <Navbar />
      <Noise />
      {/* Main Content */}
      <main className="relative container z-20 max-w-[1280px] mt-[100px] mb-[100px] mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/" passHref>
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-[#1A1A1A]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl ml-4">Finish Checkout</h1>
        </div>

        <div className="grid md:grid-cols-[1fr_400px] gap-8">
          {/* Left Column - Product Details */}
          <div>
            <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
              <CardContent className="p-6">
                {/* Company Card - Using the prop firm card component from the first snippet */}
                {/* Company Card - Using the prop firm card component with fixed width */}
                <div
                  key={propFirm.id}
                  className="z-50 px-4 shadow-lg relative bg-[rgba(255,255,255,0.03)] rounded-[10px] 
             hover:bg-[#0f0f0f] py-3 hover:bg-gradient-to-r 
             hover:from-[rgba(237,185,0,0.5)] hover:to-[rgba(255,255,255,0.10)] 
             transition-transform duration-200 hover:scale-[1.03] cursor-pointer
             border border-[#2a2a2a] w-[300px]"
                >
                  <div className="flex">
                    <Tippy
                      content={
                        <span className="font-medium">
                          We use AI to categorize all the companies. You can learn more on our Evaluation process page.
                        </span>
                      }
                      placement="top"
                      delay={[100, 0]}
                      className="z-50"
                      theme="custom" // Apply the custom theme
                    >
                      <span
                        className={`absolute top-3 left-3 px-[5px] border text-xs rounded-[10px] font-[balboa]
          ${propFirm.category === "Gold" ? "text-[#efbf04] border-[#efbf04]" : ""}
          ${propFirm.category === "Platinum" ? "text-[#D9D9D9] border-[#D9D9D9]" : ""}
          ${propFirm.category === "Diamond" ? "text-[#c8bfe7] border-[#c8bfe7]" : ""}
          ${propFirm.category === "Silver" ? "text-[#c4c4c4] border-[#c4c4c4]" : ""}
          ${propFirm.category === "Copper" ? "text-[#c68346] border-[#c68346]" : ""}`}
                      >
                        {propFirm.category}
                      </span>
                    </Tippy>
                    <SignedOut>
                      <button
                        onClick={() => handleLoginModalOpen()}
                        className="absolute top-3 right-3 hover:animate-[heartbeat_1.5s_infinite_ease-in-out] z-60"
                        style={{ color: "rgba(237, 185, 0, 0.3)" }}
                      >
                        <FontAwesomeIcon icon={regularHeart} style={{ fontSize: "25px" }} />
                      </button>
                    </SignedOut>

                    <SignedIn>
                      <button
                        onClick={() => handleLikeToggle(propFirm.id)}
                        className={`absolute top-3 right-3 transition-all duration-200 ${
                          userLikedFirms.has(propFirm.id)
                            ? "text-[#EDB900] scale-105 hover:animate-[heartbeat_1.5s_infinite_ease-in-out]"
                            : "text-[rgba(237,185,0,0.3)] hover:text-[#EDB900] hover:animate-[heartbeat_1.5s_infinite_ease-in-out]"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={userLikedFirms.has(propFirm.id) ? solidHeart : regularHeart}
                          className="text-[25px]"
                        />
                      </button>
                    </SignedIn>
                  </div>
                  <Link href={`/prop-firms/${propFirm.slug || ""}`} passHref>
                    {/* Firm Logo & Info */}
                    <div className="flex justify-between">
                      <div
                        className="w-20 h-20 mb-2 flex items-center justify-center rounded-[10px] p-1 mt-[50px]"
                        style={{ backgroundColor: propFirm.brand_colour }}
                      >
                        <Image
                          src={propFirm.logo_url || "/placeholder.svg?height=40&width=40"}
                          alt={propFirm.propfirm_name}
                          width={48}
                          height={40}
                          style={{ maxHeight: "40px", width: "auto" }}
                        />
                      </div>

                      <div className="block mt-9 min-w-[150px] justify-center">
                        <h3 className="text-2xl text-white text-center">{propFirm.propfirm_name}</h3>
                        <p className="text-center text-2xl text-[#EDB900]">
                          <FontAwesomeIcon icon={faStar} className="text-lg" />
                          <span className="text-white"> {propFirm.rating}</span>
                        </p>
                        <p className="text-center text-xs text-black bg-yellow-500 px-2 py-[5px] rounded-[8px] mt-2 min-w-[80px] w-fit mx-auto">
                          {propFirm.reviews_count} reviews
                        </p>
                        <p className="absolute top-4 right-[45px] text-center text-xs text-white">{propFirm.likes} Likes</p>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Challenge Details Section - With border instead of gradient */}
                <div className="relative bg-[#0f0f0f] rounded-xl p-6 mb-6 overflow-hidden border border-[#2a2a2a] mt-6">
                  {/* Gold accent line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#edb900]"></div>

                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-medium text-white text-xl">Challenge Details</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#edb900] border border-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90 rounded-md px-4 flex items-center gap-1"
                      onClick={handleShowDetails}
                    >
                      Show All Details
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Program Name</span>
                      <span className="text-white font-medium">{challenge.program_name}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Size</span>
                      <span className="text-white font-medium">{challenge.size}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Steps</span>
                      <span className="text-white font-medium">{challenge.steps}</span>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-[#2a2a2a]">
                      <span className="text-gray-400">Discount Price</span>
                      <div className="text-right">
                        <div className="text-xl font-bold text-[#edb900]">${challenge.discount_price.toFixed(2)}</div>
                        <div className="text-sm text-gray-400 line-through">${challenge.original_price.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-400">Loyalty Points</span>
                      <div className="flex items-center gap-2 bg-gradient-to-r from-[#edb900]/20 to-transparent px-3 py-1 rounded-full">
                        <Image
                          src="/icons/logo_loyalty_points.png?height=20&width=20"
                          alt="Loyalty Points"
                          width={20}
                          height={20}
                        />
                        <span className="text-[#edb900] font-medium">{challenge.loyalty_points}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Offers Component - Restructured to show all types vertically */}
                <Card className="bg-[#0f0f0f] border-[#1a1a1a] mt-6">
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-4 text-white">Promotions Available for this Account</h3>

                    {/* Limited Time Offers Section */}
                    {limitedTimeOffers.length > 0 && (
                      <div className="mb-8">
                        <h4 className="text-lg font-medium text-[#edb900] mb-4 flex items-center">
                          <span className="bg-[#edb900] text-black px-3 py-1 rounded-md mr-2">Limited Time Offers</span>
                          <span className="text-sm text-gray-400">(Showing {limitedTimeOffers.length} results)</span>
                        </h4>

                        {limitedTimeOffers.map((offer) => renderDiscountCard(offer))}
                      </div>
                    )}

                    {/* Exclusive Offers Section */}
                    {exclusiveOffers.length > 0 && (
                      <div className="mb-8">
                        <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                          <span className="bg-[#1a1a1a] text-white px-3 py-1 rounded-md mr-2">Exclusive Offers</span>
                          <span className="text-sm text-gray-400">(Showing {exclusiveOffers.length} results)</span>
                        </h4>

                        {exclusiveOffers.map((offer) => renderDiscountCard(offer))}
                      </div>
                    )}

                    {/* Review & Earn Offers Section */}
                    {reviewEarnOffers.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                          <span className="bg-[#1a1a1a] text-white px-3 py-1 rounded-md mr-2">
                            Review & Earn Offers
                          </span>
                          <span className="text-sm text-gray-400">(Showing {reviewEarnOffers.length} results)</span>
                        </h4>

                        {reviewEarnOffers.map((offer) => renderDiscountCard(offer))}
                      </div>
                    )}

                    {/* No offers message */}
                    {limitedTimeOffers.length === 0 &&
                      exclusiveOffers.length === 0 &&
                      reviewEarnOffers.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          No promotions are currently available for this challenge.
                        </div>
                      )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Checkout Form */}
          <div>
            <Card className="bg-[#0f0f0f] border-[#1a1a1a] sticky top-[100px]">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2 text-white">
                      Would you like to receive loyalty points on this purchase?
                    </h3>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setReceiveLoyaltyPoints(true)}
                        className={
                          receiveLoyaltyPoints
                            ? "bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90 px-6"
                            : "bg-transparent border border-[#edb900] text-[#edb900] hover:bg-[#1a1a1a] px-6"
                        }
                      >
                        Yes
                      </Button>
                      <Button
                        onClick={() => setReceiveLoyaltyPoints(false)}
                        className={
                          !receiveLoyaltyPoints
                            ? "bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90 px-6"
                            : "bg-transparent border border-[#edb900] text-[#edb900] hover:bg-[#1a1a1a] px-6"
                        }
                      >
                        No
                      </Button>
                    </div>
                  </div>

                  {/* Notification about loyalty points */}
                  <div className="bg-[#1a1a1a] border-l-4 border-[#edb900] rounded-md p-3 flex items-start gap-3">
                    <div className="text-[#edb900] mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <p className="text-sm text-gray-300">
                      Note: In order to receive Loyalty Points you must upload documentation of your purchase through{" "}
                      <span className="text-[#edb900] font-medium">PropFirmFinder.com</span> within your user dashboard.
                    </p>
                  </div>

                  <Separator className="bg-[#1a1a1a]" />

                  {receiveLoyaltyPoints && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-white">
                          Email<span className="text-[#edb900]">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="mt-1 bg-[#1a1a1a] border-[#1a1a1a] focus-visible:ring-[#edb900]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="offers"
                        className="mt-1 text-[#edb900] border-gray-600 data-[state=checked]:bg-[#edb900] data-[state=checked]:text-[#0f0f0f]"
                      />
                      <Label htmlFor="offers" className="text-xs text-gray-300">
                        I would like to receive exclusive offers and valuable updates.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        className="mt-1 text-[#edb900] border-gray-600 data-[state=checked]:bg-[#edb900] data-[state=checked]:text-[#0f0f0f]"
                        defaultChecked
                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-xs text-gray-300">
                        By checking out, I agree to this website's{" "}
                        <Link href="#" className="text-[#edb900] hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="text-[#edb900] hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </Label>
                    </div>
                  </div>

                  <Tippy
                    content={
                      !termsAccepted
                        ? "Please accept the Terms of Service and Privacy Policy"
                        : receiveLoyaltyPoints && email.trim() === ""
                          ? "Please enter your email to receive loyalty points"
                          : ""
                    }
                    disabled={termsAccepted && (!receiveLoyaltyPoints || (receiveLoyaltyPoints && email.trim() !== ""))}
                    placement="top"
                    theme="custom"
                  >
                    <div className="w-full">
                      <Button
                        className="w-full bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90 py-6 text-base"
                        disabled={!termsAccepted || (receiveLoyaltyPoints && email.trim() === "")}
                        onClick={() => {
                          // Handle checkout logic here
                          console.log("Proceeding to checkout", { receiveLoyaltyPoints, email, termsAccepted })
                        }}
                      >
                        Proceed to checkout
                      </Button>
                    </div>
                  </Tippy>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Challenge Details Sidebar */}
        <ChallengeDetailsSidebar
          challenge={{
            id: challenge.id,
            firmId: challenge.prop_firm_id,
            firm: {
              id: propFirm.id,
              name: propFirm.propfirm_name,
              logo: propFirm.logo_url,
              color: propFirm.brand_colour,
              rating: propFirm.rating,
              reviews: propFirm.reviews_count,
              yearsInOperation: 5, // Default value
              availablePlatforms: ["MT4", "MT5", "cTrader"], // Default platforms
            },
            price: challenge.discount_price,
            originalPrice: challenge.original_price,
            accountSize: challenge.size,
            maxDrawdown: "10%", // Default value
            profitTarget: {
              step1: "8%", // Default value
              step2: "5%", // Default value
            },
            dailyLoss: "5%", // Default value
            programName: challenge.program_name,
            payoutOverview: {
              profitSplit: "80%", // Default value
              refundableFee: "No",
              payoutFrequency: "Weekly", // Default value
            },
            tradingOverview: [
              { label: "Max Leverage", value: "1:100" },
              { label: "News-Trading", value: "Yes" },
              { label: "Copy-Trading", value: "Yes" },
              { label: "EA's", value: "Allowed" },
              { label: "Weekend Holding", value: "Yes" },
              { label: "Overnight Holding", value: "Yes" },
            ],
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </main>
      <Toaster />
    </div>
  )
}
