/* eslint-disable */
"use client"

import { useState, useEffect } from "react"
import { Search, ChevronDown, ChevronUp, Bookmark } from "lucide-react"
import { FaShoppingCart } from "react-icons/fa"
import ChallengeDetailsSidebar from "@/components/challenge-details-sidebar"
import Navbar from "@/components/Navbar"
import Noise from "@/components/Noise"
import Community from "@/components/Community"
import Newsletter from "@/components/Newsletter"
import Footer from "@/components/Footer"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { PropFirmFiltersSidebar } from "@/components/prop-firm-filters-sidebar"
import { SegmentedProgressBar } from "@/components/segmented-progress-bar"

// Types
export type SearchMode = "quick" | "advanced"

export interface FilterOptions {
  searchMode: SearchMode
  searchTerm: string
  showDiscountedPrice: boolean
  challengeType?: string
  accountSize?: string
  assetClass?: string
  selectedFirmIds?: number[]
}

export interface PropFirmOffer {
  id: number
  firmId: number
  firmName: string
  firmLogo: string
  firmColor: string
  rating: number
  reviews: number
  price: string
  originalPrice: string
  accountSize: string
  steps: string
  profitTarget: string
  phase2Target: string
  maxDailyLoss: string
  maxTotalDrawdown: string
  profitSplit: string
  profitSplitValue: number
  payoutFrequency: string
  loyaltyPoints: number
  isFavorite: boolean
  accountType?: string
}

