/* eslint-disable */

"use client"

import { useState, useEffect } from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  Search,
  ArrowRightLeft,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import Image from "next/image"

// Global cache for transactions data
let transactionsCache = null
let lastFetchTime = null
const CACHE_EXPIRY_TIME = 5 * 60 * 1000 // 5 minutes

// Function to prefetch transactions data
const prefetchTransactions = async () => {
  // Check if we already have fresh cached data
  if (transactionsCache && lastFetchTime && Date.now() - lastFetchTime < CACHE_EXPIRY_TIME) {
    console.log("Using cached transactions data")
    return transactionsCache
  }

  console.log("Prefetching transactions data")
  try {
    let allFetched = false
    let offset = 0
    let allTransactions = []

    // Keep fetching until we get all transactions
    while (!allFetched) {
      const res = await fetch(
        `/api/fetchTransactions?limitRows=1000&offsetRows=${offset}&timeFilter=last_7_days&searchQuery=`,
      )

      if (!res.ok) throw new Error("Failed to fetch transactions")

      const data = await res.json()

      // Add this batch to our collection
      allTransactions = [...allTransactions, ...data.transactions]

      // If we got fewer than the limit, we've reached the end
      if (data.transactions.length < 1000) {
        allFetched = true
      } else {
        // Otherwise, increment offset for next batch
        offset += 1000
      }
    }

    // Update the cache
    transactionsCache = allTransactions
    lastFetchTime = Date.now()

    // Also store in sessionStorage as backup
    try {
      sessionStorage.setItem("transactionsData", JSON.stringify(allTransactions))
      sessionStorage.setItem("transactionsFetchTime", lastFetchTime.toString())
    } catch (e) {
      console.warn("Failed to store transactions in sessionStorage:", e)
    }

    return allTransactions
  } catch (error) {
    console.error("Transaction prefetch error:", error)
    return []
  }
}

// Start prefetching as soon as this module loads
if (typeof window !== "undefined") {
  // Try to load from sessionStorage first
  try {
    const cachedData = sessionStorage.getItem("transactionsData")
    const cachedTime = sessionStorage.getItem("transactionsFetchTime")

    if (cachedData && cachedTime) {
      transactionsCache = JSON.parse(cachedData)
      lastFetchTime = Number.parseInt(cachedTime)
      console.log("Loaded transactions from sessionStorage")
    }
  } catch (e) {
    console.warn("Failed to load transactions from sessionStorage:", e)
  }

  // Prefetch in the background if needed
  if (!transactionsCache || !lastFetchTime || Date.now() - lastFetchTime > CACHE_EXPIRY_TIME) {
    prefetchTransactions()
  }
}

// Loader component that can be included in the page to trigger prefetching
export function TransactionsLoader() {
  useEffect(() => {
    prefetchTransactions()
  }, [])

  return null
}

