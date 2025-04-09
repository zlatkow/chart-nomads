/* eslint-disable */
"use client"

import { useState, useCallback } from "react"
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
  offers: PropFirmOffer[]
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
}

export function usePropFirmFilters({ offers }: UsePropFirmFiltersProps): UsePropFirmFiltersReturn {
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

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Handle search
  const handleSearch = useCallback(() => {
    setSearchTerm(filters.searchTerm)
  }, [filters.searchTerm])

  // Filter offers based on search term
  const filteredOffers = offers.filter((offer) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    // Search in firm name
    const name = offer.firmName.toLowerCase()
    // Search in account size
    const accountSize = offer.accountSize.toLowerCase()
    // Search in program type
    const steps = offer.steps.toLowerCase()

    return name.includes(searchLower) || accountSize.includes(searchLower) || steps.includes(searchLower)
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
  }
}
