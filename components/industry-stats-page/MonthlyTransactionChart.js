"use client";

import { useState, useEffect } from "react";
import { Area, Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { BarChart2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const MonthlyTransactionChart = ({ monthlyStats }) => {
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState("All Time");
  const [filteredStats, setFilteredStats] = useState(monthlyStats || []);

  // Function to format month correctly
  const formatMonth = (monthName, year) => {
    const monthMap = {
      "January": "01", "February": "02", "March": "03", "April": "04",
      "May": "05", "June": "06", "July": "07", "August": "08",
      "September": "09", "October": "10", "November": "11", "December": "12"
    };

    // Ensure `monthName` is valid and trimmed
  const formattedMonth = monthMap[monthName?.trim()] || "??"; // Prevents `undefined`

    return `${formattedMonth}/${year}`;
  };

  // Filter data based on time range selection
  useEffect(() => {
    if (!monthlyStats) return;

    let now = new Date();
    let monthsToShow = 12; // Default to last 12 months

    if (timeRange === "All Time") {
      setFilteredStats(monthlyStats);
      return;
    } else if (timeRange === "Last 6 Months") {
      monthsToShow = 6;
    }

    // Calculate cutoff date
    let cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - monthsToShow);

    const filteredData = monthlyStats.filter((entry) => {
      let entryDate = new Date(entry.year, new Date(entry.month + " 1, 2000").getMonth());
      return entryDate >= cutoffDate;
    });

    setFilteredStats(filteredData);
  }, [timeRange, monthlyStats]);

  // Transform the filtered data into chart format
  useEffect(() => {
    if (!filteredStats) return;

    let cumulativeTransactions = 0;
    let previousMonthlyTransactions = null;

    const transformedData = filteredStats.map((entry) => {
      const month = formatMonth(entry.month, entry.year);
      const monthlyTransactions = parseInt(entry.totaltransactions);
      cumulativeTransactions += monthlyTransactions;

      // Calculate percentage change
      let monthlyPercentChange = null;
      if (previousMonthlyTransactions !== null) {
        monthlyPercentChange = ((monthlyTransactions - previousMonthlyTransactions) / previousMonthlyTransactions) * 100;
      }
      previousMonthlyTransactions = monthlyTransactions;

      return {
        month,
        monthlyTransactions,
        cumulativeTransactions,
        monthlyPercentChange
      };
    });

    setChartData(transformedData);
  }, [filteredStats]);

  // Calculate average monthly transactions
  const averageMonthlyTransactions = chartData.length 
    ? (chartData.reduce((sum, item) => sum + item.monthlyTransactions, 0) / chartData.length).toFixed(2)
    : 0;

  // Get total cumulative transactions
  const totalCumulativeTransactions = chartData.length 
    ? chartData[chartData.length - 1].cumulativeTransactions.toLocaleString()
    : 0;

  // Format date range for display
  const dateRangeText = chartData.length
    ? `Showing data from ${chartData[0].month} to ${chartData[chartData.length - 1].month}`
    : "";

  if (!chartData.length) return <p>No data available.</p>;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;
    
    const data = payload[0].payload;
    const monthlyTransactions = data.monthlyTransactions.toLocaleString();
    const cumulativeTransactions = data.cumulativeTransactions.toLocaleString();
    const monthlyChange = data.monthlyPercentChange;

    // Format Percentage Change with Arrows
    const formatPercent = (value) => {
      if (value === null || isNaN(value)) return "";
      return (
        <span className={`${value >= 0 ? "text-green-400" : "text-red-400"}`}>
          {value >= 0 ? "▲" : "▼"} {Math.abs(value).toFixed(2)}%
        </span>
      );
    };

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
    );
  };

  return (
    <div className="bg-[#0f0f0f] text-white pb-6 rounded-lg mb-[50px] border-[1px] border-[#666666]">
      <div className="flex justify-between items-center mb-6 border-b-[1px] border-[#666666] p-6">
        {/* Left Section: Title & Description */}
        <div>
          <div className="flex">
            <BarChart2 className="h-5 w-5 mr-2 mt-1 text-[#edb900]" />
            <h2 className="text-2xl font-[balboa]">Monthly & Cumulative Transactions</h2>
          </div>
          <p className="text-[#666666]">Historical and cumulative payout transactions in the industry</p>
        </div>
  
        {/* Right Section: Filter Dropdown */}
        <Select
          value={timeRange}
          onValueChange={(value) => {
            setTimeRange(value);
          }}
        >
          <SelectTrigger className="w-[170px] bg-[#1A1A1A] border-[#333333] text-gray-300 px-4 py-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-[#333333] text-white shadow-lg">
            <SelectItem value="All Time">All Time</SelectItem>
            <SelectItem value="Last 12 Months">Last 12 Months</SelectItem>
            <SelectItem value="Last 6 Months">Last 6 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={500}>
  <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
    
    {/* ✅ Gradient Definition for Cumulative Transactions */}
    <defs>
      <linearGradient id="cumulativeTransactionsGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5a3e00" stopOpacity={0.3} />
        <stop offset="100%" stopColor="#5a3e00" stopOpacity={0} />
      </linearGradient>
    </defs>

    {/* Reference Line for AVG Transactions */}
    {averageMonthlyTransactions && (
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
    )}

    {/* Grid & Axes */}
    <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
    <XAxis 
      dataKey="month" 
      angle={-45} 
      textAnchor="end" 
      tick={{ fontFamily: "Balboa", fill: "#666666", fontSize: 14 }} 
      tickMargin={10} 
    />
    <YAxis 
      yAxisId="left" 
      tick={{ fontFamily: "Balboa", fill: "#666666", fontSize: 14 }} 
      tickFormatter={(value) => Number(value).toLocaleString()}
    />
    <YAxis 
      yAxisId="right" 
      orientation="right" 
      tick={{ fontFamily: "Balboa", fill: "#666666", fontSize: 14 }} 
      tickFormatter={(value) => Number(value).toLocaleString()}
    />

    {/* Tooltip */}
    <Tooltip content={<CustomTooltip />} />

    {/* ✅ Cumulative Transactions Area with Gradient */}
    <Area 
      yAxisId="right" 
      dataKey="cumulativeTransactions" 
      stroke="#ffb700" 
      fill="url(#cumulativeTransactionsGradient)" 
    />

    {/* Monthly Transactions (Bar) */}
    <Bar 
      yAxisId="left" 
      dataKey="monthlyTransactions" 
      fill="#ffb700" 
      radius={[10, 10, 0, 0]} 
      activeBar={{ fill: "#c99400" }} 
    />

  </ComposedChart>
</ResponsiveContainer>

      <div className="mt-4 px-6 text-white text-xs">
        <p>{dateRangeText}</p>
        <p>
          Average monthly transactions: {(Number(averageMonthlyTransactions)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | 
          Total cumulative transactions: {totalCumulativeTransactions.toLocaleString()}
        </p>

      </div>
    </div>
  );
};

export default MonthlyTransactionChart;
