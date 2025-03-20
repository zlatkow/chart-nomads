/* eslint-disable */

"use client";

import { useState, useEffect } from "react";
import { 
  Line, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area
} from "recharts";
import { UserX } from 'lucide-react';

// ✅ Function to format month-year as MM/YYYY
const formatMonthYear = (monthYear) => {
  if (!monthYear) return "??/????";

  const parts = monthYear.trim().split(/\s+/);
  if (parts.length !== 2) return "??/????"; 

  const [monthName, year] = parts;
  const monthMap = {
    "January": "01", "February": "02", "March": "03", "April": "04",
    "May": "05", "June": "06", "July": "07", "August": "08",
    "September": "09", "October": "10", "November": "11", "December": "12"
  };

  return `${monthMap[monthName] || "??"}/${year}`;
};

const ChurnRateChart = ({ companyStats }) => {
  const [chartData, setChartData] = useState([]);

  if (!companyStats || !Array.isArray(companyStats) || companyStats.length === 0) {
    return <p>❌ No data available</p>;
  }

  // ✅ Process Data - Sort chronologically
  useEffect(() => {
    const transformedData = companyStats
      .map((entry) => ({
        month: formatMonthYear(entry.month_year),
        churnRate: parseFloat(entry.churn_rate) || 0,
        churnRateChange: parseFloat(entry.churn_rate_change) || null, // Already calculated from backend
        activeUsers: entry.total_users_last_year,
        activeUsersLast6Months: entry.active_users_last_6_months
      }))
      .sort((a, b) => {
        // ✅ Sorting oldest to newest
        return new Date(a.month.split("/").reverse().join("/")) - new Date(b.month.split("/").reverse().join("/"));
      });

    setChartData(transformedData);
  }, [companyStats]);

  // ✅ Calculate Average Churn Rate
  const averageChurnRate = chartData.length 
    ? (chartData.reduce((sum, item) => sum + item.churnRate, 0) / chartData.length).toFixed(2)
    : 0;

  // ✅ Tooltip Logic
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const churnRate = data.churnRate.toFixed(2);
    const churnChange = data.churnRateChange;
    const activeUsers = data.activeUsers;
    const activeUsersLast6Months = data.activeUsersLast6Months;

    const formatPercent = (value) => {
      if (value === null || isNaN(value)) return "—";
      return (
        <span className={`${value < 0 ? "text-green-400" : "text-red-400"}`}>
          {value < 0 ? "▼" : "▼"} {Math.abs(value).toFixed(2)}%
        </span>
      );
    };

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
    );
  };

  return (
    <div className="bg-[#0f0f0f] text-white pb-6 rounded-lg mb-[50px] border-[1px] border-[#666666] mt-[50px]">
      <div className="flex justify-between items-center mb-6 border-b-[1px] border-[#666666] p-6">
        <div>
            <div className="flex">
              <UserX className="h-5 w-5 mr-2 mt-1 text-[#edb900]" />
              <h2 className="text-2xl font-[balboa]">Industry Churn Rate</h2>
            </div>
            <div>
              <p className="text-[#666666]">Historical paid traders churn rate in the industry</p>
            </div>
          </div>
      </div>

      <ResponsiveContainer width="100%" height={500}>
  <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
    
    {/* ✅ Gradient Definition for Churn Rate */}
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

    {/* ✅ Churn Rate Area with Gradient */}
    <Area 
      dataKey="churnRate" 
      stroke="none" 
      fill="url(#churnRateGradient)" 
    />

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
        fontFamily: "Balboa" 
      }} 
    />

    <Tooltip content={<CustomTooltip />} />

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
        <p>Showing data from {chartData.length ? chartData[0].month : "??/??"} to 09/2024</p>
        <p>Average monthly churn rate: {averageChurnRate}%</p>
      </div>
    </div>
  );
};

export default ChurnRateChart;
