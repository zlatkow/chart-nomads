/* eslint-disable */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, AlertTriangle, Code } from "lucide-react"

// Add shimmer animation CSS
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

interface CompanyTopPayoutsProps {
  companyName: string
}

export default function CompanyTopPayouts({ companyName }: CompanyTopPayoutsProps) {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [payoutData, setPayoutData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [apiStatus, setApiStatus] = useState(null)
  const [errorDetails, setErrorDetails] = useState(null)

  // Add shimmer animation to document
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

  // Fetch data from the API whenever filter changes
  useEffect(() => {
    const fetchPayouts = async () => {
      setLoading(true)
      setError(null)
      setApiStatus(null)
      setErrorDetails(null)

      try {
        console.log(`[UI] Fetching top payouts for company: ${companyName}, timeFilter: ${selectedFilter}`)
        // Use the correct API endpoint with company name and dataType parameters
        const apiUrl = `/api/getCompanyAllStats?company=${encodeURIComponent(companyName)}&dataType=topPayouts&timeFilter=${encodeURIComponent(selectedFilter)}`
        console.log(`[UI] API URL: ${apiUrl}`)

        const response = await fetch(apiUrl)
        console.log(`[UI] API response status: ${response.status}`)

        // Store the API status code for better error handling
        setApiStatus(response.status)

        const data = await response.json()

        // Log the response data structure
        console.log("[UI] API response structure:", Object.keys(data))
        console.log("[UI] topPayouts array length:", data.topPayouts?.length || 0)
        if (data.topPayouts?.length > 0) {
          console.log("[UI] First payout item structure:", Object.keys(data.topPayouts[0]))
          console.log("[UI] First payout item sample:", data.topPayouts[0])
        }

        if (!response.ok) {
          // Store detailed error information if available
          if (data.details) {
            setErrorDetails(data.details)
            console.error("[UI] API error details:", data.details)
          }
          throw new Error(data.error || `API returned status ${response.status}`)
        }

        setPayoutData(data.topPayouts || [])
        console.log(`[UI] Successfully loaded ${data.topPayouts?.length || 0} payouts`)
      } catch (error) {
        console.error("[UI] Error fetching top payouts:", error)
        setError(error.message)
        setPayoutData([])
      } finally {
        setLoading(false)
      }
    }

    if (companyName) {
      fetchPayouts()
    } else {
      console.warn("[UI] No company name provided")
      setLoading(false)
    }
  }, [selectedFilter, companyName])

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

  // Render appropriate error message based on API status and error details
  const renderErrorMessage = () => {
    // Check if the error is related to the missing SQL function
    if (errorDetails && errorDetails.message && errorDetails.message.includes("Could not find the function")) {
      return (
        <div className="text-center">
          <Code className="h-10 w-10 mx-auto mb-4 text-amber-500" />
          <p className="text-xl font-[balboa]">Database Function Not Found</p>
          <p className="text-[#666666] mt-2">The required database function for top payouts is not yet available.</p>
          <p className="text-[#666666] mt-2">Please contact the development team to implement this feature.</p>
        </div>
      )
    }

    // Generic server error
    if (apiStatus === 500) {
      return (
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 mx-auto mb-4 text-red-500" />
          <p className="text-xl font-[balboa]">Server Error</p>
          <p className="text-[#666666] mt-2">
            We're experiencing issues with our database. Our team has been notified.
          </p>
          <p className="text-[#666666] mt-2">Please try again later or contact support if the issue persists.</p>
        </div>
      )
    }

    // Generic error
    return (
      <div className="text-center">
        <DollarSign className="h-10 w-10 mx-auto mb-4 text-red-500" />
        <p className="text-xl font-[balboa]">Error loading payouts for {companyName}</p>
        <p className="text-[#666666] mt-2">{error}</p>
      </div>
    )
  }

  // Debug output during development
  useEffect(() => {
    if (payoutData.length > 0) {
      console.log("[UI] Rendering payouts data:", payoutData)
    }
  }, [payoutData])

  // Render skeleton loading rows
  const renderSkeletonRows = () => {
    return Array(10)
      .fill(0)
      .map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="flex items-center justify-between p-4 border-b border-[#222222] px-6 animate-shimmer"
        >
          <div className="flex items-center gap-4">
            {/* Rank Badge Skeleton */}
            <div className="w-8 text-center">
              {index < 3 ? (
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: `rgba(255,255,255,${0.1 - index * 0.02})` }}
                ></div>
              ) : (
                <div className="w-4 h-4 mx-auto bg-[rgba(255,255,255,0.05)] rounded"></div>
              )}
            </div>

            {/* Company Logo/Info Skeleton */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[rgba(255,255,255,0.05)] rounded-md"></div>
              <div>
                <div className="h-4 w-32 bg-[rgba(255,255,255,0.08)] rounded mb-2"></div>
                <div className="h-3 w-20 bg-[rgba(255,255,255,0.05)] rounded"></div>
              </div>
            </div>
          </div>

          {/* Payout Amount Skeleton */}
          <div className="h-6 w-24 bg-[rgba(255,255,255,0.08)] rounded"></div>
        </div>
      ))
  }

  return (
    <div className="w-full bg-[#0f0f0f] rounded-[10px] border-[1px] border-[#666666] mb-[50px]">
      <div className="w-full">
        <div className="flex justify-between border-b-[1px] border-b-[#666666] p-6">
          <div>
            <div className="flex">
              <DollarSign className="h-5 w-5 mr-2 mt-1 text-[#edb900]" />
              <h2 className="text-2xl font-[balboa]">Top 10 Payouts</h2>
            </div>
            <div>
              <p className="text-[#666666]">Highest payouts made by {companyName}</p>
            </div>
          </div>
          {/* Filter Dropdown */}
          {loading ? (
            <div className="w-[170px] h-8 bg-[rgba(255,255,255,0.05)] rounded"></div>
          ) : (
            <Select
              value={selectedFilter}
              onValueChange={(value) => {
                setSelectedFilter(value)
              }}
            >
              <SelectTrigger className="w-[170px] bg-[#1A1A1A] px-4 py-1 rounded-md cursor-pointer border border-[#333333] text-gray-300">
                <SelectValue />
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
          )}
        </div>

        <Card className="w-full bg-[#0F0F0F] border-[#0f0f0f] overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div>{renderSkeletonRows()}</div>
            ) : error ? (
              <div className="flex items-center justify-center h-[200px] text-[#999999]">{renderErrorMessage()}</div>
            ) : payoutData.length > 0 ? (
              <div>
                {payoutData.map((item) => (
                  <div
                    key={item.id || `payout-${item.rank}`}
                    className="flex items-center justify-between p-4 border-b border-[#222222] hover:bg-[#121212] transition-colors px-6"
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div className="w-8 text-center">
                        {item.rank <= 3 ? (
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-full"
                            style={{ backgroundColor: getRankColor(item.rank) }}
                          >
                            <span className="font-bold text-black">{item.rank}</span>
                          </div>
                        ) : (
                          <span className="text-[#666666] text-lg">{item.rank}</span>
                        )}
                      </div>

                      {/* Company Logo/Initials */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 flex items-center justify-center rounded-md text-center"
                          style={{
                            backgroundColor: item.brandColour || item.brandcolour || "#333",
                          }}
                        >
                          {item.logoUrl || item.logourl ? (
                            <img
                              src={item.logoUrl || item.logourl || "/placeholder.svg"}
                              alt={item.companyName || item.companyname}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                                e.currentTarget.parentElement.innerHTML = getInitials(
                                  item.companyName || item.companyname,
                                )
                              }}
                            />
                          ) : (
                            <span className="text-white">{getInitials(item.companyName || item.companyname)}</span>
                          )}
                        </div>

                        {/* Company Info */}
                        <div>
                          <div className="font-medium text-white">{item.companyName || item.companyname}</div>
                          <div className="text-xs text-[#999999]">
                            {formatDate(item.transactionDate || item.transactiondate)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payout Amount */}
                    <div className="text-2xl text-white">
                      {formatCurrency(item.payoutAmount || item.payoutamount, 2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-[#999999]">
                <div className="text-center">
                  <DollarSign className="h-10 w-10 mx-auto mb-4 text-[#edb900]" />
                  <p className="text-xl font-[balboa]">No payouts found for {companyName}</p>
                  <p className="text-[#666666] mt-2">We'll update this when data becomes available.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

