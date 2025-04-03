/* eslint-disable */

"use client"

import { useState, useEffect } from "react"
import {
  Line,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from "recharts"
import { Users } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface CompanyMonthlyUniquePaidTradersChartProps {
  companyName: string
}

const CompanyMonthlyUniquePaidTradersChart = ({ companyName }: CompanyMonthlyUniquePaidTradersChartProps) => {
  const [chartData, setChartData] = useState([])
  const [timeRange, setTimeRange] = useState("All Time")
  const [filteredStats, setFilteredStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [monthlyStats, setMonthlyStats] = useState([])
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
        console.log(`Fetching data for company: ${companyName}`)
        // Use the correct API endpoint
        const apiUrl = `/api/getCompanyAllStats?company=${encodeURIComponent(companyName)}&dataType=monthly`
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

        setMonthlyStats(data.monthly || [])
        setFilteredStats(data.monthly || [])
        console.log(`Received ${data.monthly?.length || 0} monthly records`)
      } catch (error) {
        console.error("Error fetching data:", error)
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

  // Filter data based on the selected time range
  useEffect(() => {
    if (!monthlyStats || monthlyStats.length === 0) return

    const now = new Date()
    let monthsToShow = 12 // Default to last 12 months

    if (timeRange === "All Time") {
      setFilteredStats(monthlyStats)
      return
    } else if (timeRange === "Last 6 Months") {
      monthsToShow = 6
    }

    // Calculate cutoff date
    const cutoffDate = new Date(now)
    cutoffDate.setMonth(now.getMonth() - monthsToShow)

    // Filter the data to only include the last X months
    const filteredData = monthlyStats.filter((entry) => {
      const entryDate = new Date(entry.year, new Date(entry.month + " 1, 2000").getMonth()) // Convert text month to date
      return entryDate >= cutoffDate
    })

    setFilteredStats(filteredData)
  }, [timeRange, monthlyStats])

  // Transform the filtered data into chart format
  useEffect(() => {
    if (!filteredStats || filteredStats.length === 0) return

    let previousMonthlyPaidTraders = null

    const transformedData = filteredStats.map((entry) => {
      const year = entry.year ?? new Date().getFullYear()

      const monthMap = {
        January: "01",
        February: "02",
        March: "03",
        April: "04",
        May: "05",
        June: "06",
        July: "07",
        August: "08",
        September: "09",
        October: "10",
        November: "11",
        December: "12",
      }

      const monthName = entry.month?.trim()
      const month = monthMap[monthName] ? `${monthMap[monthName]}/${year}` : `??/${year}`

      // Get unique paid traders count
      const uniquePaidTraders = Number.parseInt(entry.uniquereceivers) || 0

      console.log(`Month: ${month}, Unique paid traders: ${uniquePaidTraders}`)

      // Calculate Monthly Percentage Change
      let monthlyPercentChange = null
      if (previousMonthlyPaidTraders !== null) {
        monthlyPercentChange = ((uniquePaidTraders - previousMonthlyPaidTraders) / previousMonthlyPaidTraders) * 100
      }
      previousMonthlyPaidTraders = uniquePaidTraders

      return {
        month,
        uniquePaidTraders,
        monthlyPercentChange,
      }
    })

    console.log("Transformed chart data:", transformedData)
    setChartData(transformedData)
  }, [filteredStats])

  // Calculate average monthly unique paid traders
  const averageMonthlyPaidTraders = chartData.length
    ? (chartData.reduce((sum, item) => sum + item.uniquePaidTraders, 0) / chartData.length).toFixed(2)
    : 0

  // Format date range for display
  const dateRangeText = chartData.length
    ? `Showing data from ${chartData[0].month} to ${chartData[chartData.length - 1].month}`
    : ""

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0].payload
    const uniquePaidTraders = data.uniquePaidTraders.toLocaleString()
    const monthlyChange = data.monthlyPercentChange

    const formatPercent = (value) => {
      if (value === null || isNaN(value)) return ""
      return (
        <span className={`${value >= 0 ? "text-green-400" : "text-red-400"}`}>
          {value >= 0 ? "▲" : "▼"} {Math.abs(value).toFixed(2)}%
        </span>
      )
    }

    return (
      <div className="bg-black border border-[#666666] px-4 py-3 rounded shadow-lg">
        <p className="text-white font-[balboa] mb-1">{label}</p>
        <p className="text-white text-sm font-medium flex items-center">
          <span className="text-[#e9e9e9]">Monthly:</span> {uniquePaidTraders}&nbsp;
          {formatPercent(monthlyChange)}
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-[#0f0f0f] text-white rounded-lg border-[1px] border-[#666666] mb-[50px] pb-6">
        <div className="flex justify-between items-center mb-6 border-b-[1px] border-[#666666] p-6">
          <div>
            <div className="flex">
              <Users className="h-5 w-5 mr-2 mt-1 text-[#edb900]" />
              <h2 className="text-2xl font-[balboa]">Monthly Unique Paid Traders</h2>
            </div>
            <div>
              <p className="text-[#666666]">Historical monthly unique paid traders for {companyName}</p>
            </div>
          </div>

          <div className="relative">
            <div className="w-[170px] h-8 bg-[rgba(255,255,255,0.05)] rounded"></div>
          </div>
        </div>

        {/* Simple loading container with shimmer effect */}
        <div className="w-full h-[500px] px-4">
          <div className="w-full h-full bg-[#1a1a1a] rounded-lg animate-shimmer"></div>
        </div>

        <div className="mt-4 px-6 text-white text-xs">
          <div className="h-4 w-48 bg-[rgba(255,255,255,0.05)] rounded mb-1"></div>
          <div className="h-4 w-36 bg-[rgba(255,255,255,0.05)] rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#0f0f0f] text-white rounded-lg border-[1px] border-[#666666] mb-[50px] p-6 flex justify-center items-center h-[400px]">
        <div className="text-center">
          <Users className="h-10 w-10 mx-auto mb-4 text-red-500" />
          <p className="text-xl font-[balboa]">Error loading data for {companyName}</p>
          <p className="text-[#666666] mt-2">{error}</p>
        </div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-[#0f0f0f] text-white rounded-lg border-[1px] border-[#666666] mb-[50px] p-6 flex justify-center items-center h-[400px]">
        <div className="text-center">
          <Users className="h-10 w-10 mx-auto mb-4 text-[#edb900]" />
          <p className="text-xl font-[balboa]">No unique paid traders data available for {companyName}</p>
          <p className="text-[#666666] mt-2">We'll update this chart when data becomes available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0f0f0f] text-white rounded-lg border-[1px] border-[#666666] mb-[50px] pb-6">
      <div className="flex justify-between items-center mb-6 border-b-[1px] border-[#666666] p-6">
        <div>
          <div className="flex">
            <Users className="h-5 w-5 mr-2 mt-1 text-[#edb900]" />
            <h2 className="text-2xl font-[balboa]">Monthly Unique Paid Traders</h2>
          </div>
          <div>
            <p className="text-[#666666]">Historical monthly unique paid traders for {companyName}</p>
          </div>
        </div>

        <div className="relative">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="flex items-center gap-2 w-[170px] bg-[#1A1A1A] px-4 py-1 rounded-md cursor-pointer border border-[#333333] text-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border border-[#333333] rounded shadow-lg text-white">
              <SelectItem value="All Time">All Time</SelectItem>
              <SelectItem value="Last 12 Months">Last 12 Months</SelectItem>
              <SelectItem value="Last 6 Months">Last 6 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={true} horizontal={true} />

          <XAxis
            dataKey="month"
            angle={-45}
            textAnchor="end"
            tick={{ fontFamily: "Balboa", fill: "#666666", fontSize: 14 }}
            tickMargin={10}
            stroke="#444"
          />

          <YAxis
            yAxisId="left"
            tickFormatter={(value) => value.toLocaleString()}
            tick={{ fontFamily: "Balboa", fill: "#666666", fontSize: 14 }}
            domain={[0, "auto"]}
            stroke="#444"
          />

          <defs>
            <linearGradient id="uniquePaidTradersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a3e00" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#5a3e00" stopOpacity={0} />
            </linearGradient>
          </defs>

          <Area yAxisId="left" dataKey="uniquePaidTraders" stroke="none" fill="url(#uniquePaidTradersGradient)" />

          <ReferenceLine
            yAxisId="left"
            y={averageMonthlyPaidTraders}
            stroke="#5a3e00"
            strokeDasharray="5 5"
            strokeWidth={3}
            label={{
              value: "AVG",
              position: "right",
              fill: "#5a3e00",
              fontSize: 14,
              fontFamily: "Balboa",
            }}
          />

          <Tooltip content={CustomTooltip} />

          <Line
            yAxisId="left"
            dataKey="uniquePaidTraders"
            stroke="#ffb700"
            strokeWidth={3}
            dot={{ fill: "#ffb700", r: 5 }}
            activeDot={{ r: 8 }}
            type="monotone"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 text-white text-xs px-6">
        <p>{dateRangeText}</p>
        <p className="mt-1">
          Average monthly unique paid traders:{" "}
          {Number(averageMonthlyPaidTraders).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    </div>
  )
}

export default CompanyMonthlyUniquePaidTradersChart

