/* eslint-disable */

"use client";

import { useState, useEffect } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Users } from "lucide-react";

export default function PayoutStatsChart({ payoutStats = [] }) {
    const [activeIndexAmount, setActiveIndexAmount] = useState(null);
    const [activeIndexCount, setActiveIndexCount] = useState(null);

    // ✅ Ensure payoutStats is always an array
    if (!Array.isArray(payoutStats)) {
        payoutStats = [];
    }

    // ✅ Extract unique paid traders safely
    const uniquePaidTraders = payoutStats.length > 0 ? payoutStats[0]?.total_unique_traders ?? 0 : 0;

    // ✅ Separate Data into Categories
    const payoutAmountData = payoutStats.filter((item) => item?.category_type?.trim() === "Paid Amount");
    const payoutCountData = payoutStats.filter((item) => item?.category_type?.trim() === "Payout Count");

    // ✅ Generate Color Shades Separately for Each Chart
    const generateColorShades = (data) => {
        if (!Array.isArray(data) || data.length === 0) return [];
        const baseColor = [237, 185, 0]; // RGB for Gold
        const darkFactor = 0.25;
        return data.map((_, index) => {
            const factor = 1 - index * darkFactor;
            return `rgb(${Math.round(baseColor[0] * factor)}, ${Math.round(baseColor[1] * factor)}, ${Math.round(baseColor[2] * factor)})`;
        });
    };

    // ✅ Generate Separate Colors for Each Dataset
    const COLORS_AMOUNT = generateColorShades(payoutAmountData);
    const COLORS_COUNT = generateColorShades(payoutCountData);

    // ✅ Format Data for Charts
    const formattedAmountData = payoutAmountData.map((item, index) => ({
        name: item.category || "Unknown",
        count: item.count ?? 0, // 🔥 Ensure count exists
        percentage: item.percentage ?? 0,
        color: COLORS_AMOUNT[index],
    })).filter(item => item.count > 0); // 🔥 Ensure we only keep items with valid count

    const formattedCountData = payoutCountData.map((item, index) => ({
        name: item.category || "Unknown",
        count: item.count ?? 0,
        percentage: item.percentage ?? 0,
        color: COLORS_COUNT[index],
    })).filter(item => item.count > 0); // 🔥 Ensure we only keep items with valid count

    // ✅ Active Sector Styling
    const renderActiveShape = (props) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 6}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    stroke="white"
                    strokeWidth={2}
                />
                <text x={cx} y={cy - 30} dy={8} textAnchor="middle" fill="white" className="text-lg">
                    {payload.name}
                </text>
                <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="white" className="text-3xl">
                    {value.toLocaleString()}
                </text>
                <text x={cx} y={cy + 30} dy={8} textAnchor="middle" fill="white" className="text-md opacity-70">
                    {(percent * 100).toFixed(1)}%
                </text>
            </g>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-8">
            {/* 🔶 High Earning Unique Traders (Amount) */}
            <Card className="bg-[#0f0f0f] font-[balboa] shadow-lg border border-[#666666]">
                <CardHeader className="pb-5 mb-5 border-b-[1px] border-[#666666]">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-[balboa] flex items-center gap-2 text-white">
                                <Users className="h-5 w-5 text-[#edb900]" />
                                Unique Traders
                            </CardTitle>
                            <CardDescription className="text-gray-400">Based on total received amount</CardDescription>
                        </div>
                        <Badge className="text-2xl text-[#edb900] font-[balboa] border-[#666666]">
                            {uniquePaidTraders.toLocaleString()}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    activeIndex={activeIndexAmount}
                                    activeShape={renderActiveShape}
                                    data={formattedAmountData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={100}
                                    outerRadius={180}
                                    stroke="#0f0f0f"
                                    strokeWidth={1}
                                    paddingAngle={1}
                                    dataKey="count"
                                    onMouseEnter={(_, index) => setActiveIndexAmount(index)}
                                    onMouseLeave={() => setActiveIndexAmount(null)}
                                >
                                    {formattedAmountData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* 🔷 High Earning Unique Traders (Count) */}
            <Card className="bg-[#0f0f0f] shadow-lg font-[balboa] border border-[#666666]">
                <CardHeader className="pb-5 mb-5 border-b-[1px] border-[#666666]">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-[balboa] flex items-center gap-2 text-white">
                                <Users className="h-5 w-5 text-[#edb900]" />
                                Unique Traders
                            </CardTitle>
                            <CardDescription className="text-gray-400">Based on total payouts count</CardDescription>
                        </div>
                        <Badge className="text-2xl text-[#edb900] font-[balboa] border-[#666666]">
                            {uniquePaidTraders.toLocaleString()}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    activeIndex={activeIndexCount}
                                    activeShape={renderActiveShape}
                                    data={formattedCountData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={100}
                                    outerRadius={180}
                                    stroke="#0f0f0f"
                                    strokeWidth={1}
                                    paddingAngle={1}
                                    dataKey="count"
                                    onMouseEnter={(_, index) => setActiveIndexCount(index)}
                                    onMouseLeave={() => setActiveIndexCount(null)}
                                >
                                    {formattedCountData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
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
