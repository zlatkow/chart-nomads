"use client";

import { useState, useEffect } from "react";
import { Area, Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { UserPlus} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const MonthlyUniqueTradersChart = ({ uniqueTradersStats }) => {
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState("All Time");
  const [filteredStats, setFilteredStats] = useState(uniqueTradersStats || []);

  // ✅ Function to format month as "MM/YYYY"
  const formatMonth = (monthName, year) => {
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
    };
    return `${monthMap[monthName?.trim()] || "??"}/${year}`;
  };

  // ✅ Filtering logic for time range selection
  useEffect(() => {
    if (!uniqueTradersStats) return;

    let now = new Date();
    let monthsToShow = 12; // Default to last 12 months

    if (timeRange === "All Time") {
      setFilteredStats(uniqueTradersStats);
      return;
    } else if (timeRange === "Last 6 Months") {
      monthsToShow = 6;
    }

    let cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - monthsToShow);

    const filteredData = uniqueTradersStats.filter((entry) => {
      let entryDate = new Date(entry.year, new Date(entry.month + " 1, 2000").getMonth());
      return entryDate >= cutoffDate;
    });

    setFilteredStats(filteredData);
  }, [timeRange, uniqueTradersStats]);

  // ✅ Data transformation: Calculate cumulative values and format months
  useEffect(() => {
    if (!filteredStats) return;

    let cumulativeSum = 0;
    let previousNewTraders = null;

    const transformedData = filteredStats.map((item) => {
      const month = formatMonth(item.month, item.year);
      const newUniqueTraders = parseInt(item.newuniquetraders) || 0;
      cumulativeSum += newUniqueTraders;

      // Calculate percentage change
      let monthlyPercentChange = null;
      if (previousNewTraders !== null) {
        monthlyPercentChange = ((newUniqueTraders - previousNewTraders) / previousNewTraders) * 100;
      }
      previousNewTraders = newUniqueTraders;

      return {
        month,
        newUniqueTraders,
        cumulativeUniqueTraders: cumulativeSum,
        monthlyPercentChange,
      };
    });

    setChartData(transformedData);
  }, [filteredStats]);

  // ✅ Calculate averages
  const averageNewTraders = chartData.length
    ? (chartData.reduce((sum, item) => sum + item.newUniqueTraders, 0) / chartData.length).toFixed(2)
    : 0;

  const totalCumulativeTraders = chartData.length
    ? chartData[chartData.length - 1].cumulativeUniqueTraders.toLocaleString()
    : 0;


  if (!chartData.length) return <p>No data available.</p>;

  // ✅ Custom Tooltip with percentage changes
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const newUniqueTraders = data.newUniqueTraders.toLocaleString();
    const cumulativeUniqueTraders = data.cumulativeUniqueTraders.toLocaleString();
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
        <p className="text-white text-sm font-medium">
          <span className="text-[#e9e9e9]">Cumulative:</span> {cumulativeUniqueTraders}
        </p>
        <p className="text-white text-sm font-medium flex items-center">
          <span className="text-[#e9e9e9]">Monthly:</span> {newUniqueTraders}&nbsp;
          {formatPercent(monthlyChange)}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-[#0f0f0f] text-white pb-6 rounded-lg mb-[50px] border-[1px] border-[#666666]">
      <div className="flex justify-between items-center mb-6 border-b-[1px] border-[#666666] p-6">
        <div>
            <div className="flex">
              <UserPlus className="h-5 w-5 mr-2 mt-1 text-[#edb900]" />
              <h2 className="text-2xl font-[balboa]">Monthly & Cumulative New Unique Traders</h2>
            </div>
            <div>
              <p className="text-[#666666]">Historical monthly & cumulative new unique paid traders</p>
            </div>
          </div>
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

        <ResponsiveContainer width="100%" height={500}>
  <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
    
    {/* ✅ Gradient Definition for Cumulative Unique Traders */}
    <defs>
      <linearGradient id="cumulativeUniqueTradersGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5a3e00" stopOpacity={0.3} />
        <stop offset="100%" stopColor="#5a3e00" stopOpacity={0} />
      </linearGradient>
    </defs>

    <ReferenceLine
      yAxisId="left"
      y={averageNewTraders}
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
      tickFormatter={(value) => value.toLocaleString()} 
    />

    <YAxis 
      yAxisId="right" 
      orientation="right" 
      tick={{ fontFamily: "Balboa", fill: "#666666", fontSize: 14 }} 
      tickFormatter={(value) => value.toLocaleString()} 
    />

    <Tooltip content={<CustomTooltip />} />

    {/* ✅ Cumulative Unique Traders Area with Gradient */}
    <Area 
      yAxisId="right" 
      dataKey="cumulativeUniqueTraders" 
      stroke="#ffb700" 
      fill="url(#cumulativeUniqueTradersGradient)" 
    />

    <Bar 
      yAxisId="left" 
      dataKey="newUniqueTraders" 
      fill="#ffb700" 
      radius={[10, 10, 0, 0]} 
      activeBar={{ fill: "#c99400" }} 
    />

  </ComposedChart>
</ResponsiveContainer>

      <div className="mt-4 px-6 text-white text-xs">
  <p>Showing data from <span>{chartData.length ? chartData[0].month : "N/A"}</span> to <span>{chartData.length ? chartData[chartData.length - 1].month : "N/A"}</span></p>
  <p className="mt-1">
    <span>Average monthly new users: <span>{(Number(averageNewTraders)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
    &nbsp; | &nbsp;
    <span>Total cumulative new users: <span>{totalCumulativeTraders}</span></span>
  </p>
</div>

    </div>
  );
};

export default MonthlyUniqueTradersChart;