export default function PropFirmComparison() {
  // State for the challenge details sidebar
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Data states
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [propFirms, setPropFirms] = useState<PropFirmOffer[]>([])

  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    searchMode: "quick",
    searchTerm: "",
    showDiscountedPrice: true,
    selectedFirmIds: [],
  })
  const [searchTerm, setSearchTerm] = useState("")

  // Sort states
  const [sortColumn, setSortColumn] = useState<string>("firmName")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Filter options
  const [challengeTypes, setChallengeTypes] = useState<{ value: string; label: string }[]>([])
  const [accountSizes, setAccountSizes] = useState<{ value: string; label: string }[]>([])

  // Helper function to format price
  const formatPrice = (price: string | number | null | undefined): string => {
    if (price === null || price === undefined || price === "") return "$0.00"

    // If it's already a string with a dollar sign, return it
    if (typeof price === "string" && price.startsWith("$")) return price

    // Try to convert to a number and format
    const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
    if (isNaN(numPrice)) return "$0.00"

    return `$${numPrice.toFixed(2)}`
  }

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/prop-firm-challenges")

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        // Process challenges with their related prop firm data
        const challenges = data.challenges || []

        // Map challenges to our PropFirmOffer format
        const offers = challenges.map((challenge: any) => {
          // Access prop firm data directly from the challenge
          const firm = challenge.prop_firm || {
            id: 0,
            propfirm_name: "Unknown",
            logo_url: "/placeholder.svg",
            brand_colour: "#333333",
            rating: 0,
            reviews_count: 0,
          }

          // Determine the number of steps based on profit targets
          let steps = "1 Phase"
          if (challenge.profit_target_p3) {
            steps = "3 Phases"
          } else if (challenge.profit_target_p2) {
            steps = "2 Phases"
          } else if (challenge.account_type === "Instant Funding") {
            steps = "Instant Funding"
          }

          return {
            id: challenge.id,
            firmId: firm?.id || 0,
            firmName: firm.propfirm_name,
            firmLogo: firm.logo_url || "/placeholder.svg",
            firmColor: firm.brand_colour || "#333333",
            rating: firm.rating || 0,
            reviews: firm.reviews_count || 0,
            price: challenge.discounted_price || challenge.original_price || "0",
            originalPrice: challenge.original_price || "0",
            accountSize: challenge.account_size,
            steps: steps,
            profitTarget: `${challenge.profit_target_p1 || 0}%`,
            phase2Target: challenge.profit_target_p2 ? `${challenge.profit_target_p2}%` : "",
            maxDailyLoss: `${challenge.max_daily_loss || 0}%`,
            maxTotalDrawdown: `${challenge.max_total_drawdown || 0}%`,
            profitSplit: `${challenge.profit_split || 0}%`,
            profitSplitValue: challenge.profit_split || 0,
            payoutFrequency: `${challenge.payout_frequency || "N/A"}`,
            loyaltyPoints: 0, // Default value if not available
            isFavorite: false,
            accountType: challenge.account_type,
          }
        })

        setPropFirms(offers)

        // Extract filter options - SIMPLIFIED APPROACH
        const typeSet = new Set<string>()
        const sizeSet = new Set<string>()

        challenges.forEach((challenge: any) => {
          if (challenge.account_type) typeSet.add(challenge.account_type)
          if (challenge.account_size) sizeSet.add(challenge.account_size)
        })

        const typeOptions = Array.from(typeSet).map((type) => ({ value: type, label: type }))
        const sizeOptions = Array.from(sizeSet).map((size) => ({ value: size, label: size }))

        setChallengeTypes(typeOptions)
        setAccountSizes(sizeOptions)

        console.log(`Successfully loaded ${offers.length} prop firm challenges`)
        console.log("Sample challenge data:", challenges[0])
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Update filters
  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  // Handle search
  const handleSearch = () => {
    setSearchTerm(filters.searchTerm)
  }

  // Toggle company selection for filtering
  const toggleCompanySelection = (firmId: number) => {
    setFilters((prev) => {
      const selectedFirmIds = prev.selectedFirmIds || []

      if (selectedFirmIds.includes(firmId)) {
        // Remove the firm if it's already selected
        return {
          ...prev,
          selectedFirmIds: selectedFirmIds.filter((id) => id !== firmId),
        }
      } else {
        // Add the firm if it's not selected
        return {
          ...prev,
          selectedFirmIds: [...selectedFirmIds, firmId],
        }
      }
    })
  }

  // Filter offers based on search term and filters
  const filteredOffers = propFirms.filter((offer) => {
    // Company filter
    if (filters.selectedFirmIds && filters.selectedFirmIds.length > 0) {
      if (!filters.selectedFirmIds.includes(offer.firmId)) {
        return false
      }
    }

    // Text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const name = offer.firmName.toLowerCase()
      const accountSize = offer.accountSize.toLowerCase()
      const steps = offer.steps.toLowerCase()

      if (!name.includes(searchLower) && !accountSize.includes(searchLower) && !steps.includes(searchLower)) {
        return false
      }
    }

    // Challenge type filter
    if (filters.challengeType && offer.accountType !== filters.challengeType) {
      return false
    }

    // Account size filter
    if (filters.accountSize && offer.accountSize !== filters.accountSize) {
      return false
    }

    // Asset class filter would go here if we had that data

    return true
  })

  // Handle sorting
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

  // Get sorted offers
  const sortedOffers = [...filteredOffers].sort((a, b) => {
    let valueA: any = a[sortColumn as keyof typeof a]
    let valueB: any = b[sortColumn as keyof typeof b]

    // Handle special cases
    if (sortColumn === "price") {
      // Convert string prices to numbers for sorting
      valueA = Number.parseFloat(valueA) || 0
      valueB = Number.parseFloat(valueB) || 0
    } else if (sortColumn === "rating") {
      valueA = Number(valueA)
      valueB = Number(valueB)
    }

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1
    return 0
  })

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
  const handleRowClick = (offer: PropFirmOffer) => {
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

  // Render loading skeleton
  const renderSkeletonCards = () => {
    return Array(6)
      .fill(0)
      .map((_, index) => (
        <tr key={`skeleton-${index}`} className="animate-pulse">
          <td className="p-3 relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-md bg-gray-700"></div>
              <div className="flex flex-col gap-2">
                <div className="h-4 w-24 bg-gray-700 rounded"></div>
                <div className="h-3 w-16 bg-gray-700 rounded"></div>
              </div>
            </div>
          </td>
          <td className="p-3 text-center">
            <div className="h-4 w-12 bg-gray-700 rounded mx-auto"></div>
          </td>
          <td className="p-3 text-center">
            <div className="h-4 w-16 bg-gray-700 rounded mx-auto"></div>
          </td>
          <td className="p-3 text-center">
            <div className="h-4 w-16 bg-gray-700 rounded mx-auto"></div>
          </td>
          <td className="p-3 text-center">
            <div className="h-4 w-12 bg-gray-700 rounded mx-auto"></div>
          </td>
          <td className="p-3 text-center">
            <div className="h-4 w-12 bg-gray-700 rounded mx-auto"></div>
          </td>
          <td className="p-3 text-center">
            <div className="h-4 w-16 bg-gray-700 rounded mx-auto"></div>
          </td>
          <td className="p-3 text-center">
            <div className="h-4 w-20 bg-gray-700 rounded mx-auto"></div>
          </td>
          <td className="p-3 text-center">
            <div className="h-4 w-16 bg-gray-700 rounded mx-auto"></div>
          </td>
          <td className="p-3 text-center">
            <div className="h-4 w-16 bg-gray-700 rounded mx-auto"></div>
          </td>
          <td className="p-3 text-center">
            <div className="h-8 w-10 bg-gray-700 rounded mx-auto"></div>
          </td>
        </tr>
      ))
  }

  // Render skeleton for company grid
  const renderCompanySkeletons = () => {
    return Array(8)
      .fill(0)
      .map((_, index) => (
        <div
          key={`company-skeleton-${index}`}
          className="bg-[#1a1a1a] rounded-lg p-4 aspect-square flex flex-col items-center justify-center animate-pulse"
        >
          <div className="w-16 h-16 mb-3 rounded-md bg-gray-700"></div>
          <div className="h-4 w-20 bg-gray-700 rounded"></div>
        </div>
      ))
  }

  // Get unique firms for the company grid
  const uniqueFirms = Array.from(new Map(propFirms.map((offer) => [offer.firmId, offer])).values())

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="w-full">
        <Navbar />
        <Noise />
        <div className="relative container max-w-[1280px] mt-[200px] mb-[100px] mx-auto px-4 pt-[50px] pb-[50px] z-50 overflow-hidden">
          <h1 className="text-7xl text-center mb-8 text-white mb-[100px]">COMPARE ALL PROP FIRMS IN ONE PLACE</h1>

          <div className="flex flex-col lg:flex-row relative">
            {/* Sidebar - Search */}
            <PropFirmFiltersSidebar
              filters={filters}
              onFilterChange={updateFilters}
              onSearch={handleSearch}
              challengeTypes={challengeTypes}
              accountSizes={accountSizes}
              isLoading={isLoading}
              propFirms={propFirms}
            />

            {/* Main Content */}
            <div className="flex-1 bg-[#0f0f0f] p-6 px-4 lg:px-10 rounded-b-lg lg:rounded-bl-none lg:rounded-r-lg overflow-hidden w-full">
              {/* Company Selection */}
              <div className="mb-[50px]">
                <p className="text-md mt-[50px] mb-4">Select company/companies from the list below:</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
                  {isLoading ? (
                    renderCompanySkeletons()
                  ) : uniqueFirms.length > 0 ? (
                    uniqueFirms.map((firm) => {
                      const isSelected = filters.selectedFirmIds?.includes(firm.firmId)

                      return (
                        <div
                          key={firm.firmId}
                          onClick={() => toggleCompanySelection(firm.firmId)}
                          className={`bg-[#1a1a1a] rounded-lg p-4 aspect-square flex flex-col items-center justify-center hover:bg-[#2a2a2a] transition-colors cursor-pointer ${
                            isSelected ? "ring-2 ring-[#edb900] bg-[#2a2a2a]" : ""
                          }`}
                        >
                          <div
                            className="w-16 h-16 mb-3 p-3 rounded-md flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: firm.firmColor }}
                          >
                            {firm.firmLogo && firm.firmLogo !== "/placeholder.svg" ? (
                              <Image
                                src={firm.firmLogo || "/placeholder.svg"}
                                alt={`${firm.firmName} logo`}
                                width={64}
                                height={64}
                                className="object-contain w-full h-full"
                                onError={(e) => {
                                  // Fallback to initials if image fails to load
                                  e.currentTarget.style.display = "none"
                                  e.currentTarget.parentElement.innerHTML = `<span class="text-[#0f0f0f] text-2xl">${firm.firmName.substring(0, 2).toUpperCase()}</span>`
                                }}
                              />
                            ) : (
                              <span className="text-[#0f0f0f] text-2xl">
                                {firm.firmName.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-center">{firm.firmName}</h3>
                        </div>
                      )
                    })
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p>No companies found. Please check your database connection.</p>
                    </div>
                  )}
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
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
                      {isLoading ? (
                        renderSkeletonCards()
                      ) : sortedOffers.length > 0 ? (
                        sortedOffers.map((offer) => (
                          <tr key={offer.id} className="cursor-pointer" onClick={() => handleRowClick(offer)}>
                            <td className="p-3 relative">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-12 h-12 p-2 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0"
                                  style={{ backgroundColor: offer.firmColor }}
                                >
                                  {offer.firmLogo && offer.firmLogo !== "/placeholder.svg" ? (
                                    <Image
                                      src={offer.firmLogo || "/placeholder.svg"}
                                      alt={`${offer.firmName} logo`}
                                      width={48}
                                      height={48}
                                      className="object-contain w-full h-full"
                                      onError={(e) => {
                                        // Fallback to initials if image fails to load
                                        e.currentTarget.style.display = "none"
                                        e.currentTarget.parentElement.innerHTML = `<span class="text-[#0f0f0f] text-lg">${offer.firmName.substring(0, 1)}</span>`
                                      }}
                                    />
                                  ) : (
                                    <span className="text-[#0f0f0f] text-lg">{offer.firmName.substring(0, 1)}</span>
                                  )}
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
                                {filters.showDiscountedPrice ? (
                                  <>
                                    <span>{formatPrice(offer.price)}</span>
                                    <span className="text-xs text-gray-400 line-through">
                                      {formatPrice(offer.originalPrice)}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-white font-medium">{formatPrice(offer.originalPrice)}</span>
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
                        ))
                      ) : (
                        <tr>
                          <td colSpan={11} className="p-6 text-center">
                            No results found. Try adjusting your filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
