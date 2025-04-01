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
import { UserX, Loader2 } from "lucide-react"

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

const ChurnRateChart = ({ companyName, apiPath = "/api" }) => {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

        // Log the API request for debugging
        const url = `${apiPath}?company=${encodeURIComponent(companyName)}&dataType=churnRate`
        console.log(`Fetching churn rate data from: ${url}`)

        const response = await fetch(url)

        // Log the response status for debugging
        console.log(`API response status: ${response.status}`)

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()

        // Log the response data for debugging
        console.log("API response data:", data)

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
            // Sorting oldest to newest - MM/YYYY format
            const [aMonth, aYear] = a.month.split("/")
            const [bMonth, bYear] = b.month.split("/")

            // Create date objects (using the first day of each month)
            return new Date(`${aYear}-${aMonth}-01`).getTime() - new Date(`${bYear}-${bMonth}-01`).getTime()
          })

        setChartData(transformedData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching churn rate data:", err)
        setError(`Failed to load churn rate data: ${err.message}`)
        setLoading(false)
      }
    }

    // Call the function immediately
    fetchChurnRateData()
  }, [companyName, apiPath]) // Re-run when companyName or apiPath changes

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

  // Render loading state
  if (loading) {
    return (
      <div
        className="bg-[#0f0f0f] text-white p-6 rounded-lg mb-[50px] border-[1px] border-[#666666] mt-[50px] flex flex-col items-center justify-center"
        style={{ minHeight: "500px" }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-[#edb900] mb-4" />
        <p>Loading churn rate data...</p>
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
            <h2 className="text-2xl font-[balboa]">{companyName} Churn Rate</h2>
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

