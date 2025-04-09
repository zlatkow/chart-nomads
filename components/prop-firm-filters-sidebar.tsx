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
  challengeType?: string
  accountSize?: string
  assetClass?: string
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
  propFirms: any[] // Add this line to include propFirms
}

export const PropFirmFiltersSidebar = ({
  filters,
  onFilterChange,
  onSearch,
  challengeTypes,
  accountSizes,
  isLoading,
  propFirms,
}: PropFirmFiltersSidebarProps) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  // Asset classes - hardcoded since they might not be directly in the database
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

  // Function to render filter buttons
  const renderFilterButtons = (options: { value: string; label: string }[], selectedValue?: string) => {
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
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              if (options === challengeTypes) {
                onFilterChange({ challengeType: option.value === filters.challengeType ? undefined : option.value })
              } else if (options === accountSizes) {
                onFilterChange({ accountSize: option.value === filters.accountSize ? undefined : option.value })
              } else if (options === assetClasses) {
                onFilterChange({ assetClass: option.value === filters.assetClass ? undefined : option.value })
              }
            }}
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

  const renderActiveFilters = () => {
    const hasActiveFilters =
      (filters.selectedFirmIds && filters.selectedFirmIds.length > 0) ||
      filters.challengeType ||
      filters.accountSize ||
      filters.assetClass

    if (!hasActiveFilters) return null

    return (
      <div className="mb-6 mt-2">
        <p className="text-xs text-[#0f0f0f] mb-2">Active filters:</p>
        <div className="flex flex-wrap gap-2">
          {filters.selectedFirmIds?.map((firmId) => {
            const firm = propFirms.find((f) => f.firmId === firmId)
            if (!firm) return null

            return (
              <div
                key={`firm-filter-${firmId}`}
                className="bg-[#0f0f0f] px-3 py-1 rounded-full flex items-center gap-1 text-xs"
              >
                <span className="text-white">{firm.firmName}</span>
                <button
                  onClick={() => {
                    const newSelectedFirmIds = filters.selectedFirmIds?.filter((id) => id !== firmId) || []
                    onFilterChange({ selectedFirmIds: newSelectedFirmIds.length ? newSelectedFirmIds : undefined })
                  }}
                  className="text-gray-400 hover:text-[#edb900]"
                >
                  <X size={12} />
                </button>
              </div>
            )
          })}

          {filters.challengeType && (
            <div className="bg-[#0f0f0f] px-3 py-1 rounded-full flex items-center gap-1 text-xs">
              <span className="text-white">{filters.challengeType}</span>
              <button
                onClick={() => onFilterChange({ challengeType: undefined })}
                className="text-gray-400 hover:text-[#edb900]"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {filters.accountSize && (
            <div className="bg-[#0f0f0f] px-3 py-1 rounded-full flex items-center gap-1 text-xs">
              <span className="text-white">{filters.accountSize}</span>
              <button
                onClick={() => onFilterChange({ accountSize: undefined })}
                className="text-gray-400 hover:text-[#edb900]"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {filters.assetClass && (
            <div className="bg-[#0f0f0f] px-3 py-1 rounded-full flex items-center gap-1 text-xs">
              <span className="text-white">{filters.assetClass}</span>
              <button
                onClick={() => onFilterChange({ assetClass: undefined })}
                className="text-gray-400 hover:text-[#edb900]"
              >
                <X size={12} />
              </button>
            </div>
          )}
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
              <button
                className="text-sm font-medium hover:underline"
                onClick={() =>
                  onFilterChange({
                    challengeType: undefined,
                    accountSize: undefined,
                    assetClass: undefined,
                    selectedFirmIds: undefined,
                  })
                }
              >
                Clear All
              </button>
            </div>
            {renderActiveFilters()}
          </div>

          {/* Scrollable filter area */}
          <div className="overflow-y-auto max-h-[calc(100vh-250px)] pr-2 -mr-2">
            {filters.searchMode === "quick" ? (
              <>
                {/* Challenge Type Filter */}
                <div className="mb-6">
                  <h3 className=" mb-3">Challenge type:</h3>
                  {renderFilterButtons(challengeTypes, filters.challengeType)}
                </div>

                {/* Account Size Filter */}
                <div className="mb-6">
                  <h3 className="mb-3">Account size:</h3>
                  {renderFilterButtons(accountSizes.slice(0, 9), filters.accountSize)}
                </div>

                {/* Trading Asset Class Filter */}
                <div className="mb-6">
                  <h3 className=" mb-3">Trading asset class:</h3>
                  {renderFilterButtons(assetClasses, filters.assetClass)}
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
                      {renderFilterButtons(assetClasses, filters.assetClass)}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="accountSize" className="border-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-3 py-2 text-[#edb900] hover:bg-[#222] hover:no-underline">
                      Account Size
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">
                      {renderFilterButtons(accountSizes, filters.accountSize)}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="challengeType" className="border-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-3 py-2 text-[#edb900] hover:bg-[#222] hover:no-underline">
                      Challenge Type
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">
                      {renderFilterButtons(challengeTypes, filters.challengeType)}
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
