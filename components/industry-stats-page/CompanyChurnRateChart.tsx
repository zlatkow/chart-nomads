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
import { UserX, Loader2, AlertCircle, Check, Database, LineChart, Bug, Waves } from "lucide-react"

// Function to format month-year as MM/YYYY
const formatMonthYear = (monthYear) => {
  if (!monthYear) return "??/????"

  console.log(`🔄 Formatting month year: "${monthYear}"`)
  const parts = monthYear.trim().split(/\s+/)
  if (parts.length !== 2) {
    console.log(`⚠️ Invalid month-year format: ${monthYear}`)
    return "??/????"
  }

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

  const result = `${monthMap[monthName] || "??"}/${year}`
  console.log(`🔄 Formatted: ${monthName} ${year} → ${result}`)
  return result
}

const ChurnRateChart = ({ companyName, apiPath = "/api" }) => {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [apiDetails, setApiDetails] = useState({
    requestUrl: "",
    responseStatus: null,
    responseTime: null,
  })

  // Fetch data from the API
  useEffect(() => {
    const fetchChurnRateData = async () => {
      console.log(`🚀 Starting data fetch for company: "${companyName}"`)

      if (!companyName) {
        console.log(`❌ No company name provided`)
        setError("Company name is required")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        console.log(`⏳ Setting loading state to true`)

        // Log the API request for debugging
        const url = `${apiPath}?company=${encodeURIComponent(companyName)}&dataType=churnRate`
        console.log(`🔗 API Request URL: ${url}`)
        setApiDetails((prev) => ({ ...prev, requestUrl: url }))

        const startTime = Date.now()
        console.log(`⏱️ Starting API request at: ${new Date().toISOString()}`)

        const response = await fetch(url)

        const endTime = Date.now()
        const responseTime = endTime - startTime
        console.log(`⏱️ API response received in ${responseTime}ms`)
        setApiDetails((prev) => ({ ...prev, responseTime }))

        // Log the response status for debugging
        console.log(`🔄 API response status: ${response.status}`)
        setApiDetails((prev) => ({ ...prev, responseStatus: response.status }))

        if (!response.ok) {
          const responseText = await response.text()
          console.error(`❌ API error response body:`, responseText)
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()

        // Log the response data for debugging
        console.log(`✅ API response data received:`, data)
        console.log(`📊 ChurnRate array exists: ${Boolean(data.churnRate)}`)
        console.log(`📊 ChurnRate is array: ${Array.isArray(data.churnRate)}`)
        console.log(`📊 ChurnRate array length: ${data.churnRate ? data.churnRate.length : 0}`)

        if (!data.churnRate || !Array.isArray(data.churnRate) || data.churnRate.length === 0) {
          console.log(`⚠️ No churn rate data available for this company`)
          setError("No churn rate data available for this company")
          setLoading(false)
          return
        }

        // Show first data item as sample
        console.log(`📋 Sample data item:`, data.churnRate[0])

        // Process the data
        console.log(`🔄 Processing ${data.churnRate.length} data items`)
        const transformedData = data.churnRate
          .map((entry, index) => {
            console.log(`🔄 Processing item ${index + 1}/${data.churnRate.length}:`, entry)
            return {
              month: formatMonthYear(entry.month_year),
              churnRate: Number.parseFloat(entry.churn_rate) || 0,
              churnRateChange: Number.parseFloat(entry.churn_rate_change) || null,
              activeUsers: entry.total_users_last_year,
              activeUsersLast6Months: entry.active_users_last_6_months,
            }
          })
          .sort((a, b) => {
            // Sorting oldest to newest - MM/YYYY format
            console.log(`🔄 Sorting: ${a.month} vs ${b.month}`)
            const [aMonth, aYear] = a.month.split("/")
            const [bMonth, bYear] = b.month.split("/")

            // Create date objects (using the first day of each month)
            const aDate = new Date(`${aYear}-${aMonth}-01`).getTime()
            const bDate = new Date(`${bYear}-${bMonth}-01`).getTime()
            console.log(`🔄 Comparing: ${aYear}-${aMonth}-01 (${aDate}) vs ${bYear}-${bMonth}-01 (${bDate})`)

            return aDate - bDate
          })

        console.log(`✅ Final transformed data (${transformedData.length} items):`, transformedData)
        setChartData(transformedData)
        setLoading(false)
        console.log(`⏳ Setting loading state to false`)
      } catch (err) {
        console.error(`❌ Error fetching churn rate data:`, err)
        setError(`Failed to load churn rate data: ${err.message}`)
        setLoading(false)
        console.log(`⏳ Setting loading state to false due to error`)
      }
    }

    // Call the function immediately
    fetchChurnRateData()
  }, [companyName, apiPath]) // Re-run when companyName or apiPath changes

  // Calculate Average Churn Rate
  const averageChurnRate = chartData.length
    ? (chartData.reduce((sum, item) => sum + item.churnRate, 0) / chartData.length).toFixed(2)
    : 0

  console.log(`📊 Average churn rate calculated: ${averageChurnRate}%`)

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
        <p className="text-white font-[balboa] mb-1">📅 {label}</p>
        <p className="text-white text-sm font-medium flex items-center">
          <span className="text-[#e9e9e9]">📈 Churn Rate:</span> {churnRate}%&nbsp;
          {formatPercent(churnChange)}
        </p>
        <p className="text-white text-xs">
          <span className="text-[#e9e9e9]">👥 Active Users:</span> {activeUsers}
        </p>
        <p className="text-white text-xs">
          <span className="text-[#e9e9e9]">👥 Active Users (Last 6M):</span> {activeUsersLast6Months}
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
        <Loader2 className="h-12 w-12 animate-spin text-[#edb900] mb-4" />
        <p className="text-xl mb-2">⏳ Loading churn rate data...</p>
        <p className="text-sm text-[#999999]">Fetching data for {companyName}</p>

        <div className="mt-8 text-sm text-[#999999] max-w-md">
          <p className="flex items-center">
            <Database className="w-4 h-4 mr-2" /> API Path: {apiPath}
          </p>
          <p className="flex items-center">
            <LineChart className="w-4 h-4 mr-2" /> Data Type: churnRate
          </p>
          {apiDetails.requestUrl && (
            <p className="flex items-center mt-2">
              <AlertCircle className="w-4 h-4 mr-2" /> Request URL:
              <code className="ml-1 text-xs bg-[#1a1a1a] px-1 py-0.5 rounded">{apiDetails.requestUrl}</code>
            </p>
          )}
          {apiDetails.responseStatus && (
            <p className="flex items-center">
              {apiDetails.responseStatus >= 200 && apiDetails.responseStatus < 300 ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Bug className="w-4 h-4 mr-2 text-red-500" />
              )}
              Response Status: {apiDetails.responseStatus}
            </p>
          )}
          {apiDetails.responseTime && (
            <p className="flex items-center">
              <Waves className="w-4 h-4 mr-2" /> Response Time: {apiDetails.responseTime}ms
            </p>
          )}
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
        <UserX className="h-16 w-16 text-red-500 mb-4" />
        <p className="text-2xl text-red-400 mb-2">❌ Error</p>
        <p className="text-red-400 mb-6">{error}</p>

        <div className="bg-[#1a1a1a] p-4 rounded border border-[#666666] max-w-md w-full">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Bug className="w-5 h-5 mr-2" /> Debug Information
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="font-semibold mr-2">🏢 Company:</span> {companyName}
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">🔗 API Path:</span> {apiPath}
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">📨 Request URL:</span>
              <code className="text-xs bg-[#0f0f0f] px-1 py-0.5 rounded">{apiDetails.requestUrl}</code>
            </li>
            {apiDetails.responseStatus && (
              <li className="flex items-start">
                <span className="font-semibold mr-2">🔄 Response Status:</span> {apiDetails.responseStatus}
              </li>
            )}
            {apiDetails.responseTime && (
              <li className="flex items-start">
                <span className="font-semibold mr-2">⏱️ Response Time:</span> {apiDetails.responseTime}ms
              </li>
            )}
          </ul>
        </div>

        <div className="mt-6 text-center max-w-md">
          <p className="text-[#999999] text-sm">💡 Check the console (F12) for more detailed error logs</p>
          <p className="text-[#999999] text-sm mt-2">🔍 Make sure your API path and company name are correct</p>
        </div>
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
        <UserX className="h-12 w-12 text-[#edb900] mb-4" />
        <p className="text-xl mb-2">📊 No Data Available</p>
        <p className="text-[#999999] mb-6">No churn rate data available for {companyName}</p>

        <div className="bg-[#1a1a1a] p-4 rounded border border-[#666666] max-w-md w-full">
          <h3 className="text-lg font-semibold mb-2">🔍 Troubleshooting Tips</h3>
          <ul className="space-y-2 text-sm list-disc pl-5">
            <li>Verify that the company name is spelled correctly</li>
            <li>Check if data exists for this company in your database</li>
            <li>Try a different time period if available</li>
            <li>Check server logs for backend errors</li>
          </ul>
        </div>
      </div>
    )
  }

  // Get the latest month from the data
  const latestMonth = chartData.length ? chartData[chartData.length - 1].month : "??/??"
  const oldestMonth = chartData.length ? chartData[0].month : "??/??"
  console.log(`📅 Date range: ${oldestMonth} to ${latestMonth}`)

  return (
    <div className="bg-[#0f0f0f] text-white pb-6 rounded-lg mb-[50px] border-[1px] border-[#666666] mt-[50px]">
      <div className="flex justify-between items-center mb-6 border-b-[1px] border-[#666666] p-6">
        <div>
          <div className="flex items-center">
            <UserX className="h-6 w-6 mr-2 text-[#edb900]" />
            <h2 className="text-2xl font-[balboa]">📊 {companyName} Churn Rate</h2>
          </div>
          <div>
            <p className="text-[#666666] flex items-center mt-1">
              <LineChart className="h-4 w-4 mr-1" />
              Historical paid traders churn rate for {companyName}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[#edb900] text-sm">✅ {chartData.length} data points</p>
          <p className="text-[#666666] text-xs">🔄 API: {apiPath}</p>
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

      <div className="mt-6 px-6 text-white flex justify-between items-start">
        <div>
          <p className="flex items-center mb-2">
            <span className="text-[#999999] mr-2">📅 Period:</span>
            <span className="font-semibold">
              {oldestMonth} → {latestMonth}
            </span>
          </p>
          <p className="flex items-center">
            <span className="text-[#999999] mr-2">📈 Average:</span>
            <span className="font-semibold text-[#edb900]">{averageChurnRate}%</span>
          </p>
        </div>
        <div className="bg-[#1a1a1a] p-3 rounded border border-[#333333] text-xs">
          <p className="flex items-center">
            <span className="text-[#999999] mr-2">👥 Data points:</span>
            <span>{chartData.length}</span>
          </p>
          <p className="flex items-center">
            <span className="text-[#999999] mr-2">🔄 Last updated:</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChurnRateChart

