"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { DollarSign, BarChart2 } from "lucide-react";

export default function CompanyTransactionCharts({ companyStats }) {
  const [activeIndexPaid, setActiveIndexPaid] = useState(null);
  const [activeIndexTransactions, setActiveIndexTransactions] = useState(null);
  const [activeChart, setActiveChart] = useState(null); // 🔥 Track which chart is active

  // ✅ Extract and format backend data properly
  const formattedData = companyStats.map((company) => {
    const companyName = company.company?.trim() || "Unknown";
    const totalPaid = company.totalamountpaid ? parseFloat(company.totalamountpaid) / 1_000_000 : 0;
    const totalTransactions = company.totaltransactions ? parseInt(company.totaltransactions) : 0;

    return {
      name: companyName,
      totalPaid: isNaN(totalPaid) ? 0 : totalPaid,
      totalTransactions: isNaN(totalTransactions) ? 0 : totalTransactions,
    };
  });

  // ✅ Filter out "Unknown" if it has no transactions
  const filteredData = formattedData.filter((company) => company.name !== "Unknown" || company.totalTransactions > 0);

  // ✅ Calculate Totals
  const totalPaid = filteredData.reduce((sum, company) => sum + company.totalPaid, 0).toFixed(1);
  const totalTransactions = filteredData.reduce((sum, company) => sum + company.totalTransactions, 0);

  // Function to generate gold gradient + red for "out of operations"
  const generateColorShades = (data) => {
    const baseColor = [237, 185, 0]; // RGB for #EDB900 (Gold)
    const darkFactor = 0.08; // How much each step darkens the color
    const colors = [];

    let goldIndex = 0; // Track how many gold shades we’ve used

    data.forEach((company, index) => {
      if (company.name === "No Longer Operational") {
        colors[index] = "#300A00"; // 🔴 Explicit red for out-of-operations companies
      } else {
        const factor = 1 - goldIndex * darkFactor;
        colors[index] = `rgb(${Math.max(0, Math.round(baseColor[0] * factor))}, ${Math.max(0, Math.round(baseColor[1] * factor))}, ${Math.max(0, Math.round(baseColor[2] * factor))})`;
        goldIndex++; // Only increment for operational companies
      }
    });

    return colors;
  };

  // Apply dynamically generated colors
  const COLORS = generateColorShades(filteredData);

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

    return (
      <g>
        {/* 🔥 Active Sector with White Stroke */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6} // Slightly expand for hover effect
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="white"
          strokeWidth={2}
        />

        {/* 📌 Company Name */}
        <text x={cx} y={cy - 30} dy={8} textAnchor="middle" fill="white" className="text-2xl font-[balboa]">
          {payload.name}
        </text>

        {/* 🔥 Detect which chart is active */}
        <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="white" className="text-4xl font-[balboa]">
          {activeChart === "paid" ? `$${value.toFixed(1)}M` : value.toLocaleString()}
        </text>

        {/* 📌 Percentage Label */}
        <text x={cx} y={cy + 30} dy={8} textAnchor="middle" fill="white" className="text-lg opacity-70 font-[balboa]">
          {(percent * 100).toFixed(1)}%
        </text>
      </g>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 🔶 Paid Amount Breakdown */}
      <Card className="bg-[#0f0f0f] shadow-lg border border-[#666666]">
        <CardHeader className="pb-5 mb-5 border-b-[1px] border-[#666666]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-[balboa] flex items-center gap-2 text-white">
                <DollarSign className="h-5 w-5 text-[#edb900]" />
                Paid Amount Breakdown
              </CardTitle>
              <CardDescription className="text-gray-400">Distribution by companies</CardDescription>
            </div>
            <Badge className="text-2xl text-[#edb900] font-[balboa] border-[#666666]">
              ${totalPaid}M
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndexPaid}
                  activeShape={(props) => renderActiveShape({ ...props, isPaidChart: true })}
                  data={filteredData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={180}
                  stroke="#0f0f0f"
                  strokeWidth={1}
                  paddingAngle={1}
                  dataKey="totalPaid"
                  onMouseEnter={(_, index) => {
                    setActiveIndexPaid(index);
                    setActiveChart("paid");
                  }}
                  onMouseLeave={() => {
                    setActiveIndexPaid(null);
                    setActiveChart(null);
                  }}
                >
                  {filteredData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 🔷 Transactions Breakdown */}
      <Card className="bg-[#0f0f0f] shadow-lg border border-[#666666]">
        <CardHeader className="pb-5 mb-5 border-b-[1px] border-[#666666]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-[balboa] flex items-center gap-2 text-white">
                <BarChart2 className="h-5 w-5 text-[#edb900]" />
                Transactions Breakdown
              </CardTitle>
              <CardDescription className="text-gray-400">Distribution by companies</CardDescription>
            </div>
            <Badge className="text-2xl text-[#edb900] font-[balboa] border-[#666666]">
              {totalTransactions.toLocaleString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndexTransactions}
                  activeShape={(props) => renderActiveShape({ ...props, isPaidChart: false })}
                  data={filteredData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={180}
                  stroke="#0f0f0f"
                  strokeWidth={1}
                  paddingAngle={1}
                  dataKey="totalTransactions"
                  onMouseEnter={(_, index) => {
                    setActiveIndexTransactions(index);
                    setActiveChart("transactions");
                  }}
                  onMouseLeave={() => {
                    setActiveIndexTransactions(null);
                    setActiveChart(null);
                  }}
                >
                  {filteredData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
