/* eslint-disable */
"use client"

import { useState } from "react"
import { Search, ChevronLeft, SlidersHorizontal, X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CustomSwitch } from "@/components/custom-switch"

// Types for the filters
export type SearchMode = "quick" | "advanced"

export interface FilterOptions {
  searchMode: SearchMode
  searchTerm: string
  showDiscountedPrice: boolean
  challengeTypes?: string[]
  accountSizes?: string[]
  assetClasses?: string[]
  selectedFirmIds?: number[]
  // Add other filter options as needed
}

interface PropFirmFiltersSidebarProps {
  filters: FilterOptions
  onFilterChange: (filters: Partial<FilterOptions>) => void
  onSearch: () => void
  challengeTypes: { value: string; label: string }[]
  accountSizes: { value: string; label: string }[]
  isLoading: boolean
  propFirms: any[]
}

export const PropFirmFiltersSidebar = ({
  filters,
  onFilterChange,
  onSearch,
  isLoading,
  propFirms,
}: PropFirmFiltersSidebarProps) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  // Static challenge types in the correct order
  const staticChallengeTypes = [
    { value: "Instant Funding", label: "Instant Funding" },
    { value: "1 Phase", label: "1 Phase" },
    { value: "2 Phases", label: "2 Phases" },
    { value: "3 Phases", label: "3 Phases" },
  ]

  // Static account sizes in the correct order
  const staticAccountSizes = [
    { value: "$2.5K", label: "2.5k" },
    { value: "$5K", label: "5k" },
    { value: "$6K", label: "6k" },
    { value: "$10K", label: "10k" },
    { value: "$12.5K", label: "12.5k" },
    { value: "$15K", label: "15k" },
    { value: "$25K", label: "25k" },
    { value: "$50K", label: "50k" },
    { value: "$60K", label: "60k" },
    { value: "$75K", label: "75k" },
    { value: "$100K", label: "100k" },
    { value: "$150K", label: "150k" },
    { value: "$200K", label: "200k" },
    { value: "$300K", label: "300k" },
    { value: "$400K", label: "400k" },
  ]

  // Quick search account sizes (only major ones)
  const quickSearchAccountSizes = [
    { value: "$5K", label: "5k" },
    { value: "$10K", label: "10k" },
    { value: "$25K", label: "25k" },
    { value: "$50K", label: "50k" },
    { value: "$100K", label: "100k" },
    { value: "$150K", label: "150k" },
    { value: "$200K", label: "200k" },
  ]

  // Asset classes - hardcoded
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

  // Function to toggle the sidebar
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded)
  }

  // Check if any filters are active
  const hasActiveFilters =
    (filters.selectedFirmIds && filters.selectedFirmIds.length > 0) ||
    (filters.challengeTypes && filters.challengeTypes.length > 0) ||
    (filters.accountSizes && filters.accountSizes.length > 0) ||
    (filters.assetClasses && filters.assetClasses.length > 0)

  // Function to toggle a value in an array filter
  const toggleArrayFilter = (filterName: "challengeTypes" | "accountSizes" | "assetClasses", value: string) => {
    const currentValues = filters[filterName] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]

    onFilterChange({ [filterName]: newValues.length > 0 ? newValues : undefined })
  }

  // Function to render filter buttons with multiple selection
  const renderFilterButtons = (
    options: { value: string; label: string }[],
    selectedValues?: string[],
    filterType: "challengeTypes" | "accountSizes" | "assetClasses" = "challengeTypes",
  ) => {
    if (isLoading) {
      return (
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 w-16 bg-gray-700 rounded-full animate-pulse"></div>
          ))}
        </div>
      )
    }

    if (options.length === 0) {
      return <p className="text-xs text-red-500">No options available</p>
    }

    return (
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedValues?.includes(option.value) || false

          // Different styling for advanced search mode
          const buttonClass =
            filters.searchMode === "advanced"
              ? isSelected
                ? "bg-[#edb900] text-[#0f0f0f] border border-[#edb900]"
                : "bg-transparent text-[#edb900] border border-[#edb900] hover:bg-[#edb900]/10"
              : isSelected
                ? "bg-[#0f0f0f] text-[#edb900] border border-[#0f0f0f]"
                : "bg-transparent border border-[#0f0f0f] hover:bg-[#0f0f0f]/10"

          return (
            <button
              key={option.value}
              onClick={() => toggleArrayFilter(filterType, option.value)}
              className={`px-3 py-1 rounded-full text-xs ${buttonClass}`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    )
  }

  // Render selected companies
  const renderSelectedCompanies = () => {
    if (!filters.selectedFirmIds || filters.selectedFirmIds.length === 0) return null

    return (
      <div className="mb-6 mt-2">
        <p className="text-xs text-[#0f0f0f] mb-2">Selected Companies:</p>
        <div className="flex flex-wrap gap-2">
          {filters.selectedFirmIds.map((firmId) => {
            const firm = propFirms.find((f) => f.firmId === firmId)
            if (!firm) return null

            return (
              <div
                key={`firm-filter-${firmId}`}
                className="bg-[#0f0f0f] px-3 py-1 rounded-full flex items-center gap-1 text-xs"
              >
                <span className="text-[#edb900]">{firm.firmName}</span>
                <button
                  onClick={() => {
                    const newSelectedFirmIds = filters.selectedFirmIds?.filter((id) => id !== firmId) || []
                    onFilterChange({ selectedFirmIds: newSelectedFirmIds.length ? newSelectedFirmIds : undefined })
                  }}
                  className="text-[#edb900] hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative"
      style={{ position: "sticky", top: "90px", height: "fit-content", alignSelf: "flex-start" }}
    >
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
                onClick={() => onFilterChange({ searchMode: "quick" })}
                className={`flex-1 py-2 px-2 rounded-md text-center transition-all duration-200 font-medium text-xs ${
                  filters.searchMode === "quick" ? "bg-[#edb900] text-[#0f0f0f]" : "text-[#edb900] hover:bg-[#1f1f1f]"
                }`}
              >
                Quick Search
              </button>
              <button
                onClick={() => onFilterChange({ searchMode: "advanced" })}
                className={`flex-1 py-2 px-2 rounded-md text-center transition-all duration-200 font-medium text-xs ${
                  filters.searchMode === "advanced"
                    ? "bg-[#edb900] text-[#0f0f0f]"
                    : "text-[#edb900] hover:bg-[#1f1f1f]"
                }`}
              >
                Advanced Search
              </button>
            </div>
            <div className="flex justify-between items-center">
              <h2 className="text-xl">Filters</h2>
              {hasActiveFilters && (
                <button
                  className="text-sm font-medium hover:underline flex items-center gap-1"
                  onClick={() =>
                    onFilterChange({
                      challengeTypes: undefined,
                      accountSizes: undefined,
                      assetClasses: undefined,
                      selectedFirmIds: undefined,
                    })
                  }
                >
                  <X size={14} />
                  Clear All
                </button>
              )}
            </div>
            {renderSelectedCompanies()}
          </div>

          {/* Scrollable filter area */}
          <div className="overflow-y-auto max-h-[calc(100vh-250px)] pr-2 -mr-2">
            {filters.searchMode === "quick" ? (
              <>
                {/* Challenge Type Filter */}
                <div className="mb-6">
                  <h3 className="mb-3">Challenge type:</h3>
                  {renderFilterButtons(staticChallengeTypes, filters.challengeTypes, "challengeTypes")}
                </div>

                {/* Account Size Filter */}
                <div className="mb-6">
                  <h3 className="mb-3">Account size:</h3>
                  {renderFilterButtons(quickSearchAccountSizes, filters.accountSizes, "accountSizes")}
                </div>

                {/* Trading Asset Class Filter */}
                <div className="mb-6">
                  <h3 className="mb-3">Trading asset class:</h3>
                  {renderFilterButtons(assetClasses, filters.assetClasses, "assetClasses")}
                </div>

                {/* Show Discounted Price Toggle */}
                <div className="mb-6">
                  <h3 className="mb-3">Show discounted price?</h3>
                  <CustomSwitch
                    checked={filters.showDiscountedPrice}
                    defaultChecked={true}
                    onCheckedChange={(checked) => onFilterChange({ showDiscountedPrice: checked })}
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
                    <AccordionContent className="px-3 pb-3 pt-0">
                      {renderFilterButtons(assetClasses, filters.assetClasses, "assetClasses")}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="accountSize" className="border-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-3 py-2 text-[#edb900] hover:bg-[#222] hover:no-underline">
                      Account Size
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">
                      {renderFilterButtons(staticAccountSizes, filters.accountSizes, "accountSizes")}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="challengeType" className="border-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-3 py-2 text-[#edb900] hover:bg-[#222] hover:no-underline">
                      Challenge Type
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">
                      {renderFilterButtons(staticChallengeTypes, filters.challengeTypes, "challengeTypes")}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="brokers" className="border-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-3 py-2 text-[#edb900] hover:bg-[#222] hover:no-underline">
                      Brokers
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">
                      {renderFilterButtons(brokers, [], "challengeTypes")}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="platforms" className="border-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-3 py-2 text-[#edb900] hover:bg-[#222] hover:no-underline">
                      Platforms
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">
                      {renderFilterButtons(platforms, [], "challengeTypes")}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="specialFeatures" className="border-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-3 py-2 text-[#edb900] hover:bg-[#222] hover:no-underline">
                      Special Features
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">
                      {renderFilterButtons(specialFeatures, [], "challengeTypes")}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="countries" className="border-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-3 py-2 text-[#edb900] hover:bg-[#222] hover:no-underline">
                      Countries
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">
                      {renderFilterButtons(countries, [], "challengeTypes")}
                    </AccordionContent>
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
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>

          {/* Search Button - Fixed at bottom */}
          <div className="mt-6">
            <button
              onClick={onSearch}
              className="w-full py-3 bg-[#0f0f0f] text-[#edb900] rounded-md flex items-center justify-center gap-2 hover:bg-[#2a2a2a] transition-colors"
            >
              <Search size={18} />
              {filters.searchMode === "quick" ? "Search" : "Advanced Search"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
