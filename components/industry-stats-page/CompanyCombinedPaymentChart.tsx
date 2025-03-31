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
import { DollarSign } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CompanyCombinedPaymentChartProps {
  companyName: string
}

const CompanyCombinedPaymentChart = ({ companyName }: CompanyCombinedPaymentChartProps) => {
  const [chartData, setChartData] = useState([])
  const [timeRange, setTimeRange] = useState("All Time")
  const [filteredStats, setFilteredStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [monthlyStats, setMonthlyStats] = useState([])

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Fetching data for company: ${companyName}`)
        const response = await fetch(`/api/getCompanyAllStats?company=${encodeURIComponent(companyName)}&dataType=monthly`)
        const data = await response.json()
        console.log("API response:", data)
        setMonthlyStats(data.monthly || [])
        setFilteredStats(data.monthly || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (companyName) {
      fetchData()
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

    let cumulative = 0
    let previousMonthlyAmount = null
    let previousCumulativeAmount = null

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

      // Updated to use totalAmount instead of totalamount
      const monthlyAmount = Number.parseFloat(entry.totalAmount) / 1_000_000 || 0
      cumulative += monthlyAmount

      let monthlyPercentChange = null
      let cumulativePercentChange = null

      if (previousMonthlyAmount !== null) {
        monthlyPercentChange = ((monthlyAmount - previousMonthlyAmount) / previousMonthlyAmount) * 100
      }

      if (previousCumulativeAmount !== null) {
        cumulativePercentChange = ((cumulative - previousCumulativeAmount) / previousCumulativeAmount) * 100
      }

      previousMonthlyAmount = monthlyAmount
      previousCumulativeAmount = cumulative

      return {
        month,
        monthlyAmount,
        cumulativeAmount: cumulative,
        monthlyPercentChange,
        cumulativePercentChange,
      }
    })

    setChartData(transformedData)
  }, [filteredStats])

  // Calculate average monthly payment
  const averageMonthlyPayment = chartData.length
    ? (chartData.reduce((sum, item) => sum + item.monthlyAmount, 0) / chartData.length).toFixed(2)
    : 0

  // Get total cumulative amount (last item in the array)
  const totalCumulativeAmount = chartData.length ? chartData[chartData.length - 1].cumulativeAmount.toFixed(2) : 0

  // Format date range for display
  const dateRangeText = chartData.length
    ? `Showing data from ${chartData[0].month} to ${chartData[chartData.length - 1].month}`
    : ""

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0].payload
    const monthlyAmount = data.monthlyAmount
    const cumulativeAmount = data.cumulativeAmount
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
        {/* Date */}
        <p className="text-white font-[balboa] mb-1">{label}</p>

        {/* Cumulative Amount */}
        <p className="text-white text-sm font-medium">
          <span className="text-[#e9e9e9]">Cumulative:</span> ${cumulativeAmount.toFixed(2)}M
        </p>

        {/* Monthly Amount with % Change on the Same Row */}
        <p className="text-white text-sm font-medium flex items-center">
          <span className="text-[#e9e9e9]">Monthly:</span> ${monthlyAmount.toFixed(2)}M&nbsp;
          {formatPercent(monthlyChange)}
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-[#0f0f0f] text-white rounded-lg border-[1px] border-[#666666] mb-[50px] p-6 flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#edb900]"></div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-[#0f0f0f] text-white rounded-lg border-[1px] border-[#666666] mb-[50px] p-6 flex justify-center items-center h-[400px]">
        <div className="text-center">
          <DollarSign className="h-10 w-10 mx-auto mb-4 text-[#edb900]" />
          <p className="text-xl font-[balboa]">No payment data available for {companyName}</p>
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
            <DollarSign className="h-5 w-5 mr-2 mt-1 text-[#edb900]" />
            <h2 className="text-2xl font-[balboa]">{companyName} - Monthly & Cumulative Paid Amount (in millions $)</h2>
          </div>
          <div>
            <p className="text-[#666666]">Monthly & cumulative amounts paid by {companyName}</p>
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
            <linearGradient id="cumulativeAmountGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a3e00" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#5a3e00" stopOpacity={0} />
            </linearGradient>
          </defs>

          <ReferenceLine
            yAxisId="left"
            y={averageMonthlyPayment}
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
            tickFormatter={(value) => `$${value}M`}
            tick={{ fontFamily: "Balboa", fill: "#666666", fontSize: 14 }}
            domain={[0, "auto"]}
            stroke="#444"
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => `$${value}M`}
            tick={{ fontFamily: "Balboa", fill: "#666666", fontSize: 14 }}
            domain={[0, "auto"]}
            stroke="#444"
          />

          <Tooltip content={CustomTooltip} cursor={{ fill: "rgba(255, 191, 0, 0.2)" }} />

          {/* Cumulative Amount Area with Gradient */}
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="cumulativeAmount"
            stroke="#ffb700"
            fill="url(#cumulativeAmountGradient)"
          />

          {/* Monthly Amount Bars */}
          <Bar
            yAxisId="left"
            dataKey="monthlyAmount"
            fill="#ffb700"
            radius={[10, 10, 0, 0]}
            activeBar={{ fill: "#c99400" }} // Darker yellow on hover
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 text-white text-xs px-6">
        <p>{dateRangeText}</p>
        <p className="mt-1">
          Average monthly payment: ${averageMonthlyPayment}M | Total cumulative amount: ${totalCumulativeAmount}M
        </p>
      </div>
    </div>
  )
}

export default CompanyCombinedPaymentChart

