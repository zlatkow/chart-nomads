/* eslint-disable */
"use client"

import { useState } from "react"
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
import { usePropFirmFilters, type PropFirmOffer } from "@/hooks/use-prop-firm-filters"
import { SegmentedProgressBar } from "@/components/segmented-progress-bar"

export default function PropFirmComparison() {
  // State for the challenge details sidebar
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Use our custom hook for filtering and sorting
  const {
    filters,
    updateFilters,
    searchTerm,
    setSearchTerm,
    filteredOffers,
    sortColumn,
    sortDirection,
    handleSort,
    sortedOffers,
    handleSearch,
    isLoading,
    propFirms,
  } = usePropFirmFilters()

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

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="w-full">
        <Navbar />
        <Noise />
        <div className="relative container max-w-[1280px] mt-[200px] mb-[100px] mx-auto px-4 pt-[50px] pb-[50px] z-50 overflow-hidden">
          <h1 className="text-7xl text-center mb-8 text-white mb-[100px]">COMPARE ALL PROP FIRMS IN ONE PLACE</h1>
          <div className="flex flex-col lg:flex-row relative">
            {/* Sidebar - Search */}
            <PropFirmFiltersSidebar filters={filters} onFilterChange={updateFilters} onSearch={handleSearch} />

            {/* Main Content */}
            <div className="flex-1 bg-[#0f0f0f] p-6 px-4 lg:px-10 rounded-b-lg lg:rounded-bl-none lg:rounded-r-lg overflow-hidden w-full">
              {/* Company Selection */}
              {!isLoading && (
                <div className="mb-[100px]">
                  <p className="text-md mt-[50px] mb-4">Select company/companies from the list below:</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
                    {Array.from(new Set(propFirms.map((offer) => offer.firmId))).map((firmId) => {
                      const firm = propFirms.find((offer) => offer.firmId === firmId)
                      if (!firm) return null

                      return (
                        <div
                          key={firm.firmId}
                          className="bg-[#1a1a1a] rounded-lg p-4 aspect-square flex flex-col items-center justify-center hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                        >
                          <div
                            className="w-16 h-16 mb-3 rounded-md flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: firm.firmColor }}
                          >
                            <span className="text-[#0f0f0f] text-2xl">
                              {firm.firmName.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <h3 className="text-sm font-medium text-center">{firm.firmName}</h3>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

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
                      {isLoading
                        ? renderSkeletonCards()
                        : sortedOffers.map((offer) => (
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
                                  {filters.showDiscountedPrice ? (
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
