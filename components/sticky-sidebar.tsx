/* eslint-disable */
"use client"

import type React from "react"
import { useState } from "react"
import { Search, ChevronLeft, SlidersHorizontal } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CustomSwitch } from "@/components/custom-switch"

interface StickySidebarProps {
  showDiscountedPrice: boolean
  setShowDiscountedPrice: (value: boolean) => void
}

export const StickySidebar: React.FC<StickySidebarProps> = ({ showDiscountedPrice, setShowDiscountedPrice }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [searchMode, setSearchMode] = useState<"quick" | "advanced">("quick")

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

  // Function to toggle the sidebar
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded)
  }

  // Function to render filter buttons
  const renderFilterButtons = (options: { value: string; label: string }[], selectedValue?: string) => {
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            className={`px-3 py-1 rounded-full border border-[#0f0f0f] text-xs ${
              option.value === selectedValue ? "bg-[#0f0f0f] text-[#edb900]" : "bg-transparent"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="sticky top-[90px] self-start h-fit">
      <div
        className={`${
          sidebarExpanded ? "w-[300px] p-6" : "w-[30px]"
        } transition-all duration-300 ease-in-out overflow-hidden bg-[#edb900] text-[#0f0f0f] p-1 rounded-t-lg lg:rounded-tr-none lg:rounded-l-lg`}
      >
        {/* Toggle button for sidebar - positioned on the right side */}
        <button
          onClick={toggleSidebar}
          className="absolute border border-[#edb900] top-6 -right-4 w-8 h-8 bg-[#0f0f0f] text-[#edb900] rounded-full shadow-md flex items-center justify-center z-10 hover:bg-[#2a2a2a] transition-colors"
          aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarExpanded ? <ChevronLeft size={16} /> : <SlidersHorizontal size={16} />}
        </button>

        <div className={`${!sidebarExpanded ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}>
          <div className="mb-6">
            <div className="flex bg-[#1a1a1a] p-1 rounded-lg mb-4">
              <button
                onClick={() => setSearchMode("quick")}
                className={`flex-1 py-2 px-2 rounded-md text-center transition-all duration-200 font-medium text-xs ${
                  searchMode === "quick" ? "bg-[#edb900] text-[#0f0f0f]" : "text-[#edb900] hover:bg-[#1f1f1f]"
                }`}
              >
                Quick Search
              </button>
              <button
                onClick={() => setSearchMode("advanced")}
                className={`flex-1 py-2 px-2 rounded-md text-center transition-all duration-200 font-medium text-xs ${
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
                  <h3 className="mb-3">Show discounted price?</h3>
                  <CustomSwitch
                    checked={showDiscountedPrice}
                    defaultChecked={true}
                    onCheckedChange={setShowDiscountedPrice}
                  />
                </div>
              </>
            ) : (
              // Advanced search content
              <div className="space-y-4">
                <Accordion type="single" collapsible defaultValue="tradingAssetClass" className="space-y-2">
                  <AccordionItem value="tradingAssetClass" className="border-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-3 py-2 text-[#edb900] hover:bg-[#222] hover:no-underline">
                      Trading Asset Class
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">{renderFilterButtons(assetClasses)}</AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="accountSize" className="border-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-3 py-2 text-[#edb900] hover:bg-[#222] hover:no-underline">
                      Account Size
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">{renderFilterButtons(accountSizes)}</AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="challengeType" className="border-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-3 py-2 text-[#edb900] hover:bg-[#222] hover:no-underline">
                      Challenge Type
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">
                      {renderFilterButtons(challengeTypes)}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="brokers" className="border-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-3 py-2 text-[#edb900] hover:bg-[#222] hover:no-underline">
                      Brokers
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">{renderFilterButtons(brokers)}</AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="platforms" className="border-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-3 py-2 text-[#edb900] hover:bg-[#222] hover:no-underline">
                      Platforms
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">{renderFilterButtons(platforms)}</AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="specialFeatures" className="border-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-3 py-2 text-[#edb900] hover:bg-[#222] hover:no-underline">
                      Special Features
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">
                      {renderFilterButtons(specialFeatures)}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="countries" className="border-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-3 py-2 text-[#edb900] hover:bg-[#222] hover:no-underline">
                      Countries
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">{renderFilterButtons(countries)}</AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="advancedFiltering" className="border-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-3 py-2 text-[#edb900] hover:bg-[#222] hover:no-underline">
                      Advanced Filtering
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">
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

                        {/* More sliders... */}
                        {/* (Keeping the code shorter by not including all sliders) */}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
  )
}
