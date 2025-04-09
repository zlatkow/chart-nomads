/* eslint-disable */
"use client"

import { useState, useCallback, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { FilterOptions } from "@/components/prop-firm-filters-sidebar"

export interface PropFirmOffer {
  id: number
  firmId: number
  firmName: string
  firmLogo: string
  firmColor: string
  rating: number
  reviews: number
  price: number
  originalPrice: number
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
  [key: string]: any // For dynamic access to properties
}

interface UsePropFirmFiltersProps {
  initialOffers?: PropFirmOffer[]
}

interface UsePropFirmFiltersReturn {
  filters: FilterOptions
  updateFilters: (newFilters: Partial<FilterOptions>) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredOffers: PropFirmOffer[]
  sortColumn: string
  sortDirection: "asc" | "desc"
  handleSort: (column: string) => void
  sortedOffers: PropFirmOffer[]
  handleSearch: () => void
  isLoading: boolean
  propFirms: PropFirmOffer[]
}

export function usePropFirmFilters({ initialOffers }: UsePropFirmFiltersProps = {}): UsePropFirmFiltersReturn {
  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    searchMode: "quick",
    searchTerm: "",
    showDiscountedPrice: true,
  })

  // Search and sort states
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string>("firmName")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isLoading, setIsLoading] = useState(true)
  const [propFirms, setPropFirms] = useState<PropFirmOffer[]>(initialOffers || [])

  // Fetch prop firm challenges from Supabase
  useEffect(() => {
    const fetchPropFirmChallenges = async () => {
      setIsLoading(true)

      try {
        // First, get all prop firms to have their details
        const { data: firms, error: firmsError } = await supabase
          .from("prop_firms")
          .select("*")
          .eq("listing_status", "listed")

        if (firmsError) {
          console.error("Error fetching prop firms:", firmsError)
          setIsLoading(false)
          return
        }

        // Then get all challenges
        const { data: challenges, error: challengesError } = await supabase.from("propfirm_challenges").select("*")

        if (challengesError) {
          console.error("Error fetching challenges:", challengesError)
          setIsLoading(false)
          return
        }

        // Map challenges to our PropFirmOffer format
        const offers: PropFirmOffer[] = challenges.map((challenge) => {
          const firm = firms.find((f) => f.id === challenge.prop_firm_id) || {
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
            firmId: firm.id,
            firmName: firm.propfirm_name,
            firmLogo: firm.logo_url || "/placeholder.svg",
            firmColor: firm.brand_colour || "#333333",
            rating: firm.rating || 0,
            reviews: firm.reviews_count || 0,
            price: challenge.discounted_price || challenge.original_price,
            originalPrice: challenge.original_price,
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
      } catch (error) {
        console.error("Error in fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPropFirmChallenges()
  }, [])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Handle search
  const handleSearch = useCallback(() => {
    setSearchTerm(filters.searchTerm)
  }, [filters.searchTerm])

  // Filter offers based on search term and filters
  const filteredOffers = propFirms.filter((offer) => {
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
  const handleSort = useCallback(
    (column: string) => {
      if (sortColumn === column) {
        // Toggle direction if clicking the same column
        setSortDirection(sortDirection === "asc" ? "desc" : "asc")
      } else {
        // Set new column and default to ascending
        setSortColumn(column)
        setSortDirection("asc")
      }
    },
    [sortColumn, sortDirection],
  )

  // Get sorted offers
  const sortedOffers = [...filteredOffers].sort((a, b) => {
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

  return {
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
  }
}
