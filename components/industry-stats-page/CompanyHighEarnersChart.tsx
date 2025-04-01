/* eslint-disable */
"use client"

import { useState, useEffect } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign } from "lucide-react"

interface PayoutStatsChartProps {
  companyName: string
}

export default function PayoutStatsChart({ companyName }: PayoutStatsChartProps) {
  const [activeIndexAmount, setActiveIndexAmount] = useState(null)
  const [activeIndexCount, setActiveIndexCount] = useState(null)
  const [donutStats, setDonutStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  // Handle loading state
  if (loading) {
    return (
      <div className="bg-[#0f0f0f] text-white rounded-lg border-[1px] border-[#666666] mb-[50px] p-6 flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#edb900]"></div>
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

  // ✅ Generate Color Shades Separately for Each Chart
  const generateColorShades = (data) => {
    if (!Array.isArray(data) || data.length === 0) return []

    // Use a brighter base color - this is closer to the bright yellow in the first image
    const baseColor = [255, 191, 0] // Bright gold/yellow RGB

    // Create colors for each segment
    return data.map((_, index) => {
      // First segment (usually the largest) gets the brightest color
      if (index === 0) {
        return `rgb(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]})`
      }

      // Other segments get progressively darker
      const factor = 0.7 - index * 0.1 // Less dramatic darkening
      return `rgb(${Math.round(baseColor[0] * factor)}, ${Math.round(baseColor[1] * factor)}, ${Math.round(baseColor[2] * factor)})`
    })
  }

  // ✅ Generate Separate Colors for Each Dataset
  const COLORS_AMOUNT = generateColorShades(payoutAmountData)
  const COLORS_COUNT = generateColorShades(payoutCountData)

  // ✅ Format Data for Charts
  const formattedAmountData = payoutAmountData
    .map((item, index) => ({
      name: item.category || "Unknown",
      count: item.count ?? 0, // 🔥 Ensure count exists
      percentage: item.percentage ?? 0,
      color: COLORS_AMOUNT[index],
    }))
    .filter((item) => item.count > 0) // 🔥 Ensure we only keep items with valid count

  const formattedCountData = payoutCountData
    .map((item, index) => ({
      name: item.category || "Unknown",
      count: item.count ?? 0,
      percentage: item.percentage ?? 0,
      color: COLORS_COUNT[index],
    }))
    .filter((item) => item.count > 0) // 🔥 Ensure we only keep items with valid count

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
                    startAngle={90}
                    endAngle={-270}
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
                    startAngle={90}
                    endAngle={-270}
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

