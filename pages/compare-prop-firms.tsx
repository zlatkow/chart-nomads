/* eslint-disable */
"use client"

import type React from "react"
import { useState } from "react"
import { Search, ChevronDown, ChevronUp, Bookmark, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { FaShoppingCart } from "react-icons/fa"
import ChallengeDetailsSidebar from "@/components/challenge-details-sidebar"
import Navbar from "../components/Navbar"
import Noise from "../components/Noise"
import Community from "../components/Community"
import Newsletter from "../components/Newsletter"
import Footer from "@/components/Footer"
import { Input } from "@/components/ui/input"

export default function PropFirmComparison() {
  // State for the challenge details sidebar
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // State for search mode toggle
  const [searchMode, setSearchMode] = useState<"quick" | "advanced">("quick")

  // Add this state after the other useState declarations
  const [searchTerm, setSearchTerm] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Add this state after the other useState declarations
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

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
      payoutFrequency: "14 Days",
      loyaltyPoints: 574,
      isFavorite: false,
    },
  ]

  // Challenge type options
  const challengeTypes = [
    { value: "Instant Funding", label: "Instant Funding" },
    { value: "1 Phase", label: "1 Phase" },
    { value: "2 Phases", label: "2 Phases" },
    { value: "3 Phases", label: "3 Phases" },
  ]

  // Account size options
  const accountSizes = [
    { value: "2k", label: "2k" },
    { value: "2.5k", label: "2.5k" },
    { value: "5k", label: "5k" },
    { value: "6k", label: "6k" },
    { value: "10k", label: "10k" },
    { value: "15k", label: "15k" },
    { value: "20k", label: "20k" },
    { value: "25k", label: "25k" },
    { value: "30k", label: "30k" },
    { value: "40k", label: "40k" },
    { value: "50k", label: "50k" },
    { value: "60k", label: "60k" },
    { value: "75k", label: "75k" },
    { value: "100k", label: "100k" },
    { value: "120k", label: "120k" },
    { value: "140k", label: "140k" },
    { value: "150k", label: "150k" },
    { value: "20k", label: "20k" },
    { value: "250k", label: "250k" },
    { value: "300k", label: "300k" },
    { value: "400k", label: "400k" },
    { value: "500k", label: "500k" },
    { value: "1M", label: "1M" },
    { value: "2M", label: "2M" },
    { value: "5M", label: "5M" },
  ]

  // Asset class options
  const assetClasses = [
    { value: "Forex", label: "Forex" },
    { value: "Futures", label: "Futures" },
    { value: "Crypto", label: "Crypto" },
    { value: "Stocks", label: "Stocks" },
    { value: "Indices", label: "Indices" },
    { value: "Commodities", label: "Commodities" },
  ]

  // Brokers options
  const brokers = [
    { value: "ThinkMarkets", label: "ThinkMarkets" },
    { value: "Purple Trading Seychelles", label: "Purple Trading Seychelles" },
    { value: "Virtual Markets", label: "Virtual Markets" },
    { value: "Capital Markets", label: "Capital Markets" },
    { value: "Match Trade", label: "Match Trade" },
    { value: "Finesse FX", label: "Finesse FX" },
    { value: "FXPIG", label: "FXPIG" },
    { value: "FXFlat", label: "FXFlat" },
    { value: "GBE Brokers", label: "GBE Brokers" },
    { value: "CBT Limited", label: "CBT Limited" },
    { value: "Liquidity Provider / Own Broker", label: "Liquidity Provider / Own Broker" },
  ]

  // Platforms options
  const platforms = [
    { value: "MT4", label: "MT4" },
    { value: "MT5", label: "MT5" },
    { value: "cTrader", label: "cTrader" },
    { value: "DXtrade", label: "DXtrade" },
    { value: "TradeLocker", label: "TradeLocker" },
    { value: "Match Trader", label: "Match Trader" },
    { value: "ThinkTrader", label: "ThinkTrader" },
    { value: "Other Platform", label: "Other Platform" },
    { value: "Proprietary Platform", label: "Proprietary Platform" },
  ]

  // Special features options
  const specialFeatures = [
    { value: "Trade Copying", label: "Trade Copying" },
    { value: "Expert Advisors", label: "Expert Advisors" },
    { value: "In-house Technology", label: "In-house Technology" },
    { value: "Refund Fee", label: "Refund Fee" },
    { value: "Scaling Plan", label: "Scaling Plan" },
    { value: "News Trading", label: "News Trading" },
    { value: "Weekend Holding", label: "Weekend Holding" },
    { value: "Auto-close", label: "Auto-close" },
    { value: "Drawdown Blocker", label: "Drawdown Blocker" },
    { value: "Swap Free Accounts", label: "Swap Free Accounts" },
    { value: "Balance-based Daily Drawdown", label: "Balance-based Daily Drawdown" },
  ]

  // Countries options
  const countries = [
    { value: "USA", label: "USA" },
    { value: "Pakistan", label: "Pakistan" },
    { value: "India", label: "India" },
    { value: "Vietnam", label: "Vietnam" },
    { value: "Nigeria", label: "Nigeria" },
    { value: "Iran", label: "Iran" },
    { value: "Turkey", label: "Turkey" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "United Arab Emirates", label: "United Arab Emirates" },
    { value: "Kenya", label: "Kenya" },
  ]

  // Add a new state to track which accordion sections are open
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    tradingAssetClass: true, // Open by default
    accountSize: false,
    challengeType: false,
    brokers: false,
    platforms: false,
    specialFeatures: false,
    countries: false,
    advancedFiltering: false,
  })

  // Add a function to toggle accordion sections
  const toggleAccordion = (section: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Create a reusable accordion component for filter categories
  const FilterAccordion = ({
    title,
    section,
    children,
  }: {
    title: string
    section: string
    children: React.ReactNode
  }) => {
    const isOpen = openAccordions[section]

    return (
      <div className="mb-4 bg-[#1a1a1a] rounded-lg overflow-hidden">
        <button
          onClick={() => toggleAccordion(section)}
          className="w-full p-3 flex justify-between items-center text-left"
        >
          {title}
          <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        <div
          className={`transition-all duration-200 overflow-hidden ${
            isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-3 pt-0">{children}</div>
        </div>
      </div>
    )
  }

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

  // Function to render filter buttons
  const renderFilterButtons = (options: { value: string; label: string }[], selectedValue?: string) => {
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            className={`px-3 py-1 rounded-full border border-[#0f0f0f] text-sm ${
              option.value === selectedValue ? "bg-[#0f0f0f] text-[#edb900]" : "bg-transparent"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    )
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

  // Add this function to toggle the sidebar
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="w-full">
        <Navbar />
        <Noise />
        <div className="relative container max-w-[1280px] mt-[200px] mb-[100px] mx-auto px-0 pt-[50px] pb-[50px] z-50">
          <div className="flex flex-col lg:flex-row relative">
            {/* Sidebar - Search */}
            <div className="relative">
              <div
                className={`${
                  sidebarExpanded ? "w-[300px]" : "w-[30px]"
                } transition-all duration-300 ease-in-out overflow-hidden bg-[#edb900] text-[#0f0f0f] p-6 rounded-t-lg lg:rounded-tr-none lg:rounded-l-lg`}
              >
                {/* Toggle button for sidebar - positioned on the right side */}
                <button
                  onClick={toggleSidebar}
                  className="absolute top-6 -right-4 w-8 h-8 bg-[#0f0f0f] text-[#edb900] rounded-full shadow-md flex items-center justify-center z-10 hover:bg-[#2a2a2a] transition-colors"
                  aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
                >
                  {sidebarExpanded ? <ChevronLeft size={16} /> : <SlidersHorizontal size={16} />}
                </button>

                <div className={`${!sidebarExpanded ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}>
                  <div className="mb-6">
                    <div className="flex bg-[#1a1a1a] p-1 rounded-lg mb-4">
                      <button
                        onClick={() => setSearchMode("quick")}
                        className={`flex-1 py-2 px-4 rounded-md text-center transition-all duration-200 font-medium text-sm ${
                          searchMode === "quick" ? "bg-[#edb900] text-[#0f0f0f]" : "text-[#edb900] hover:bg-[#1f1f1f]"
                        }`}
                      >
                        Quick Search
                      </button>
                      <button
                        onClick={() => setSearchMode("advanced")}
                        className={`flex-1 py-2 px-4 rounded-md text-center transition-all duration-200 font-medium text-sm ${
                          searchMode === "advanced" ? "bg-[#edb900] text-[#0f0f0f]" : "text-[#edb900] hover:bg-[#1f1f1f]"
                        }`}
                      >
                        Advanced Search
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl">Filters</h2>
                      <button className="text-sm font-medium hover:underline">Clear All</button>
                    </div>
                  </div>

                  {/* Scrollable filter area */}
                  <div className="overflow-y-auto max-h-[calc(100vh-250px)] pr-2 -mr-2">
                    {searchMode === "quick" ? (
                      <>
                        {/* Challenge Type Filter */}
                        <div className="mb-6">
                          <h3 className=" mb-3">Challenge type:</h3>
                          {renderFilterButtons(challengeTypes, "2 Phases")}
                        </div>

                        {/* Account Size Filter */}
                        <div className="mb-6">
                          <h3 className="mb-3">Account size:</h3>
                          {renderFilterButtons(accountSizes.slice(0, 9), "100k")}
                        </div>

                        {/* Trading Asset Class Filter */}
                        <div className="mb-6">
                          <h3 className=" mb-3">Trading asset class:</h3>
                          {renderFilterButtons(assetClasses, "Forex")}
                        </div>

                        {/* Show Discounted Price Toggle */}
                        <div className="mb-6">
                          <h3 className=" mb-3">Show discounted price?</h3>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f0f0f]"></div>
                          </label>
                        </div>
                      </>
                    ) : (
                      // Advanced search content
                      <div className="space-y-4">
                        <FilterAccordion title="Trading Asset Class" section="tradingAssetClass">
                          {renderFilterButtons(assetClasses)}
                        </FilterAccordion>

                        <FilterAccordion title="Account Size" section="accountSize">
                          {renderFilterButtons(accountSizes)}
                        </FilterAccordion>

                        <FilterAccordion title="Challenge Type" section="challengeType">
                          {renderFilterButtons(challengeTypes)}
                        </FilterAccordion>

                        <FilterAccordion title="Brokers" section="brokers">
                          {renderFilterButtons(brokers)}
                        </FilterAccordion>

                        <FilterAccordion title="Platforms" section="platforms">
                          {renderFilterButtons(platforms)}
                        </FilterAccordion>

                        <FilterAccordion title="Special Features" section="specialFeatures">
                          {renderFilterButtons(specialFeatures)}
                        </FilterAccordion>

                        <FilterAccordion title="Countries" section="countries">
                          {renderFilterButtons(countries)}
                        </FilterAccordion>

                        <FilterAccordion title="Advanced Filtering" section="advancedFiltering">
                          <div className="space-y-4">
                            {/* Price Range */}
                            <div className="mb-4 bg-[#edb900] p-3 rounded-lg">
                              <label className="block mb-2 font-medium">Price $</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="2000"
                                  step="50"
                                  defaultValue="500"
                                  className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#0f0f0f]"
                                />
                              </div>
                              <div className="flex justify-between mt-1 text-xs">
                                <span>$0</span>
                                <span>$2,000</span>
                              </div>
                            </div>

                            {/* Account Size K */}
                            <div className="mb-4 bg-[#edb900] p-3 rounded-lg">
                              <label className="block mb-2 font-medium">Account Size K</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="400000"
                                  step="10000"
                                  defaultValue="100000"
                                  className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#0f0f0f]"
                                />
                              </div>
                              <div className="flex justify-between mt-1 text-xs">
                                <span>$0</span>
                                <span>$400,000</span>
                              </div>
                            </div>

                            {/* Account Profit Split % */}
                            <div className="mb-4 bg-[#edb900] p-3 rounded-lg">
                              <label className="block mb-2 font-medium">Account Profit Split %</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="5"
                                  defaultValue="80"
                                  className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#0f0f0f]"
                                />
                              </div>
                              <div className="flex justify-between mt-1 text-xs">
                                <span>0%</span>
                                <span>100%</span>
                              </div>
                            </div>

                            {/* Profit Target % (Combined) */}
                            <div className="mb-4 bg-[#edb900] p-3 rounded-lg">
                              <label className="block mb-2 font-medium">Profit Target % (Combined)</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="30"
                                  step="1"
                                  defaultValue="10"
                                  className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#0f0f0f]"
                                />
                              </div>
                              <div className="flex justify-between mt-1 text-xs">
                                <span>0%</span>
                                <span>30%</span>
                              </div>
                            </div>

                            {/* Max Daily Loss % */}
                            <div className="mb-4 bg-[#edb900] p-3 rounded-lg">
                              <label className="block mb-2 font-medium">Max Daily Loss %</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="10"
                                  step="0.5"
                                  defaultValue="5"
                                  className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#0f0f0f]"
                                />
                              </div>
                              <div className="flex justify-between mt-1 text-xs">
                                <span>0%</span>
                                <span>10%</span>
                              </div>
                            </div>

                            {/* Account Max Total Drawdown % */}
                            <div className="mb-4 bg-[#edb900] p-3 rounded-lg">
                              <label className="block mb-2 font-medium">Account Max Total Drawdown %</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="20"
                                  step="1"
                                  defaultValue="10"
                                  className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#0f0f0f]"
                                />
                              </div>
                              <div className="flex justify-between mt-1 text-xs">
                                <span>0%</span>
                                <span>20%</span>
                              </div>
                            </div>

                            {/* Commission $ */}
                            <div className="mb-4 bg-[#edb900] p-3 rounded-lg">
                              <label className="block mb-2 font-medium">Commission $</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="10"
                                  step="0.5"
                                  defaultValue="0"
                                  className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#0f0f0f]"
                                />
                              </div>
                              <div className="flex justify-between mt-1 text-xs">
                                <span>$0</span>
                                <span>$10</span>
                              </div>
                            </div>

                            {/* Account PT:DD ratio */}
                            <div className="mb-4 bg-[#edb900] p-3 rounded-lg">
                              <label className="block mb-2 font-medium">Account PT:DD ratio</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  defaultValue="0.5"
                                  className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#0f0f0f]"
                                />
                              </div>
                              <div className="flex justify-between mt-1 text-xs">
                                <span>1:0</span>
                                <span>1:1</span>
                              </div>
                            </div>

                            {/* Payout Frequency (Days) */}
                            <div className="mb-4 bg-[#edb900] p-3 rounded-lg">
                              <label className="block mb-2 font-medium">Payout Frequency (Days)</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="30"
                                  step="1"
                                  defaultValue="14"
                                  className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#0f0f0f]"
                                />
                              </div>
                              <div className="flex justify-between mt-1 text-xs">
                                <span>0 Days</span>
                                <span>30 Days</span>
                              </div>
                            </div>

                            {/* Trust Pilot Rating */}
                            <div className="mb-4 bg-[#edb900] p-3 rounded-lg">
                              <label className="block mb-2 font-medium">Trust Pilot Rating</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="1"
                                  max="5"
                                  step="0.1"
                                  defaultValue="4"
                                  className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#0f0f0f]"
                                />
                              </div>
                              <div className="flex justify-between mt-1 text-xs">
                                <span>1</span>
                                <span>5</span>
                              </div>
                            </div>

                            {/* Years in Business */}
                            <div className="mb-4 bg-[#edb900] p-3 rounded-lg">
                              <label className="block mb-2 font-medium">Years in Business</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="1"
                                  max="15"
                                  step="1"
                                  defaultValue="5"
                                  className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#0f0f0f]"
                                />
                              </div>
                              <div className="flex justify-between mt-1 text-xs">
                                <span>1 Years</span>
                                <span>15 Years</span>
                              </div>
                            </div>

                            {/* Loyalty Points */}
                            <div className="mb-4 bg-[#edb900] p-3 rounded-lg">
                              <label className="block mb-2 font-medium">Loyalty Points</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="5000"
                                  step="100"
                                  defaultValue="1000"
                                  className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#0f0f0f]"
                                />
                              </div>
                              <div className="flex justify-between mt-1 text-xs">
                                <span>0 Points</span>
                                <span>5,000 Points</span>
                              </div>
                            </div>
                          </div>
                        </FilterAccordion>
                      </div>
                    )}
                  </div>

                  {/* Search Button - Fixed at bottom */}
                  <div className="mt-6">
                    <button className="w-full py-3 bg-[#0f0f0f] text-[#edb900] rounded-md flex items-center justify-center gap-2 hover:bg-[#2a2a2a] transition-colors">
                      <Search size={18} />
                      {searchMode === "quick" ? "Search" : "Advanced Search"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-[#0f0f0f] p-6 rounded-b-lg lg:rounded-bl-none lg:rounded-r-lg">
              <h1 className="text-4xl text-center mb-8 text-[#edb900]">COMPARE ALL PROP FIRMS IN ONE PLACE</h1>

              {/* Company Selection */}
              <div className="mb-8">
                <p className="text-lg mb-4">Select company/companies from the list below:</p>

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
                {/* ✅ Updated Search Bar with clear button */}
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

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#333]">
                      <th className="p-3 text-left">
                        <div className="flex items-center gap-1">
                          FIRM / RANK
                          <ChevronUp size={16} className="text-[#edb900]" />
                        </div>
                      </th>
                      <th className="p-3 text-left">
                        <div className="flex items-center gap-1">
                          ACC SIZE
                          <ChevronDown size={16} />
                        </div>
                      </th>
                      <th className="p-3 text-left">PROGRAM</th>
                      <th className="p-3 text-left">PROFIT TARGET</th>
                      <th className="p-3 text-left">DAILY LOSS</th>
                      <th className="p-3 text-left">MAX LOSS</th>
                      <th className="p-3 text-left">PROFIT SPLIT</th>
                      <th className="p-3 text-left">PAYOUT FREQ.</th>
                      <th className="p-3 text-left">LOYALTY PTS</th>
                      <th className="p-3 text-left">PRICE</th>
                      <th className="p-3 text-left"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOffers.map((offer) => (
                      <tr
                        key={offer.id}
                        className="border-b border-[#222] hover:bg-[#1a1a1a] cursor-pointer"
                        onClick={() => handleRowClick(offer)}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-md flex items-center justify-center overflow-hidden"
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
                        </td>
                        <td className="p-3 font-medium">{offer.accountSize}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <span>{offer.steps}</span>
                            <span className="text-gray-400 rounded-full border border-gray-600 w-4 h-4 flex items-center justify-center text-xs">
                              i
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <span>{offer.profitTarget}</span>
                            <span className="text-gray-400 ml-2">{offer.phase2Target}</span>
                          </div>
                        </td>
                        <td className="p-3">{offer.maxDailyLoss}</td>
                        <td className="p-3">{offer.maxTotalDrawdown}</td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <span>{offer.profitSplit}</span>
                            <div className="ml-2 w-20 h-2 bg-[#333] rounded-full overflow-hidden">
                              <div className="h-full bg-[#edb900]" style={{ width: "80%" }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">{offer.payoutFrequency}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <span className="text-[#edb900]">$</span>
                            <span>{offer.loyaltyPoints}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span>${offer.price.toFixed(2)}</span>
                            <span className="text-xs text-gray-400 line-through">
                              ${offer.originalPrice.toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
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
