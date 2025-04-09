/* eslint-disable */
"use client"

import type React from "react"
import { useState } from "react"
import { Search, ChevronDown, ChevronUp, Bookmark } from "lucide-react"
import { FaShoppingCart } from "react-icons/fa"
import ChallengeDetailsSidebar from "@/components/challenge-details-sidebar"
import Navbar from "../components/Navbar"
import Noise from "../components/Noise"
import Community from "../components/Community"
import Newsletter from "../components/Newsletter"
import Footer from "@/components/Footer"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { StickySidebar } from "@/components/sticky-sidebar"

// Update the SegmentedProgressBar component to have individual segment colors
const SegmentedProgressBar = ({
  value = 0,
  segments = 5,
  className = "",
  showPercentage = false,
}: {
  value?: number
  segments?: number
  className?: string
  showPercentage?: boolean
}) => {
  // Calculate how many segments should be filled based on the percentage
  // For example, if value is 85% and segments is 5, we should fill 4.25 segments, which rounds to 4
  // But we want 85% to show 5 segments (all filled), so we need to adjust the calculation

  // For 5 segments:
  // 0-20% = 1 segment
  // 21-40% = 2 segments
  // 41-60% = 3 segments
  // 61-80% = 4 segments
  // 81-100% = 5 segments

  const segmentSize = 100 / segments
  const filledSegments = Math.ceil(value / segmentSize)

  // Define segment colors from darker to lighter yellow
  const segmentColors = [
    "#9f7c00", // 20%
    "#b28b00", // 40%
    "#c69a00", // 60%
    "#d9aa00", // 80%
    "#edb900", // 100%
  ]

  return (
    <div className={`flex items-center ${className}`}>
      {showPercentage && <span className="mr-2 text-xs font-medium">{value}%</span>}
      <div className="relative flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden border border-[#333]">
        <div className="flex w-full h-full">
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 ${i > 0 ? "border-l border-[#333]" : ""}`}
              style={{
                backgroundColor:
                  i < filledSegments ? segmentColors[Math.min(i, segmentColors.length - 1)] : "transparent",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PropFirmComparison() {
  // State for the challenge details sidebar
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // State for search mode toggle
  // const [searchMode, setSearchMode] = useState<"quick" | "advanced">("quick")

  // Add this state after the other  setSearchMode] = useState<"quick" | "advanced">("quick")

  // Add this state after the other useState declarations
  const [searchTerm, setSearchTerm] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Add this state after the other useState declarations
  // const [sidebarExpanded, setSidebarExpanded] = useState(true)

  // Add these state variables after the other useState declarations
  const [sortColumn, setSortColumn] = useState<string>("firmName")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Add state for discount toggle
  const [showDiscountedPrice, setShowDiscountedPrice] = useState(true)

  // Mock data for the design
  const mockFirms = [
    { id: 1, name: "FTMO", logo: "/placeholder.svg", color: "#3366ff" },
    { id: 2, name: "MyForexFunds", logo: "/placeholder.svg", color: "#ff6633" },
    { id: 3, name: "E8 Funding", logo: "/placeholder.svg", color: "#33cc99" },
    { id: 4, name: "The5ers", logo: "/placeholder.svg", color: "#cc33ff" },
    { id: 5, name: "Funded Next", logo: "/placeholder.svg", color: "#ffcc33" },
    { id: 6, name: "True Forex Funds", logo: "/placeholder.svg", color: "#ff3366" },
    { id: 7, name: "Lux Trading", logo: "/placeholder.svg", color: "#33ccff" },
    { id: 8, name: "City Traders Imperium", logo: "/placeholder.svg", color: "#66cc33" },
    { id: 9, name: "Audacity Capital", logo: "/placeholder.svg", color: "#ff9933" },
    { id: 10, name: "Fidelcrest", logo: "/placeholder.svg", color: "#9933ff" },
    { id: 11, name: "Topstep", logo: "/placeholder.svg", color: "#33ff99" },
    { id: 12, name: "Earn2Trade", logo: "/placeholder.svg", color: "#ff3399" },
    { id: 13, name: "Blue Guardian", logo: "/placeholder.svg", color: "#3399ff" },
    { id: 14, name: "SurgeTrader", logo: "/placeholder.svg", color: "#ff9966" },
    { id: 15, name: "Trader Career Path", logo: "/placeholder.svg", color: "#66ff33" },
  ]

  // Mock data for the comparison table
  const mockOffers = [
    {
      id: 1,
      firmId: 1,
      firmName: "FTMO",
      firmLogo: "/placeholder.svg",
      firmColor: "#3366ff",
      rating: 4.7,
      reviews: 108,
      price: 399.0,
      originalPrice: 497.0,
      accountSize: "100k",
      steps: "2 Steps",
      profitTarget: "10%",
      phase2Target: "5%",
      maxDailyLoss: "5%",
      maxTotalDrawdown: "5%",
      profitSplit: "80%",
      profitSplitValue: 80,
      payoutFrequency: "30 Days",
      loyaltyPoints: 173,
      isFavorite: false,
    },
    {
      id: 2,
      firmId: 2,
      firmName: "MyForexFunds",
      firmLogo: "/placeholder.svg",
      firmColor: "#ff6633",
      rating: 4.2,
      reviews: 245,
      price: 299.0,
      originalPrice: 399.0,
      accountSize: "100k",
      steps: "2 Steps",
      profitTarget: "8%",
      phase2Target: "5%",
      maxDailyLoss: "4%",
      maxTotalDrawdown: "8%",
      profitSplit: "80%",
      profitSplitValue: 80,
      payoutFrequency: "14 Days",
      loyaltyPoints: 210,
      isFavorite: true,
    },
    {
      id: 3,
      firmId: 3,
      firmName: "E8 Markets",
      firmLogo: "/placeholder.svg",
      firmColor: "#33cc99",
      rating: 4.8,
      reviews: 298,
      price: 558.6,
      originalPrice: 580.0,
      accountSize: "100k",
      steps: "2 Steps",
      profitTarget: "8%",
      phase2Target: "4%",
      maxDailyLoss: "4%",
      maxTotalDrawdown: "8%",
      profitSplit: "80%",
      profitSplitValue: 80,
      payoutFrequency: "Payout-on-demand",
      loyaltyPoints: 307,
      isFavorite: false,
    },
    {
      id: 4,
      firmId: 4,
      firmName: "The5ers",
      firmLogo: "/placeholder.svg",
      firmColor: "#cc33ff",
      rating: 4.8,
      reviews: 713,
      price: 517.75,
      originalPrice: 545.0,
      accountSize: "100k",
      steps: "2 Steps",
      profitTarget: "8%",
      phase2Target: "5%",
      maxDailyLoss: "5%",
      maxTotalDrawdown: "10%",
      profitSplit: "80%",
      profitSplitValue: 80,
      payoutFrequency: "14 Days",
      loyaltyPoints: 188,
      isFavorite: true,
    },
    {
      id: 5,
      firmId: 5,
      firmName: "FundingPips",
      firmLogo: "/placeholder.svg",
      firmColor: "#3366ff",
      rating: 4.3,
      reviews: 562,
      price: 341.05,
      originalPrice: 359.0,
      accountSize: "100k",
      steps: "2 Steps",
      profitTarget: "6%",
      phase2Target: "6%",
      maxDailyLoss: "3%",
      maxTotalDrawdown: "6%",
      profitSplit: "80%",
      profitSplitValue: 80,
      payoutFrequency: "On-demand",
      loyaltyPoints: 140,
      isFavorite: false,
    },
    {
      id: 6,
      firmId: 6,
      firmName: "Blue Guardian",
      firmLogo: "/placeholder.svg",
      firmColor: "#3399ff",
      rating: 4.3,
      reviews: 119,
      price: 345.42,
      originalPrice: 497.0,
      accountSize: "100k",
      steps: "2 Steps",
      profitTarget: "8%",
      phase2Target: "4%",
      maxDailyLoss: "4%",
      maxTotalDrawdown: "8%",
      profitSplit: "85%",
      profitSplitValue: 85,
      payoutFrequency: "14 Days",
      loyaltyPoints: 574,
      isFavorite: false,
    },
  ]

  // Function to render star rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-xs ${i < fullStars ? "text-[#edb900]" : i === fullStars && hasHalfStar ? "text-[#edb900]" : "text-gray-500"}`}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  // Function to handle row click and open sidebar
  const handleRowClick = (offer: any) => {
    // Create a challenge details object from the offer data
    const challengeDetails = {
      id: offer.id,
      firmId: offer.firmId,
      firm: {
        id: offer.firmId,
        name: offer.firmName,
        logo: offer.firmLogo,
        color: offer.firmColor,
        rating: offer.rating,
        reviews: offer.reviews,
        yearsInOperation: 5, // Default value
        availablePlatforms: ["MT4", "MT5", "cTrader"], // Default platforms
      },
      price: offer.price,
      originalPrice: offer.originalPrice,
      accountSize: offer.accountSize,
      maxDrawdown: offer.maxTotalDrawdown,
      profitTarget: {
        step1: offer.profitTarget,
        step2: offer.phase2Target,
      },
      dailyLoss: offer.maxDailyLoss,
      programName: `${offer.firmName} - ${offer.accountSize} ${offer.steps}`,
      payoutOverview: {
        profitSplit: offer.profitSplit,
        refundableFee: "No",
        payoutFrequency: offer.payoutFrequency,
      },
      tradingOverview: [
        { label: "Max Leverage", value: "1:100" },
        { label: "News-Trading", value: "Yes" },
        { label: "Copy-Trading", value: "Yes" },
        { label: "EA's", value: "Allowed" },
        { label: "Weekend Holding", value: "Yes" },
        { label: "Overnight Holding", value: "Yes" },
      ],
    }

    setSelectedChallenge(challengeDetails)
    setIsSidebarOpen(true)
  }

  // Add this function to handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setSearchTerm(e.target.value)
  }

  // Add this to filter the mockOffers based on search term
  const searchLower = searchTerm.toLowerCase()
  const filteredOffers = mockOffers.filter((offer) => {
    // Search in firm name
    const name = offer.firmName.toLowerCase()
    // Search in account size
    const accountSize = offer.accountSize.toLowerCase()
    // Search in program type
    const steps = offer.steps.toLowerCase()

    return name.includes(searchLower) || accountSize.includes(searchLower) || steps.includes(searchLower)
  })

  // Add this function to handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new column and default to ascending
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Add this function to get the sorted offers
  const getSortedOffers = () => {
    return [...filteredOffers].sort((a, b) => {
      let valueA: any = a[sortColumn as keyof typeof a]
      let valueB: any = b[sortColumn as keyof typeof b]

      // Handle special cases
      if (sortColumn === "price" || sortColumn === "rating") {
        valueA = Number(valueA)
        valueB = Number(valueB)
      }

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }

  // Get the sorted offers
  const sortedOffers = getSortedOffers()

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="w-full">
        <Navbar />
        <Noise />
        <div className="relative container max-w-[1280px] mt-[200px] mb-[100px] mx-auto px-4 pt-[50px] pb-[50px] z-50 overflow-hidden">
          <h1 className="text-7xl text-center mb-8 text-white mb-[100px]">COMPARE ALL PROP FIRMS IN ONE PLACE</h1>
          <div className="flex flex-col lg:flex-row relative">
            {/* Sidebar and Main Content Container */}
            <div className="flex">
              {/* Sticky Sidebar Component */}
              <StickySidebar
                showDiscountedPrice={showDiscountedPrice}
                setShowDiscountedPrice={setShowDiscountedPrice}
              />

              {/* Main Content */}
              <div className="flex-1 bg-[#0f0f0f] p-6 px-4 lg:px-10 rounded-b-lg lg:rounded-bl-none lg:rounded-r-lg overflow-hidden w-full">
                {/* Company Selection */}
                <div className="mb-[100px]">
                  <p className="text-md mt-[50px] mb-4">Select company/companies from the list below:</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
                    {mockFirms.map((firm) => (
                      <div
                        key={firm.id}
                        className="bg-[#1a1a1a] rounded-lg p-4 aspect-square flex flex-col items-center justify-center hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                      >
                        <div
                          className="w-16 h-16 mb-3 rounded-md flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: firm.color }}
                        >
                          <span className="text-[#0f0f0f] text-2xl">{firm.name.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <h3 className="text-sm font-medium text-center">{firm.name}</h3>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Search and Results Count */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  {/* Search Bar with clear button */}
                  <div className="relative w-[250px] justify-center z-20 mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      className="searchDark w-full pl-8 bg-[#0f0f0f] border-gray-600 focus-visible:ring-[#edb900] h-10"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("")
                          setSearchTerm("")
                        }}
                        className="absolute right-2.5 top-2.5 h-4 w-4 text-[#edb900] hover:text-[#edb900]/80"
                        aria-label="Clear search"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <span className="text-sm">
                    Showing <span className="text-[#edb900]">{filteredOffers.length}</span> results.
                  </span>
                </div>

                {/* Table with sticky columns and header */}
                <div className="table-wrapper w-full max-w-full">
                  <div className="sticky-table-container">
                    <table className="sticky-table text-sm">
                      <colgroup>
                        <col style={{ width: "200px" }} /> {/* Firm/Rank */}
                        <col style={{ width: "80px" }} /> {/* Account Size */}
                        <col style={{ width: "80px" }} /> {/* Program */}
                        <col style={{ width: "100px" }} /> {/* Profit Target */}
                        <col style={{ width: "80px" }} /> {/* Daily Loss */}
                        <col style={{ width: "80px" }} /> {/* Max Loss */}
                        <col style={{ width: "100px" }} /> {/* Profit Split */}
                        <col style={{ width: "120px" }} /> {/* Payout Freq */}
                        <col style={{ width: "100px" }} /> {/* Loyalty Pts */}
                        <col style={{ width: "100px" }} /> {/* Price */}
                        <col style={{ width: "60px" }} /> {/* Buy Button */}
                      </colgroup>
                      <thead>
                        <tr>
                          <th className="p-3 text-left relative">
                            <button
                              onClick={() => handleSort("firmName")}
                              className="flex items-center gap-1 w-full hover:text-[#edb900] transition-colors"
                            >
                              <span className="text-[10px] font-[balboa] uppercase font-normal tracking-wider">
                                FIRM / RANK
                              </span>
                              {sortColumn === "firmName" ? (
                                sortDirection === "asc" ? (
                                  <ChevronUp size={12} className="text-[#edb900]" />
                                ) : (
                                  <ChevronDown size={12} className="text-[#edb900]" />
                                )
                              ) : (
                                <ChevronDown size={12} className="opacity-50" />
                              )}
                            </button>
                            <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#333]"></div>
                          </th>
                          <th className="p-3 text-center relative">
                            <button
                              onClick={() => handleSort("accountSize")}
                              className="flex items-center justify-center gap-1 w-full hover:text-[#edb900] transition-colors"
                            >
                              <span className="text-[10px] font-[balboa] uppercase font-normal tracking-wider">
                                ACC SIZE
                              </span>
                              {sortColumn === "accountSize" ? (
                                sortDirection === "asc" ? (
                                  <ChevronUp size={12} className="text-[#edb900]" />
                                ) : (
                                  <ChevronDown size={12} className="text-[#edb900]" />
                                )
                              ) : (
                                <ChevronDown size={12} className="opacity-50" />
                              )}
                            </button>
                            <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#333]"></div>
                          </th>
                          <th className="p-3 text-center relative">
                            <button
                              onClick={() => handleSort("steps")}
                              className="flex items-center justify-center gap-1 w-full hover:text-[#edb900] transition-colors"
                            >
                              <span className="text-[10px] font-[balboa] uppercase font-normal tracking-wider">
                                PROGRAM
                              </span>
                              {sortColumn === "steps" ? (
                                sortDirection === "asc" ? (
                                  <ChevronUp size={12} className="text-[#edb900]" />
                                ) : (
                                  <ChevronDown size={12} className="text-[#edb900]" />
                                )
                              ) : (
                                <ChevronDown size={12} className="opacity-50" />
                              )}
                            </button>
                            <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#333]"></div>
                          </th>
                          <th className="p-3 text-center relative">
                            <button
                              onClick={() => handleSort("profitTarget")}
                              className="flex items-center justify-center gap-1 w-full hover:text-[#edb900] transition-colors"
                            >
                              <span className="text-[10px] font-[balboa] uppercase font-normal tracking-wider">
                                PROFIT TARGET
                              </span>
                              {sortColumn === "profitTarget" ? (
                                sortDirection === "asc" ? (
                                  <ChevronUp size={12} className="text-[#edb900]" />
                                ) : (
                                  <ChevronDown size={12} className="text-[#edb900]" />
                                )
                              ) : (
                                <ChevronDown size={12} className="opacity-50" />
                              )}
                            </button>
                            <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#333]"></div>
                          </th>
                          <th className="p-3 text-center relative">
                            <button
                              onClick={() => handleSort("maxDailyLoss")}
                              className="flex items-center justify-center gap-1 w-full hover:text-[#edb900] transition-colors"
                            >
                              <span className="text-[10px] font-[balboa] uppercase font-normal tracking-wider">
                                DAILY LOSS
                              </span>
                              {sortColumn === "maxDailyLoss" ? (
                                sortDirection === "asc" ? (
                                  <ChevronUp size={12} className="text-[#edb900]" />
                                ) : (
                                  <ChevronDown size={12} className="text-[#edb900]" />
                                )
                              ) : (
                                <ChevronDown size={12} className="opacity-50" />
                              )}
                            </button>
                            <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#333]"></div>
                          </th>
                          <th className="p-3 text-center relative">
                            <button
                              onClick={() => handleSort("maxTotalDrawdown")}
                              className="flex items-center justify-center gap-1 w-full hover:text-[#edb900] transition-colors"
                            >
                              <span className="text-[10px] font-[balboa] uppercase font-normal tracking-wider">
                                MAX LOSS
                              </span>
                              {sortColumn === "maxTotalDrawdown" ? (
                                sortDirection === "asc" ? (
                                  <ChevronUp size={12} className="text-[#edb900]" />
                                ) : (
                                  <ChevronDown size={12} className="text-[#edb900]" />
                                )
                              ) : (
                                <ChevronDown size={12} className="opacity-50" />
                              )}
                            </button>
                            <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#333]"></div>
                          </th>
                          <th className="p-3 text-center relative">
                            <button
                              onClick={() => handleSort("profitSplit")}
                              className="flex items-center justify-center gap-1 w-full hover:text-[#edb900] transition-colors"
                            >
                              <span className="text-[10px] font-[balboa] uppercase font-normal tracking-wider">
                                PROFIT SPLIT
                              </span>
                              {sortColumn === "profitSplit" ? (
                                sortDirection === "asc" ? (
                                  <ChevronUp size={12} className="text-[#edb900]" />
                                ) : (
                                  <ChevronDown size={12} className="text-[#edb900]" />
                                )
                              ) : (
                                <ChevronDown size={12} className="opacity-50" />
                              )}
                            </button>
                            <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#333]"></div>
                          </th>
                          <th className="p-3 text-center relative">
                            <button
                              onClick={() => handleSort("payoutFrequency")}
                              className="flex items-center justify-center gap-1 w-full hover:text-[#edb900] transition-colors"
                            >
                              <span className="text-[10px] font-[balboa] uppercase font-normal tracking-wider">
                                PAYOUT FREQ.
                              </span>
                              {sortColumn === "payoutFrequency" ? (
                                sortDirection === "asc" ? (
                                  <ChevronUp size={12} className="text-[#edb900]" />
                                ) : (
                                  <ChevronDown size={12} className="text-[#edb900]" />
                                )
                              ) : (
                                <ChevronDown size={12} className="opacity-50" />
                              )}
                            </button>
                            <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#333]"></div>
                          </th>
                          <th className="p-3 text-center relative">
                            <button
                              onClick={() => handleSort("loyaltyPoints")}
                              className="flex items-center justify-center gap-1 w-full hover:text-[#edb900] transition-colors"
                            >
                              <span className="text-[10px] font-[balboa] uppercase font-normal tracking-wider">
                                LOYALTY PTS
                              </span>
                              {sortColumn === "loyaltyPoints" ? (
                                sortDirection === "asc" ? (
                                  <ChevronUp size={12} className="text-[#edb900]" />
                                ) : (
                                  <ChevronDown size={12} className="text-[#edb900]" />
                                )
                              ) : (
                                <ChevronDown size={12} className="opacity-50" />
                              )}
                            </button>
                          </th>
                          <th className="p-3 text-center relative">
                            <div className="absolute left-0 top-1/4 z-15 h-1/2 w-px bg-[#333]"></div>
                            <button
                              onClick={() => handleSort("price")}
                              className="flex items-center justify-center gap-1 w-full hover:text-[#edb900] transition-colors"
                            >
                              <span className="text-[10px] font-[balboa] uppercase font-normal tracking-wider">
                                PRICE
                              </span>
                              {sortColumn === "price" ? (
                                sortDirection === "asc" ? (
                                  <ChevronUp size={12} className="text-[#edb900]" />
                                ) : (
                                  <ChevronDown size={12} className="text-[#edb900]" />
                                )
                              ) : (
                                <ChevronDown size={12} className="opacity-50" />
                              )}
                            </button>
                          </th>
                          <th className="p-3 text-center"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedOffers.map((offer) => (
                          <tr key={offer.id} className="cursor-pointer" onClick={() => handleRowClick(offer)}>
                            <td className="p-3 relative">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-12 h-12 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0"
                                  style={{ backgroundColor: offer.firmColor }}
                                >
                                  <span className="text-[#0f0f0f] text-lg">{offer.firmName.substring(0, 1)}</span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{offer.firmName}</span>
                                    <button
                                      className="text-gray-400 hover:text-[#edb900]"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        // Handle bookmark click
                                      }}
                                    >
                                      <Bookmark
                                        size={16}
                                        className={offer.isFavorite ? "fill-[#edb900] text-[#edb900]" : ""}
                                      />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[#edb900]">{offer.rating.toFixed(1)}</span>
                                    <div className="flex">{renderStars(offer.rating)}</div>
                                    <span className="text-xs text-gray-400">{offer.reviews}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#333]"></div>
                            </td>
                            <td className="p-3 font-medium text-center relative">
                              {offer.accountSize}
                              <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#333]"></div>
                            </td>
                            <td className="p-3 text-center relative">
                              <div className="flex items-center justify-center gap-1">
                                <span>{offer.steps}</span>
                              </div>
                              <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#333]"></div>
                            </td>
                            <td className="p-3 text-center relative">
                              <div>
                                <span>{offer.profitTarget}</span>
                                <span className="text-gray-400 ml-2">{offer.phase2Target}</span>
                              </div>
                              <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#333]"></div>
                            </td>
                            <td className="p-3 text-center relative">
                              {offer.maxDailyLoss}
                              <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#333]"></div>
                            </td>
                            <td className="p-3 text-center relative">
                              {offer.maxTotalDrawdown}
                              <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#333]"></div>
                            </td>
                            <td className="p-3 text-center relative">
                              <div className="flex items-center justify-center">
                                <span className="mr-1">{offer.profitSplit}</span>
                                <div className="w-16">
                                  <SegmentedProgressBar value={offer.profitSplitValue} segments={5} />
                                </div>
                              </div>
                              <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#333]"></div>
                            </td>
                            <td className="p-3 text-center relative">
                              {offer.payoutFrequency}
                              <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#333]"></div>
                            </td>
                            <td className="p-3 text-center relative">
                              <div className="flex items-center justify-center gap-1">
                                <Image
                                  src="/icons/logo_loyalty_points.png"
                                  alt="Loyalty Points"
                                  width={16}
                                  height={16}
                                  className="object-contain"
                                />
                                <span>{offer.loyaltyPoints}</span>
                              </div>
                            </td>
                            <td className="p-3 text-center relative">
                              <div className="absolute left-0 top-1/4 z-15 h-1/2 w-px bg-[#333]"></div>
                              <div className="flex flex-col items-center">
                                {showDiscountedPrice ? (
                                  <>
                                    <span>${offer.price.toFixed(2)}</span>
                                    <span className="text-xs text-gray-400 line-through">
                                      ${offer.originalPrice.toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-white font-medium">${offer.originalPrice.toFixed(2)}</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                className="w-[50px] h-10 flex items-center justify-center bg-[#edb900] text-[#0f0f0f] rounded-[10px] hover:bg-[#c99e00] transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Handle cart button click
                                }}
                              >
                                <FaShoppingCart size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Community />
        <Newsletter />
        <Footer />
      </div>
      {/* Challenge Details Sidebar */}
      <ChallengeDetailsSidebar
        challenge={selectedChallenge}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  )
}