// Changed function name from TransactionsTable to AllTransactions
// Added transactions prop (but not using it to maintain existing logic)
export default function AllTransactions({ transactions: initialTransactions }) {
  // State variables
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [limitRows, setLimitRows] = useState(10)
  const [sortField, setSortField] = useState("transaction_timestamp")
  const [sortDirection, setSortDirection] = useState("desc")
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [displayTransactions, setDisplayTransactions] = useState([])

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / limitRows))

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 60000)
    if (diff < 60) return `${diff}min ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ${diff % 60}min ago`
    return new Date(timestamp).toLocaleDateString()
  }

  // Fetch all transactions in batches
  const fetchAllTransactions = async () => {
    // Check if we have cached data first
    if (transactionsCache) {
      setTransactions(transactionsCache)
      setLoading(false)
      return
    }

    // Clear existing transactions and start fresh
    setTransactions([])
    setLoading(true)

    try {
      const allTransactions = await prefetchTransactions()
      setTransactions(allTransactions)
    } catch (error) {
      console.error("Transaction fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle sorting
  const handleSort = (field) => {
    setSortField(field)
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  // Initial data fetch
  useEffect(() => {
    fetchAllTransactions()
  }, []) // Empty dependency array means this only runs once on mount

  // Apply search filter and sorting
  useEffect(() => {
    // Filter transactions by search query
    let filtered = [...transactions]
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((tx) => tx.company.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Sort filtered transactions
    filtered.sort((a, b) => {
      if (sortField === "transaction_timestamp") {
        return sortDirection === "asc"
          ? new Date(a.transaction_timestamp) - new Date(b.transaction_timestamp)
          : new Date(b.transaction_timestamp) - new Date(a.transaction_timestamp)
      } else if (sortField === "company") {
        return sortDirection === "asc" ? a.company.localeCompare(b.company) : b.company.localeCompare(a.company)
      } else if (sortField === "payout_amount") {
        return sortDirection === "asc" ? a.payout_amount - b.payout_amount : b.payout_amount - a.payout_amount
      }
      return 0
    })

    setFilteredTransactions(filtered)
    setPage(1) // Reset to first page when filtering changes
  }, [transactions, searchQuery, sortField, sortDirection])

  // Update displayed transactions when page or limitRows changes
  useEffect(() => {
    const startIndex = (page - 1) * limitRows
    const endIndex = startIndex + limitRows
    setDisplayTransactions(filteredTransactions.slice(startIndex, endIndex))
  }, [filteredTransactions, page, limitRows])

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setPage(1) // Reset to page 1 when searching
  }

  return (
    <Card className="border-[#666666] bg-[#0f0f0f]">
      <CardContent className="p-0">
        <div className="flex justify-between border-b-[1px] border-b-[#666666] p-6">
          <div>
            <div className="flex">
              <ArrowRightLeft className="h-5 w-5 mr-2 mt-2 text-[#edb900]" />
              <h2 className="text-3xl font-[balboa] text-white">Recent transactions</h2>
            </div>
            <div>
              <p className="text-[#666666]">Browse through most recent payouts in the industry</p>
            </div>
          </div>
          <div className="w-[300px] h-10 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by company.."
              className="searchDark w-full pl-8 bg-[#333333] border-[#333333] focus-visible:ring-[#edb900] h-10"
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("")
                  setPage(1)
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
        </div>

        <div>
          <div className="relative w-full overflow-auto mt-5">
            <Table>
              <TableHeader className="bg-[#0f0f0f]">
                <TableRow className="border-[#333333] hover:bg-transparent">
                  <TableHead className="text-[#edb900]">
                    <div
                      className="p-4 flex cursor-pointer items-center justify-left"
                      onClick={() => handleSort("transaction_timestamp")}
                    >
                      Timestamp
                      {sortField === "transaction_timestamp" ? (
                        sortDirection === "asc" ? (
                          <ArrowUpIcon className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-[#edb900]">
                    <div
                      className="flex cursor-pointer items-center justify-left"
                      onClick={() => handleSort("company")}
                    >
                      Company
                      {sortField === "company" ? (
                        sortDirection === "asc" ? (
                          <ArrowUpIcon className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-[#edb900]">
                    <div
                      className="pr-6 flex cursor-pointer items-center justify-right"
                      onClick={() => handleSort("payout_amount")}
                    >
                      Amount
                      {sortField === "payout_amount" ? (
                        sortDirection === "asc" ? (
                          <ArrowUpIcon className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="border-[#333333]">
                    <TableCell colSpan={3} className="h-24 text-center">
                      Loading transactions...
                    </TableCell>
                  </TableRow>
                ) : displayTransactions.length > 0 ? (
                  displayTransactions.map((tx) => (
                    <TableRow
                      key={tx.id || Math.random()}
                      className="cursor-pointer border-[#333333] hover:bg-[#121212]"
                    >
                      <TableCell className="pl-7 text-white text-left">
                        {formatTimestamp(tx.transaction_timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-left gap-3 text-white">
                          <div
                            className="w-6 h-6 rounded-[5px] flex items-left justify-left p-[3px]"
                            style={{ backgroundColor: tx.brand_colour || "#555555" }}
                          >
                            {tx.logo_url ? (
                              <Image
                                src={tx.logo_url || "/placeholder.svg"}
                                alt={tx.company}
                                width={40}
                                height={40}
                                className="object-cover rounded-[10px]"
                                unoptimized
                              />
                            ) : (
                              <span className="text-xs font-bold text-white">{tx.company[0]}</span>
                            )}
                          </div>
                          {tx.company}
                        </div>
                      </TableCell>
                      <TableCell className="pr-10 text-left text-white font-medium">
                        ${tx.payout_amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-[#333333]">
                    <TableCell colSpan={3} className="h-24 text-center text-white">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-[#333333] px-6 py-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div>
              Showing {displayTransactions.length > 0 ? (page - 1) * limitRows + 1 : 0} to{" "}
              {Math.min(page * limitRows, filteredTransactions.length)} of {filteredTransactions.length} entries
            </div>
            <div>
              <Select
                value={limitRows.toString()}
                onValueChange={(value) => {
                  setLimitRows(Number(value))
                  setPage(1) // Reset to first page when changing items per page
                }}
              >
                <SelectTrigger className="h-8 w-[70px] bg-[#1A1A1A] border-[#333333] text-white">
                  <SelectValue placeholder={limitRows.toString()} />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333333] text-white">
                  <SelectItem value="5" className="focus:bg-[#555555] focus:text-white">
                    5
                  </SelectItem>
                  <SelectItem value="10" className="focus:bg-[#555555] focus:text-white">
                    10
                  </SelectItem>
                  <SelectItem value="20" className="focus:bg-[#555555] focus:text-white">
                    20
                  </SelectItem>
                  <SelectItem value="50" className="focus:bg-[#555555] focus:text-white">
                    50
                  </SelectItem>
                  <SelectItem value="100" className="focus:bg-[#555555] focus:text-white">
                    100
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-[#333333] border-[#333333] text-white hover:bg-[#555555]"
              onClick={() => setPage(page > 1 ? page - 1 : 1)}
              disabled={page === 1}
            >
              <ChevronLeftIcon className="h-4 w-4 text-white" />
              <span className="sr-only">Previous page</span>
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber

                if (totalPages <= 5) {
                  // If we have 5 or fewer pages, show all page numbers
                  pageNumber = i + 1
                } else if (page <= 3) {
                  // If we're near the start, show pages 1-5
                  pageNumber = i + 1
                } else if (page >= totalPages - 2) {
                  // If we're near the end, show the last 5 pages
                  pageNumber = totalPages - 4 + i
                } else {
                  // Otherwise show 2 pages before and 2 pages after the current page
                  pageNumber = page - 2 + i
                }

                return (
                  <Button
                    key={pageNumber}
                    variant={page === pageNumber ? "default" : "outline"}
                    size="icon"
                    className={`h-8 w-8 text-white ${
                      page === pageNumber
                        ? "bg-[#edb900] text-black hover:bg-[#edb900]/90"
                        : "bg-[#333333] border-[#333333] hover:bg-[#555555]"
                    }`}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-[#333333] border-[#333333] text-white hover:bg-[#555555]"
              onClick={() => setPage(Math.min(page + 1, totalPages))}
              disabled={page >= totalPages}
            >
              <ChevronRightIcon className="h-4 w-4 text-white" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

