/* eslint-disable */

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightLeft,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

// Define transaction type
type Transaction = {
  id: string | number
  transaction_timestamp: string
  company: string
  payout_amount: number
  brand_colour?: string
  logo_url?: string
}

interface CompanyAllTransactionsProps {
  transactions?: Transaction[]
  companyName?: string
}

export default function CompanyAllTransactions({
  transactions: initialTransactions,
  companyName,
}: CompanyAllTransactionsProps) {
  // State variables
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [limitRows, setLimitRows] = useState(10)
  const [sortField, setSortField] = useState("transaction_timestamp")
  const [sortDirection, setSortDirection] = useState("desc")
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [displayTransactions, setDisplayTransactions] = useState<Transaction[]>([])

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / limitRows))

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 60000)
    if (diff < 60) return `${diff}min ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ${diff % 60}min ago`
    return new Date(timestamp).toLocaleDateString()
  }

  // Fetch all transactions in batches
  const fetchAllTransactions = async () => {
    // If initialTransactions is provided, use it instead of fetching
    if (initialTransactions && initialTransactions.length > 0) {
      console.log("Using initialTransactions:", initialTransactions)
      setTransactions(initialTransactions)
      return
    }

    // Clear existing transactions and start fresh
    setTransactions([])
    setLoading(true)

    try {
      let allFetched = false
      let offset = 0
      let allTransactions: Transaction[] = []

      // Keep fetching until we get all transactions
      while (!allFetched) {
        // If companyName is provided, include it in the API request
        const companyParam = companyName ? `&company=${encodeURIComponent(companyName)}` : ""

        // Fix: Change companyName to company in the URL parameter to match API expectations
        const url = `/api/getCompanyAllStats?dataType=transactions&timeFilter=last_7_days&page=${offset + 1}&limit=1000${companyParam}`
        console.log("Fetching transactions from:", url)

        const res = await fetch(url)

        if (!res.ok) {
          const errorText = await res.text()
          console.error("API error response:", errorText)
          throw new Error("Failed to fetch transactions")
        }

        const data = await res.json()
        console.log("API response data:", data)

        // Add this batch to our collection
        if (data.transactions && Array.isArray(data.transactions)) {
          allTransactions = [...allTransactions, ...data.transactions]
        } else {
          console.error("Unexpected API response format:", data)
        }

        // If we got fewer than the limit, we've reached the end
        if (!data.transactions || data.transactions.length < 1000) {
          allFetched = true
        } else {
          // Otherwise, increment offset for next batch
          offset += 1
        }
      }

      console.log("All transactions fetched:", allTransactions)
      setTransactions(allTransactions)
    } catch (error) {
      console.error("Transaction fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle sorting
  const handleSort = (field: string) => {
    setSortField(field)
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  // Initial data fetch
  useEffect(() => {
    fetchAllTransactions()
  }, [companyName]) // Refetch when companyName changes

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
          ? new Date(a.transaction_timestamp).getTime() - new Date(b.transaction_timestamp).getTime()
          : new Date(b.transaction_timestamp).getTime() - new Date(a.transaction_timestamp).getTime()
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
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1) // Reset to page 1 when searching
  }

  const shimmerAnimation = `
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-shimmer {
  position: relative;
  overflow: hidden;
}

.animate-shimmer::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.05) 20%,
    rgba(255, 255, 255, 0.1) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
  pointer-events: none;
}
`

  useEffect(() => {
    if (typeof document !== "undefined") {
      const style = document.createElement("style")
      style.textContent = shimmerAnimation
      document.head.appendChild(style)

      return () => {
        document.head.removeChild(style)
      }
    }
  }, [])

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
              <p className="text-[#666666]">
                Browse through most recent payouts {companyName ? `for ${companyName}` : "in the industry"}
              </p>
            </div>
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
                  // Skeleton loading UI with shimmer effect
                  Array(limitRows)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={`skeleton-${index}`} className="border-[#333333]">
                        <TableCell className="pl-7">
                          <div className="h-5 w-24 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer"></div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-[5px] bg-[rgba(255,255,255,0.05)] animate-shimmer"></div>
                            <div className="h-5 w-32 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer"></div>
                          </div>
                        </TableCell>
                        <TableCell className="pr-10 text-right">
                          <div className="h-5 w-20 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer ml-auto"></div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : displayTransactions.length > 0 ? (
                  displayTransactions.map((tx) => (
                    <TableRow
                      key={tx.id || Math.random().toString()}
                      className="cursor-pointer border-[#333333] hover:bg-[#121212]"
                    >
                      <TableCell className="pl-7 text-white text-left">
                        {formatTimestamp(tx.transaction_timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-left gap-3 text-white">
                          <div
                            className="w-6 h-6 rounded-[5px] flex items-center justify-center p-[3px]"
                            style={{ backgroundColor: tx.brand_colour || "#555555" }}
                          >
                            {tx.logo_url ? (
                              <Image
                                src={tx.logo_url || "/placeholder.svg"}
                                alt={tx.company}
                                width={40}
                                height={40}
                                className="object-cover rounded-[10px]"
                                crossOrigin="anonymous"
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

