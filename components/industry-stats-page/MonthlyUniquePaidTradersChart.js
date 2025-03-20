"use client";

import { useState, useEffect } from "react";
import { 
  Line, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area
} from "recharts";
import { Users } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const formatMonth = (monthName, year) => {
  const monthMap = {
    "january": "01", "february": "02", "march": "03", "april": "04",
    "may": "05", "june": "06", "july": "07", "august": "08",
    "september": "09", "october": "10", "november": "11", "december": "12"
  };

  const formattedMonth = monthMap[monthName?.trim().toLowerCase()] || "??";
  return `${formattedMonth}/${year}`;
};

const MonthlyUniquePaidTradersChart = ({ uniquePaidTradersStats }) => {
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState("All Time");
  const [filteredStats, setFilteredStats] = useState(uniquePaidTradersStats || []);

  // ✅ Filter data based on selected time range
  useEffect(() => {
    if (!uniquePaidTradersStats) return;

    let now = new Date();
    let monthsToShow = 12;

    if (timeRange === "All Time") {
      setFilteredStats(uniquePaidTradersStats);
      return;
    } else if (timeRange === "Last 6 Months") {
      monthsToShow = 6;
    }

    let cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - monthsToShow);

    const filteredData = uniquePaidTradersStats.filter((entry) => {
      let entryDate = new Date(entry.year, new Date(entry.month + " 1, 2000").getMonth());
      return entryDate >= cutoffDate;
    });

    setFilteredStats(filteredData);
  }, [timeRange, uniquePaidTradersStats]);

  // ✅ Transform data for chart
  useEffect(() => {
    if (!filteredStats) return;

    let previousMonthlyPaidTraders = null;

    const transformedData = filteredStats.map((entry) => {
      const month = formatMonth(entry.month, entry.year);
      const uniquePaidTraders = parseInt(entry.uniquereceivers) || 0;

      // ✅ Calculate Monthly Percentage Change
      let monthlyPercentChange = null;
      if (previousMonthlyPaidTraders !== null) {
        monthlyPercentChange = ((uniquePaidTraders - previousMonthlyPaidTraders) / previousMonthlyPaidTraders) * 100;
      }
      previousMonthlyPaidTraders = uniquePaidTraders;

      return {
        month,
        uniquePaidTraders,
        monthlyPercentChange
      };
    });

    setChartData(transformedData);
  }, [filteredStats]);

  // ✅ Calculate Average Monthly Unique Paid Traders
  const averageMonthlyPaidTraders = chartData.length 
    ? (chartData.reduce((sum, item) => sum + item.uniquePaidTraders, 0) / chartData.length).toFixed(2)
    : 0;

  // ✅ Format Date Range for Display
  const dateRangeText = chartData.length
    ? `Showing data from ${chartData[0].month} to ${chartData[chartData.length - 1].month}`
    : "";

  if (!chartData.length) return <p>No data available.</p>;

  // ✅ Custom Tooltip with Percent Change Logic
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;
    
    const data = payload[0].payload;
    const uniquePaidTraders = data.uniquePaidTraders.toLocaleString();
    const monthlyChange = data.monthlyPercentChange;

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
        <p className="text-white text-sm font-medium flex items-center">
          <span className="text-[#e9e9e9]">Monthly:</span> {uniquePaidTraders}&nbsp;
          {formatPercent(monthlyChange)}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-[#0f0f0f] text-white rounded-lg border-[1px] border-[#666666] mb-[50px] pb-6">
      <div className="flex justify-between items-center mb-6 border-b-[1px] border-[#666666] p-6">
        <div>
            <div className="flex">
              <Users className="h-5 w-5 mr-2 mt-1 text-[#edb900]" />
              <h2 className="text-2xl font-[balboa]">Monthly Unique Paid Traders</h2>
            </div>
            <div>
              <p className="text-[#666666]">Historical monthly unique paid traders</p>
            </div>
          </div>
          <div className="relative">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="flex items-center gap-2 w-[170px] bg-[#1A1A1A] px-4 py-1 rounded-md cursor-pointer border border-[#333333] text-gray-300">
              <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border border-[#333333] rounded shadow-lg text-white">
                <SelectItem className="hover:bg-[#666666]" value="All Time">All Time</SelectItem>
                <SelectItem className="hover:bg-[#666666]" value="Last 12 Months">Last 12 Months</SelectItem>
                <SelectItem className="hover:bg-[#666666]" value="Last 6 Months">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={true} horizontal={true} />
          <XAxis dataKey="month" angle={-45} textAnchor="end" tick={{ fontFamily: "Balboa", fill: "#666666", fontSize: 14 }} tickMargin={10} stroke="#444" />
          <YAxis 
            yAxisId="left" 
            tickFormatter={(value) => value.toLocaleString()} // ✅ Shows whole numbers
            tick={{ fontFamily: "Balboa", fill: "#666666", fontSize: 14 }} 
          />
          <defs>
            <linearGradient id="uniquePaidTradersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a3e00" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#5a3e00" stopOpacity={0} />
            </linearGradient>
          </defs>

          <Area 
            yAxisId="left"
            dataKey="uniquePaidTraders" 
            stroke="none" 
            fill="url(#uniquePaidTradersGradient)" 
          />
          <ReferenceLine 
            yAxisId="left" 
            y={averageMonthlyPaidTraders} 
            stroke="#5a3e00"  
            strokeDasharray="5 5" 
            strokeWidth={3}  
            label={{ value: "AVG", position: "right", fill: "#5a3e00", fontSize: 14, fontFamily: "Balboa" }} 
          />
          <Tooltip content={<CustomTooltip />} />
           {/* ✅ Add Area Fill Below the Line Chart */}
            
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
        <p>
          Average monthly unique paid traders: 
          {(Number(averageMonthlyPaidTraders)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

export default MonthlyUniquePaidTradersChart;
