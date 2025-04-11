/* eslint-disable */
"use client"

import { useRouter } from "next/router"
import { useState } from "react"
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

// Using the same FontAwesome imports as in AllPropFirms
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons"
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

  // If the page is still loading the slug, show a simple loading state
  if (router.isFallback) {
    return <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">Loading...</div>
  }

  const propFirm = challenge.prop_firm
  const { limitedTimeOffers, exclusiveOffers, reviewEarnOffers } = discounts

  // Handle copy code
  const handleCopyCode = (code: string, discountId: number) => {
    navigator.clipboard.writeText(code)
    setCopiedCodes((prev) => ({ ...prev, [`${code}-${discountId}`]: true }))

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedCodes((prev) => ({ ...prev, [`${code}-${discountId}`]: false }))
    }, 2000)
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
      {/* Main Content */}
      <main className="container mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/" passHref>
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-4">Finish Checkout</h1>
        </div>

        <div className="grid md:grid-cols-[1fr_400px] gap-8">
          {/* Left Column - Product Details */}
          <div>
            <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
              <CardContent className="p-6">
                {/* Company Card - Copied directly from AllPropFirms */}
                <div className="z-50 relative bg-[rgba(26,26,26,1)] rounded-[10px] border border-[#2a2a2a] overflow-hidden p-4 mb-6">
                  <div className="flex">
                    <span className="absolute top-3 left-3 px-[5px] border text-xs rounded-[10px] font-medium text-[#efbf04] border-[#efbf04]">
                      {propFirm.category || "Gold"}
                    </span>

                    <button className="absolute top-3 right-3 text-[rgba(237,185,0,0.3)]">
                      <span className="mr-1 text-xs">{propFirm.likes || 0} Likes</span>
                      <FontAwesomeIcon icon={regularHeart} style={{ fontSize: "18px" }} />
                    </button>

                    <div className="w-full mt-8 flex flex-col items-center">
                      <div className="w-16 h-16 bg-[#0a0a0a] rounded-md flex items-center justify-center mb-2">
                        <Image
                          src={propFirm.logo_url || "/placeholder.svg?height=40&width=40"}
                          alt={propFirm.propfirm_name}
                          width={40}
                          height={40}
                        />
                      </div>

                      <h3 className="text-xl text-center text-white">{propFirm.propfirm_name}</h3>

                      <p className="text-center text-lg">
                        <FontAwesomeIcon icon={faStar} className="text-[#EDB900]" />
                        <span className="text-white ml-1">{propFirm.rating}</span>
                      </p>

                      <p className="text-center text-xs text-black bg-[#EDB900] px-2 py-[5px] rounded-[8px] mt-1 min-w-[80px] w-fit mx-auto">
                        {propFirm.reviews_count} reviews
                      </p>
                    </div>
                  </div>
                </div>

                {/* Challenge Details Section - Creative design with brand colors */}
                <div className="relative bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] rounded-xl p-6 mb-6 overflow-hidden border border-[#2a2a2a]">
                  {/* Gold accent line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#edb900] via-[#c99b00] to-[#edb900]"></div>

                  {/* Gold corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-2 bg-[#edb900] rotate-45 origin-top-right"></div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-medium text-white text-xl">Challenge Details</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-[#edb900] border-[#edb900] hover:bg-[#edb900]/10 rounded-md px-4 flex items-center gap-1"
                    >
                      {showDetails ? "Hide Details" : "Show All Details"}
                      <ChevronRight
                        className={`h-4 w-4 transition-transform duration-200 ${showDetails ? "rotate-90" : ""}`}
                      />
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
                        <Image src="/images/logo_loyalty_points.png" alt="Loyalty Points" width={20} height={20} />
                        <span className="text-[#edb900] font-medium">{challenge.loyalty_points}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subtle gold pattern overlay */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNlZGI5MDAiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30 pointer-events-none"></div>
                </div>
              </CardContent>
            </Card>

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
                      <span className="bg-[#1a1a1a] text-white px-3 py-1 rounded-md mr-2">Review & Earn Offers</span>
                      <span className="text-sm text-gray-400">(Showing {reviewEarnOffers.length} results)</span>
                    </h4>

                    {reviewEarnOffers.map((offer) => renderDiscountCard(offer))}
                  </div>
                )}

                {/* No offers message */}
                {limitedTimeOffers.length === 0 && exclusiveOffers.length === 0 && reviewEarnOffers.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No promotions are currently available for this challenge.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Checkout Form */}
          <div>
            <Card className="bg-[#0f0f0f] border-[#1a1a1a] sticky top-6">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2 text-white">
                      Would you like to receive loyalty points on this purchase?
                    </h3>
                    <div className="flex gap-3">
                      <Button className="bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90 px-6">Yes</Button>
                      <Button variant="outline" className="border-[#1a1a1a] hover:bg-[#1a1a1a] px-6 text-white">
                        No
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-[#1a1a1a]" />

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-white">
                        Email<span className="text-[#edb900]">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="mt-1 bg-[#1a1a1a] border-[#1a1a1a] focus-visible:ring-[#edb900]"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="offers"
                          className="mt-1 text-[#edb900] border-gray-600 data-[state=checked]:bg-[#edb900] data-[state=checked]:text-[#0f0f0f]"
                        />
                        <Label htmlFor="offers" className="text-sm text-gray-300">
                          I would like to receive exclusive offers and valuable updates.
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          className="mt-1 text-[#edb900] border-gray-600 data-[state=checked]:bg-[#edb900] data-[state=checked]:text-[#0f0f0f]"
                          defaultChecked
                        />
                        <Label htmlFor="terms" className="text-sm text-gray-300">
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
                  </div>

                  <Button className="w-full bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90 py-6 text-base font-bold">
                    Proceed to checkout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  )
}
