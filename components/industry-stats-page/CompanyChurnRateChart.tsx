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
import { UserX } from "lucide-react"

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

// Function to format month-year as MM/YYYY
const formatMonthYear = (monthYear) => {
  if (!monthYear) return "??/????"

  const parts = monthYear.trim().split(/\s+/)
  if (parts.length !== 2) return "??/????"

  const [monthName, year] = parts
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

  return `${monthMap[monthName] || "??"}/${year}`
}

const ChurnRateChart = ({ companyName, apiPath = "/api/getCompanyAllStats" }) => {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Add useEffect to inject the CSS into the document
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
    const fetchChurnRateData = async () => {
      if (!companyName) {
        setError("Company name is required")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const url = `${apiPath}?company=${encodeURIComponent(companyName)}&dataType=churnRate`
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()

        if (!data.churnRate || !Array.isArray(data.churnRate) || data.churnRate.length === 0) {
          setError("No churn rate data available for this company")
          setLoading(false)
          return
        }

        // Process the data
        const transformedData = data.churnRate
          .map((entry) => ({
            month: formatMonthYear(entry.month_year),
            churnRate: Number.parseFloat(entry.churn_rate) || 0,
            churnRateChange: Number.parseFloat(entry.churn_rate_change) || null,
            activeUsers: entry.total_users_last_year,
            activeUsersLast6Months: entry.active_users_last_6_months,
          }))
          .sort((a, b) => {
            // Sorting oldest to newest
            const [aMonth, aYear] = a.month.split("/")
            const [bMonth, bYear] = b.month.split("/")

            // Create date objects (using the first day of each month)
            return new Date(`${aYear}-${aMonth}-01`).getTime() - new Date(`${bYear}-${bMonth}-01`).getTime()
          })

        setChartData(transformedData)
        setLoading(false)
      } catch (err) {
        setError(`Failed to load churn rate data: ${err.message}`)
        setLoading(false)
      }
    }

    fetchChurnRateData()
  }, [companyName, apiPath])

  // Calculate Average Churn Rate
  const averageChurnRate = chartData.length
    ? (chartData.reduce((sum, item) => sum + item.churnRate, 0) / chartData.length).toFixed(2)
    : 0

  // Tooltip Logic
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0].payload
    const churnRate = data.churnRate.toFixed(2)
    const churnChange = data.churnRateChange
    const activeUsers = data.activeUsers
    const activeUsersLast6Months = data.activeUsersLast6Months

    const formatPercent = (value) => {
      if (value === null || isNaN(value)) return "—"
      return (
        <span className={`${value < 0 ? "text-green-400" : "text-red-400"}`}>
          {value < 0 ? "▼" : "▲"} {Math.abs(value).toFixed(2)}%
        </span>
      )
    }

    return (
      <div className="bg-black border border-[#666666] px-4 py-3 rounded shadow-lg">
        <p className="text-white font-[balboa] mb-1">{label}</p>
        <p className="text-white text-sm font-medium flex items-center">
          <span className="text-[#e9e9e9]">Churn Rate:</span> {churnRate}%&nbsp;
          {formatPercent(churnChange)}
        </p>
        <p className="text-white text-xs">
          <span className="text-[#e9e9e9]">Active Users:</span> {activeUsers}
        </p>
        <p className="text-white text-xs">
          <span className="text-[#e9e9e9]">Active Users (Last 6M):</span> {activeUsersLast6Months}
        </p>
      </div>
    )
  }

  // Render loading state with shimmer animation
  if (loading) {
    return (
      <div className="bg-[#0f0f0f] text-white pb-6 rounded-lg mb-[50px] border-[1px] border-[#666666] mt-[50px]">
        <div className="flex justify-between items-center mb-6 border-b-[1px] border-[#666666] p-6">
          <div>
            <div className="flex">
              <UserX className="h-5 w-5 mr-2 mt-1 text-[#edb900]" />
              <h2 className="text-2xl font-[balboa]">Churn Rate</h2>
            </div>
            <div>
              <p className="text-[#666666]">Historical paid traders churn rate for {companyName}</p>
            </div>
          </div>
        </div>

        {/* Shimmer loading skeleton for the chart */}
        <div className="w-full h-[500px] px-4 animate-shimmer">
          <div className="w-full h-full bg-[rgba(255,255,255,0.03)] rounded-lg relative overflow-hidden">
            {/* X-axis skeleton */}
            <div className="absolute bottom-0 left-0 right-0 h-10 flex justify-between px-10">
              {[...Array(8)].map((_, i) => (
                <div key={`x-${i}`} className="w-10 h-4 bg-[rgba(255,255,255,0.05)] rounded" />
              ))}
            </div>

            {/* Y-axis skeleton */}
            <div className="absolute top-10 bottom-10 left-0 w-10 flex flex-col justify-between">
              {[...Array(5)].map((_, i) => (
                <div key={`y-${i}`} className="h-4 w-16 bg-[rgba(255,255,255,0.05)] rounded" />
              ))}
            </div>

            {/* Line chart path skeleton */}
            <div className="absolute left-20 right-20 top-20 bottom-20">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d="M0,50 C10,40 20,60 30,50 C40,40 50,70 60,50 C70,30 80,50 90,40 L90,100 L0,100 Z"
                  fill="rgba(255,191,0,0.1)"
                  stroke="#ffb700"
                  strokeWidth="1"
                />
                <path
                  d="M0,50 C10,40 20,60 30,50 C40,40 50,70 60,50 C70,30 80,50 90,40"
                  fill="none"
                  stroke="#ffb700"
                  strokeWidth="3"
                />
                {/* Dots on the line */}
                {[0, 30, 60, 90].map((x, i) => (
                  <circle key={i} cx={x} cy={i % 2 === 0 ? 50 : 40} r="4" fill="#ffb700" />
                ))}
              </svg>
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

  // Render error state
  if (error) {
    return (
      <div
        className="bg-[#0f0f0f] text-white p-6 rounded-lg mb-[50px] border-[1px] border-[#666666] mt-[50px] flex flex-col items-center justify-center"
        style={{ minHeight: "500px" }}
      >
        <UserX className="h-8 w-8 text-red-500 mb-4" />
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  // If no data after loading
  if (chartData.length === 0) {
    return (
      <div
        className="bg-[#0f0f0f] text-white p-6 rounded-lg mb-[50px] border-[1px] border-[#666666] mt-[50px] flex flex-col items-center justify-center"
        style={{ minHeight: "500px" }}
      >
        <UserX className="h-8 w-8 text-[#edb900] mb-4" />
        <p>❌ No churn rate data available for {companyName}</p>
      </div>
    )
  }

  // Get the latest month from the data
  const latestMonth = chartData.length ? chartData[chartData.length - 1].month : "??/??"

  return (
    <div className="bg-[#0f0f0f] text-white pb-6 rounded-lg mb-[50px] border-[1px] border-[#666666] mt-[50px]">
      <div className="flex justify-between items-center mb-6 border-b-[1px] border-[#666666] p-6">
        <div>
          <div className="flex">
            <UserX className="h-5 w-5 mr-2 mt-1 text-[#edb900]" />
            <h2 className="text-2xl font-[balboa]">Churn Rate</h2>
          </div>
          <div>
            <p className="text-[#666666]">Historical paid traders churn rate for {companyName}</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          {/* Gradient Definition for Churn Rate */}
          <defs>
            <linearGradient id="churnRateGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a3e00" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#5a3e00" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={true} horizontal={true} />

          <XAxis
            dataKey="month"
            angle={-45}
            textAnchor="end"
            tick={{ fill: "#666666", fontSize: 14, fontFamily: "Balboa" }}
            tickMargin={10}
            stroke="#444"
          />

          <YAxis
            tickFormatter={(value) => `${value.toFixed(2)}%`}
            tick={{ fill: "#666666", fontSize: 14, fontFamily: "Balboa" }}
          />

          {/* Churn Rate Area with Gradient */}
          <Area dataKey="churnRate" stroke="none" fill="url(#churnRateGradient)" />

          <ReferenceLine
            y={averageChurnRate}
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
            dataKey="churnRate"
            stroke="#ffb700"
            strokeWidth={3}
            dot={{ fill: "#ffb700", r: 5 }}
            activeDot={{ r: 8 }}
            type="monotone"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 px-6 text-white text-xs">
        <p>
          Showing data from {chartData.length ? chartData[0].month : "??/??"} to {latestMonth}
        </p>
        <p>Average monthly churn rate: {averageChurnRate}%</p>
      </div>
    </div>
  )
}

export default ChurnRateChart

