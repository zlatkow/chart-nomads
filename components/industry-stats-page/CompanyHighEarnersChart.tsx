/* eslint-disable */
"use client"

import { useState, useEffect } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign } from "lucide-react"

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

interface PayoutStatsChartProps {
  companyName: string
}

export default function PayoutStatsChart({ companyName }: PayoutStatsChartProps) {
  const [activeIndexAmount, setActiveIndexAmount] = useState(null)
  const [activeIndexCount, setActiveIndexCount] = useState(null)
  const [donutStats, setDonutStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Fetching donut stats for company: ${companyName}`)
        const apiUrl = `/api/getCompanyAllStats?company=${encodeURIComponent(companyName)}&dataType=donutStats`
        console.log(`API URL: ${apiUrl}`)

        const response = await fetch(apiUrl)
        console.log(`API response status: ${response.status}`)

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`)
        }

        const data = await response.json()
        console.log("API response data:", data)

        if (data.error) {
          throw new Error(data.error)
        }

        setDonutStats(data.donutStats || null)
        console.log(`Received donut stats data:`, data.donutStats)
      } catch (error) {
        console.error("Error fetching donut stats data:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (companyName) {
      fetchData()
    } else {
      console.warn("No company name provided")
      setLoading(false)
    }
  }, [companyName])

  // Handle loading state with shimmer animation
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-8">
        {/* Left Donut Chart Skeleton */}
        <Card className="bg-[#0f0f0f] font-[balboa] shadow-lg border border-[#666666]">
          <CardHeader className="pb-5 mb-5 border-b-[1px] border-[#666666]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-[balboa] flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-[#edb900]" />
                  Unique Traders
                </CardTitle>
                <CardDescription className="text-gray-400">Based on total received amount</CardDescription>
              </div>
              <div className="h-8 w-20 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full flex items-center justify-center">
              <div className="relative w-[360px] h-[360px] animate-shimmer">
                {/* Outer circle */}
                <div className="absolute inset-0 rounded-full border-8 border-[rgba(255,255,255,0.05)]"></div>

                {/* Inner circle (donut hole) */}
                <div className="absolute inset-[80px] rounded-full bg-[#0f0f0f]"></div>

                {/* Donut segments */}
                {[...Array(4)].map((_, i) => (
                  <div
                    key={`segment-left-${i}`}
                    className="absolute inset-0 rounded-full"
                    style={{
                      clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((Math.PI * 2 * i) / 4)}% ${50 + 50 * Math.sin((Math.PI * 2 * i) / 4)}%, ${50 + 50 * Math.cos((Math.PI * 2 * (i + 1)) / 4)}% ${50 + 50 * Math.sin((Math.PI * 2 * (i + 1)) / 4)}%)`,
                      background: `rgba(237, 185, 0, ${0.2 + i * 0.15})`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Donut Chart Skeleton */}
        <Card className="bg-[#0f0f0f] shadow-lg font-[balboa] border border-[#666666]">
          <CardHeader className="pb-5 mb-5 border-b-[1px] border-[#666666]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-[balboa] flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-[#edb900]" />
                  Unique Traders
                </CardTitle>
                <CardDescription className="text-gray-400">Based on total payouts count</CardDescription>
              </div>
              <div className="h-8 w-20 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full flex items-center justify-center">
              <div className="relative w-[360px] h-[360px] animate-shimmer">
                {/* Outer circle */}
                <div className="absolute inset-0 rounded-full border-8 border-[rgba(255,255,255,0.05)]"></div>

                {/* Inner circle (donut hole) */}
                <div className="absolute inset-[80px] rounded-full bg-[#0f0f0f]"></div>

                {/* Donut segments */}
                {[...Array(4)].map((_, i) => (
                  <div
                    key={`segment-right-${i}`}
                    className="absolute inset-0 rounded-full"
                    style={{
                      clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((Math.PI * 2 * i) / 4 + Math.PI / 6)}% ${50 + 50 * Math.sin((Math.PI * 2 * i) / 4 + Math.PI / 6)}%, ${50 + 50 * Math.cos((Math.PI * 2 * (i + 1)) / 4 + Math.PI / 6)}% ${50 + 50 * Math.sin((Math.PI * 2 * (i + 1)) / 4 + Math.PI / 6)}%)`,
                      background: `rgba(237, 185, 0, ${0.2 + i * 0.15})`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-[#0f0f0f] text-white rounded-lg border-[1px] border-[#666666] mb-[50px] p-6 flex justify-center items-center h-[400px]">
        <div className="text-center">
          <DollarSign className="h-10 w-10 mx-auto mb-4 text-red-500" />
          <p className="text-xl font-[balboa]">Error loading donut stats for {companyName}</p>
          <p className="text-[#666666] mt-2">{error}</p>
        </div>
      </div>
    )
  }

  // Handle empty state
  if (!donutStats || (!donutStats.payoutCount?.length && !donutStats.paidAmount?.length)) {
    return (
      <div className="bg-[#0f0f0f] text-white rounded-lg border-[1px] border-[#666666] mb-[50px] p-6 flex justify-center items-center h-[400px]">
        <div className="text-center">
          <DollarSign className="h-10 w-10 mx-auto mb-4 text-[#edb900]" />
          <p className="text-xl font-[balboa]">No high earner stats available for {companyName}</p>
          <p className="text-[#666666] mt-2">We'll update this chart when data becomes available.</p>
        </div>
      </div>
    )
  }

  // ✅ Extract data arrays
  const payoutAmountData = Array.isArray(donutStats.paidAmount) ? donutStats.paidAmount : []
  const payoutCountData = Array.isArray(donutStats.payoutCount) ? donutStats.payoutCount : []

  // ✅ Extract unique paid traders safely (should be the same in both datasets)
  const uniquePaidTraders =
    (payoutAmountData.length > 0 && payoutAmountData[0]?.total_unique_traders) ||
    (payoutCountData.length > 0 && payoutCountData[0]?.total_unique_traders) ||
    0

  // Define the category order
  const categoryOrder = [
    "< $10,000",
    "$10,000+",
    "$50,000+",
    "$100,000+",
    "< 10 Payouts",
    "10+ Payouts",
    "20+ Payouts",
    "30+ Payouts",
  ]

  // Sort function to maintain consistent category order
  const sortByCategory = (data) => {
    return [...data].sort((a, b) => {
      const indexA = categoryOrder.indexOf(a.name)
      const indexB = categoryOrder.indexOf(b.name)

      // If both categories are in our predefined order, sort by that order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB
      }

      // If only one category is in our list, prioritize it
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1

      // For any categories not in our list, sort alphabetically
      return a.name.localeCompare(b.name)
    })
  }

  // ✅ Generate Color Shades Separately for Each Chart
  const generateColorShades = (data) => {
    if (!Array.isArray(data) || data.length === 0) return []

    // Sort data by count to identify the largest segment
    const sortedData = [...data].sort((a, b) => b.count - a.count)

    // Create a mapping of original indices to sorted positions
    const positionMap = new Map()
    sortedData.forEach((item, index) => {
      const originalIndex = data.findIndex((d) => d.category === item.category && d.count === item.count)
      positionMap.set(originalIndex, index)
    })

    // Use the same gold color as the reference code
    const baseColor = [237, 185, 0] // RGB for Gold

    // Create colors for each segment based on its size rank
    return data.map((_, index) => {
      const position = positionMap.get(index)

      // First position (largest) gets the brightest color
      if (position === 0) {
        return `rgb(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]})`
      }

      // Other segments get progressively darker based on their size rank
      const darkFactor = 0.25
      const factor = 1 - position * darkFactor
      return `rgb(${Math.round(baseColor[0] * factor)}, ${Math.round(baseColor[1] * factor)}, ${Math.round(baseColor[2] * factor)})`
    })
  }

  // ✅ Generate Separate Colors for Each Dataset
  const COLORS_AMOUNT = generateColorShades(payoutAmountData)
  const COLORS_COUNT = generateColorShades(payoutCountData)

  // ✅ Format Data for Charts
  let formattedAmountData = payoutAmountData
    .map((item, index) => ({
      name: item.category || "Unknown",
      count: item.count ?? 0, // 🔥 Ensure count exists
      percentage: item.percentage ?? 0,
      color: COLORS_AMOUNT[index],
    }))
    .filter((item) => item.count > 0) // 🔥 Ensure we only keep items with valid count

  let formattedCountData = payoutCountData
    .map((item, index) => ({
      name: item.category || "Unknown",
      count: item.count ?? 0,
      percentage: item.percentage ?? 0,
      color: COLORS_COUNT[index],
    }))
    .filter((item) => item.count > 0) // 🔥 Ensure we only keep items with valid count

  // Apply sorting
  formattedAmountData = sortByCategory(formattedAmountData)
  formattedCountData = sortByCategory(formattedCountData)

  // ✅ Active Sector Styling
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="white"
          strokeWidth={2}
        />
        <text x={cx} y={cy - 30} dy={8} textAnchor="middle" fill="white" className="text-lg">
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="white" className="text-3xl">
          {value.toLocaleString()}
        </text>
        <text x={cx} y={cy + 30} dy={8} textAnchor="middle" fill="white" className="text-md opacity-70">
          {(percent * 100).toFixed(1)}%
        </text>
      </g>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-8">
      {/* 🔶 High Earning Unique Traders (Amount) */}
      <Card className="bg-[#0f0f0f] font-[balboa] shadow-lg border border-[#666666]">
        <CardHeader className="pb-5 mb-5 border-b-[1px] border-[#666666]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-[balboa] flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-[#edb900]" />
                Unique Traders
              </CardTitle>
              <CardDescription className="text-gray-400">Based on total received amount</CardDescription>
            </div>
            <Badge className="text-2xl text-[#edb900] font-[balboa] border-[#666666]">
              {uniquePaidTraders.toLocaleString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            {formattedAmountData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndexAmount}
                    activeShape={renderActiveShape}
                    data={formattedAmountData}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={180}
                    stroke="#0f0f0f"
                    strokeWidth={1}
                    paddingAngle={1}
                    dataKey="count"
                    onMouseEnter={(_, index) => setActiveIndexAmount(index)}
                    onMouseLeave={() => setActiveIndexAmount(null)}
                  >
                    {formattedAmountData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">No data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 🔷 High Earning Unique Traders (Count) */}
      <Card className="bg-[#0f0f0f] shadow-lg font-[balboa] border border-[#666666]">
        <CardHeader className="pb-5 mb-5 border-b-[1px] border-[#666666]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-[balboa] flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-[#edb900]" />
                Unique Traders
              </CardTitle>
              <CardDescription className="text-gray-400">Based on total payouts count</CardDescription>
            </div>
            <Badge className="text-2xl text-[#edb900] font-[balboa] border-[#666666]">
              {uniquePaidTraders.toLocaleString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            {formattedCountData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndexCount}
                    activeShape={renderActiveShape}
                    data={formattedCountData}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={180}
                    stroke="#0f0f0f"
                    strokeWidth={1}
                    paddingAngle={1}
                    dataKey="count"
                    onMouseEnter={(_, index) => setActiveIndexCount(index)}
                    onMouseLeave={() => setActiveIndexCount(null)}
                  >
                    {formattedCountData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">No data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

