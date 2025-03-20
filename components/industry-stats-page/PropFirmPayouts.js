/* eslint-disable */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign } from "lucide-react"

/**
 * PropFirmPayouts Component
 * @param {Object} props
 * @param {Array} [props.topPayouts=[]] - Initial payouts data
 */
export default function PropFirmPayouts({ topPayouts: initialPayouts = [] }) {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [payoutData, setPayoutData] = useState(initialPayouts)
  const [loading, setLoading] = useState(!initialPayouts.length)

  // ✅ Fetch Data from Backend Whenever Filter Changes
  useEffect(() => {
    // If we're using the "all" filter and we have initial data, use that
    if (selectedFilter === "all" && initialPayouts.length > 0) {
      setPayoutData(initialPayouts)
      setLoading(false)
      return
    }

    const fetchPayouts = async () => {
      setLoading(true)

      try {
        const res = await fetch(`/api/fetchTopPayouts?timefilter=${encodeURIComponent(selectedFilter)}`)

        if (!res.ok) {
          throw new Error("Failed to fetch top payouts")
        }

        const data = await res.json()

        if (!data?.topPayouts || !Array.isArray(data.topPayouts)) {
          setPayoutData([])
          return
        }

        setPayoutData(data.topPayouts)
      } catch (error) {
        setPayoutData([])
      } finally {
        setLoading(false)
      }
    }

    fetchPayouts()
  }, [selectedFilter, initialPayouts]) // ✅ Refetch data when the filter changes or initialPayouts changes

  // Format currency with commas and dollar sign
  const formatCurrency = (amount, decimalPlaces = 2) => {
    if (!amount && amount !== 0) return "N/A"
    return `$${Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    })}`
  }

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    } catch (e) {
      return dateString // Return original if parsing fails
    }
  }

  // Get initials from company name
  const getInitials = (name) => {
    if (!name) return "?"
    const words = name.split(" ")
    if (words.length === 1) return name.charAt(0)
    return words[0].charAt(0) + (words[1]?.charAt(0) || "")
  }

  // Get rank badge color
  const getRankColor = (rank) => {
    if (rank === 1) return "#efbf04" // Gold
    if (rank === 2) return "#c4c4c4" // Silver
    if (rank === 3) return "#c68346" // Bronze
    return "#333333"
  }

  return (
    <div className="w-full bg-[#0f0f0f] rounded-[10px] border-[1px] border-[#666666] mb-[50px]">
      <div className="w-full">
        <div className="flex justify-between border-b-[1px] border-b-[#666666] p-6">
          <div>
            <div className="flex">
              <DollarSign className="h-5 w-5 mr-2 mt-1 text-[#edb900]" />
              <h2 className="text-3xl font-[balboa]">Top 10 Prop Firm Payouts</h2>
            </div>
            <div>
              <p className="text-[#666666]">Historical paid traders churn rate in the industry</p>
            </div>
          </div>
          {/* Filter Dropdown */}
          <Select
            value={selectedFilter}
            onValueChange={(value) => {
              setSelectedFilter(value)
            }}
          >
            <SelectTrigger className="w-[150px] mt-3 bg-[#1A1A1A] border-[#333333] text-white">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[#333333] text-white">
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="last_12_months">Last 12 Months</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="w-full bg-[#0F0F0F] border-[#0f0f0f] overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : payoutData.length > 0 ? (
              <div>
                {payoutData.slice(0, 10).map((item, index) => {
                  const rank = index + 1
                  return (
                    <div
                      key={item.id || `payout-${index}`}
                      className="flex items-center justify-between p-4 border-b border-[#222222] hover:bg-[#121212] transition-colors px-6"
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank Badge */}
                        <div className="w-8 text-center">
                          {rank <= 3 ? (
                            <div
                              className="flex items-center justify-center w-8 h-8 rounded-full"
                              style={{ backgroundColor: getRankColor(rank) }}
                            >
                              <span className="font-bold text-black">{rank}</span>
                            </div>
                          ) : (
                            <span className="text-[#666666] text-lg">{rank}</span>
                          )}
                        </div>

                        {/* Company Logo/Initials */}
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 flex items-center justify-center rounded-md text-center"
                            style={{
                              backgroundColor: item.brandcolour || "#333",
                            }}
                          >
                            {item.logourl ? (
                              <img
                                src={item.logourl || "/placeholder.svg"}
                                alt={item.companyname}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                  e.currentTarget.parentElement.innerHTML = getInitials(item.companyname)
                                }}
                              />
                            ) : (
                              <span className="text-white">{getInitials(item.companyname)}</span>
                            )}
                          </div>

                          {/* Company Info */}
                          <div>
                            <div className="font-medium text-white">{item.companyname}</div>
                            <div className="text-xs text-[#999999]">{formatDate(item.transactiondate)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Payout Amount */}
                      <div className="text-2xl text-white">{formatCurrency(item.payoutamount, 2)}</div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-[#999999]">
                No payouts found for this timeframe.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

