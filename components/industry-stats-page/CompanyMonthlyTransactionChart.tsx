/* eslint-disable */

"use client"

import { useState, useEffect } from "react"
import {
  Area,
  Bar,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { BarChart2 } from "lucide-react"
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

interface CompanyMonthlyTransactionChartProps {
  companyName: string
}

const CompanyMonthlyTransactionChart = ({ companyName }: CompanyMonthlyTransactionChartProps) => {
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

    let cumulativeTransactions = 0
    let previousMonthlyTransactions = null

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

      // Get transaction count
      const monthlyTransactions = Number.parseInt(entry.totaltransactions) || 0
      cumulativeTransactions += monthlyTransactions

      console.log(`Month: ${month}, Transactions: ${monthlyTransactions}, Cumulative: ${cumulativeTransactions}`)

      // Calculate Monthly Percentage Change
      let monthlyPercentChange = null
      if (previousMonthlyTransactions !== null) {
        monthlyPercentChange = ((monthlyTransactions - previousMonthlyTransactions) / previousMonthlyTransactions) * 100
      }
      previousMonthlyTransactions = monthlyTransactions

      return {
        month,
        monthlyTransactions,
        cumulativeTransactions,
        monthlyPercentChange,
      }
    })

    console.log("Transformed chart data:", transformedData)
    setChartData(transformedData)
  }, [filteredStats])

  // Calculate average monthly transactions
  const averageMonthlyTransactions = chartData.length
    ? (chartData.reduce((sum, item) => sum + item.monthlyTransactions, 0) / chartData.length).toFixed(2)
    : 0

  // Get total cumulative transactions (last item in the array)
  const totalCumulativeTransactions = chartData.length
    ? chartData[chartData.length - 1].cumulativeTransactions.toLocaleString()
    : 0

  // Format date range for display
  const dateRangeText = chartData.length
    ? `Showing data from ${chartData[0].month} to ${chartData[chartData.length - 1].month}`
    : ""

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0].payload
    const monthlyTransactions = data.monthlyTransactions.toLocaleString()
    const cumulativeTransactions = data.cumulativeTransactions.toLocaleString()
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
        <p className="text-white text-sm font-medium">
          <span className="text-[#e9e9e9]">Cumulative:</span> {cumulativeTransactions}
        </p>
        <p className="text-white text-sm font-medium flex items-center">
          <span className="text-[#e9e9e9]">Monthly:</span> {monthlyTransactions}&nbsp;
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
              <BarChart2 className="h-5 w-5 mr-2 mt-1 text-[#edb900]" />
              <h2 className="text-2xl font-[balboa]">Monthly & Cumulative Transactions</h2>
            </div>
            <div>
              <p className="text-[#666666]">Historical monthly & cumulative payout transactions for {companyName}</p>
            </div>
          </div>

          <div className="relative">
            <div className="w-[170px] h-8 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer"></div>
          </div>
        </div>

        {/* Shimmer loading skeleton for the chart */}
        <div className="w-full h-[500px] px-4 animate-shimmer">
          <div className="w-full h-full bg-[rgba(255,255,255,0.03)] rounded-lg relative overflow-hidden">
            {/* X-axis skeleton */}
            <div className="absolute bottom-0 left-0 right-0 h-10 flex justify-between px-10">
              {[...Array(6)].map((_, i) => (
                <div key={`x-${i}`} className="w-10 h-4 bg-[rgba(255,255,255,0.05)] rounded" />
              ))}
            </div>

            {/* Y-axis skeleton */}
            <div className="absolute top-10 bottom-10 left-0 w-10 flex flex-col justify-between">
              {[...Array(5)].map((_, i) => (
                <div key={`y-${i}`} className="h-4 w-16 bg-[rgba(255,255,255,0.05)] rounded" />
              ))}
            </div>

            {/* Chart bars skeleton */}
            <div className="absolute left-20 right-20 bottom-20 top-20 flex items-end justify-between">
              {[...Array(12)].map((_, i) => (
                <div
                  key={`bar-${i}`}
                  className="w-8 bg-[rgba(237,185,0,0.2)] rounded-t-lg"
                  style={{ height: `${20 + Math.random() * 60}%` }}
                />
              ))}
            </div>

            {/* Area chart line skeleton */}
            <div
              className="absolute left-20 right-20 bottom-20 h-1 bg-[rgba(255,191,0,0.3)]"
              style={{
                clipPath:
                  "polygon(0 0, 15% 30%, 30% 10%, 45% 50%, 60% 30%, 75% 80%, 90% 40%, 100% 20%, 100% 100%, 0 100%)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-[rgba(255,191,0,0.1)]"></div>
            </div>

            {/* Reference line skeleton */}
            <div className="absolute left-20 right-20 h-[1px] bg-[#5a3e00] border-dashed" style={{ bottom: "45%" }}>
              <div className="absolute right-0 -top-3 bg-[#5a3e00] text-[#5a3e00] px-2 rounded text-xs">AVG</div>
            </div>
          </div>
        </div>

        <div className="mt-4 px-6 text-white text-xs">
          <p className="h-4 w-48 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer mb-1"></p>
          <p className="h-4 w-36 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer"></p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#0f0f0f] text-white rounded-lg border-[1px] border-[#666666] mb-[50px] p-6 flex justify-center items-center h-[400px]">
        <div className="text-center">
          <BarChart2 className="h-10 w-10 mx-auto mb-4 text-red-500" />
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
          <BarChart2 className="h-10 w-10 mx-auto mb-4 text-[#edb900]" />
          <p className="text-xl font-[balboa]">No transaction data available for {companyName}</p>
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
            <BarChart2 className="h-5 w-5 mr-2 mt-1 text-[#edb900]" />
            <h2 className="text-2xl font-[balboa]">Monthly & Cumulative Transactions</h2>
          </div>
          <div>
            <p className="text-[#666666]">Historical monthly & cumulative payout transactions for {companyName}</p>
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
          {/* Gradient Definition for Cumulative Amount */}
          <defs>
            <linearGradient id="cumulativeTransactionsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a3e00" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#5a3e00" stopOpacity={0} />
            </linearGradient>
          </defs>

          <ReferenceLine
            yAxisId="left"
            y={averageMonthlyTransactions}
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
            orientation="left"
            tickFormatter={(value) => value.toLocaleString()}
            tick={{ fontFamily: "Balboa", fill: "#666666", fontSize: 14 }}
            domain={[0, "auto"]}
            stroke="#444"
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => value.toLocaleString()}
            tick={{ fontFamily: "Balboa", fill: "#666666", fontSize: 14 }}
            domain={[0, "auto"]}
            stroke="#444"
          />

          <Tooltip content={CustomTooltip} />

          {/* Cumulative Transactions Area with Gradient */}
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="cumulativeTransactions"
            stroke="#ffb700"
            fill="url(#cumulativeTransactionsGradient)"
          />

          {/* Monthly Transactions Bars */}
          <Bar
            yAxisId="left"
            dataKey="monthlyTransactions"
            fill="#ffb700"
            radius={[10, 10, 0, 0]}
            activeBar={{ fill: "#c99400" }} // Darker yellow on hover
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 text-white text-xs px-6">
        <p>{dateRangeText}</p>
        <p className="mt-1">
          Average monthly transactions:{" "}
          {Number(averageMonthlyTransactions).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          | Total cumulative transactions: {totalCumulativeTransactions}
        </p>
      </div>
    </div>
  )
}

export default CompanyMonthlyTransactionChart

