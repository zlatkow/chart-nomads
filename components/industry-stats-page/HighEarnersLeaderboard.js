/* eslint-disable */

"use client"

import { useState, useEffect, useRef } from "react"
import { DollarSign, User } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import tippy from "tippy.js"
import "tippy.js/dist/tippy.css"
import "tippy.js/themes/light.css"

// Create a cache key generator function
const createCacheKey = (type, timeFilter) => `leaderboard_${type}_${timeFilter}`;

// Function to check if data exists in sessionStorage
const getFromCache = (type, timeFilter) => {
  const cacheKey = createCacheKey(type, timeFilter);
  const cachedData = sessionStorage.getItem(cacheKey);
  if (cachedData) {
    try {
      return JSON.parse(cachedData);
    } catch (e) {
      console.error("Error parsing cached data:", e);
    }
  }
  return null;
};

// Function to save data to sessionStorage
const saveToCache = (type, timeFilter, data) => {
  const cacheKey = createCacheKey(type, timeFilter);
  sessionStorage.setItem(cacheKey, JSON.stringify(data));
};

// Prefetch the default "All Time" data when the module loads
if (typeof window !== 'undefined') {
  // Prefetch only if not already in cache
  const payoutsAllTime = getFromCache('top_by_payouts', 'all');
  const amountAllTime = getFromCache('top_by_amount', 'all');
  
  if (!payoutsAllTime || !amountAllTime) {
    (async () => {
      try {
        // Fetch payouts data
        const payoutsResponse = await fetch(`/api/fetchTopTraders?timefilter=all`);
        const payoutsResult = await payoutsResponse.json();
        
        if (payoutsResult.topTraders?.[0]?.top_by_payouts) {
          saveToCache('top_by_payouts', 'all', payoutsResult.topTraders[0].top_by_payouts);
        }
        
        // Fetch amount data
        const amountResponse = await fetch(`/api/fetchTopTraders?timefilter=all`);
        const amountResult = await amountResponse.json();
        
        if (amountResult.topTraders?.[0]?.top_by_amount) {
          saveToCache('top_by_amount', 'all', amountResult.topTraders[0].top_by_amount);
        }
        
        console.log("Prefetched default leaderboard data");
      } catch (err) {
        console.error("Error prefetching leaderboard data:", err);
      }
    })();
  }
}

// Export a minimal loader component that can be included in the page
export function HighEarnersLeaderboardLoader() {
  // This component doesn't need to render anything
  return null;
}

export default function HighEarnersLeaderboard({ topTraders }) {
  const [timeRangePayouts, setTimeRangePayouts] = useState("All Time");
  const [timeRangeAmount, setTimeRangeAmount] = useState("All Time");
  
  const [data, setData] = useState({ 
    top_by_payouts: [], 
    top_by_amount: [] 
  });
  
  const [loading, setLoading] = useState({ 
    top_by_payouts: true, 
    top_by_amount: true 
  });
  
  const [error, setError] = useState(null);
  
  // Track if component is mounted
  const isMounted = useRef(true);

  const timeFilters = {
    "All Time": "all",
    "Last 12 Months": "last_12_months",
    "Last 6 Months": "last_6_months",
    "Last 3 Months": "last_3_months",
  };
  
  // Load initial data
  useEffect(() => {
    // Check if we have cached data for the default time ranges
    const cachedPayoutsData = getFromCache('top_by_payouts', timeFilters[timeRangePayouts]);
    const cachedAmountData = getFromCache('top_by_amount', timeFilters[timeRangeAmount]);
    
    // Update state with cached data if available
    if (cachedPayoutsData) {
      setData(prev => ({ ...prev, top_by_payouts: cachedPayoutsData }));
      setLoading(prev => ({ ...prev, top_by_payouts: false }));
    }
    
    if (cachedAmountData) {
      setData(prev => ({ ...prev, top_by_amount: cachedAmountData }));
      setLoading(prev => ({ ...prev, top_by_amount: false }));
    }
    
    // Fetch data if not in cache
    if (!cachedPayoutsData) {
      fetchData('top_by_payouts', timeRangePayouts);
    }
    
    if (!cachedAmountData) {
      fetchData('top_by_amount', timeRangeAmount);
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Function to fetch data for a specific type and time range
  const fetchData = async (type, timeRange) => {
    // Check cache first
    const cachedData = getFromCache(type, timeFilters[timeRange]);
    if (cachedData) {
      console.log(`Using cached data for ${type} with time range ${timeRange}`);
      setData(prev => ({ ...prev, [type]: cachedData }));
      setLoading(prev => ({ ...prev, [type]: false }));
      return;
    }
    
    // If not in cache, fetch from API
    setLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      const response = await fetch(`/api/fetchTopTraders?timefilter=${timeFilters[timeRange]}`);
      const result = await response.json();
      
      if (response.ok && isMounted.current) {
        const newData = result.topTraders?.[0]?.[type] || [];
        
        // Update component state
        setData(prev => ({ ...prev, [type]: newData }));
        
        // Save to cache
        saveToCache(type, timeFilters[timeRange], newData);
        
        console.log(`Fetched and cached ${type} data for ${timeRange}`);
      } else if (isMounted.current) {
        throw new Error(result.error || "Failed to fetch traders");
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(prev => ({ ...prev, [type]: false }));
      }
    }
  };

  // Handle time range changes
  useEffect(() => {
    fetchData('top_by_payouts', timeRangePayouts);
  }, [timeRangePayouts]);

  useEffect(() => {
    fetchData('top_by_amount', timeRangeAmount);
  }, [timeRangeAmount]);

  // Save selected time ranges to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('leaderboardTimeRanges', JSON.stringify({
      payouts: timeRangePayouts,
      amount: timeRangeAmount
    }));
  }, [timeRangePayouts, timeRangeAmount]);

  // Restore selected time ranges from sessionStorage on mount
  useEffect(() => {
    const storedTimeRanges = sessionStorage.getItem('leaderboardTimeRanges');
    if (storedTimeRanges) {
      try {
        const { payouts, amount } = JSON.parse(storedTimeRanges);
        setTimeRangePayouts(payouts);
        setTimeRangeAmount(amount);
      } catch (e) {
        console.error("Error parsing stored time ranges:", e);
      }
    }
  }, []);

  // Initialize tooltips after render
  useEffect(() => {
    // Initialize tippy tooltips
    tippy("[data-tippy-content]", {
      theme: "dark",
      placement: "top",
      arrow: true,
      animation: "fade",
      duration: 200,
    })
  }, [data]) // Re-run when data changes

  if (error) return <p className="text-center text-red-500 py-4">{error}</p>

  // Function to render ranking for positions
  const renderRanking = (index) => {
    // Only top 3 positions get circles
    if (index === 0) {
      return (
        <div className="flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm bg-[#efbf04] text-black">
          {index + 1}
        </div>
      )
    } else if (index === 1) {
      return (
        <div className="flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm bg-[#c4c4c4] text-black">
          {index + 1}
        </div>
      )
    } else if (index === 2) {
      return (
        <div className="flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm bg-[#c68346] text-black">
          {index + 1}
        </div>
      )
    } else {
      // Positions 4+ just get the number without a circle
      return <span className="w-7 text-center font-medium text-zinc-500">{index + 1}</span>
    }
  }

  return (
    <div className="w-full py-6">
      {/* Custom styles for Tippy tooltips */}
      <style jsx global>{`
        .tippy-box[data-theme~='dark'] {
          background-color: rgba(0, 0, 0, 0.9);
          color: white;
          font-size: 12px;
          padding: 2px;
          border-radius: 4px;
        }
        .tippy-box[data-theme~='dark'][data-placement^='top'] > .tippy-arrow::before {
          border-top-color: rgba(0, 0, 0, 0.9);
        }
      `}</style>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {["top_by_payouts", "top_by_amount"].map((key, categoryIndex) => {
          const title = key === "top_by_payouts" ? "High Earners by Payout Count" : "High Earners by Total Amount"
          const subtitle =
            key === "top_by_payouts" ? "Top 50 High Earners by Payout Count" : "Top 50 High Earners by Total Amount"
          const timeRange = key === "top_by_payouts" ? timeRangePayouts : timeRangeAmount
          const setTimeRange = key === "top_by_payouts" ? setTimeRangePayouts : setTimeRangeAmount

          return (
            <div key={categoryIndex} className="rounded-lg border border-zinc-800 bg-[#0f0f0f] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                {/* Left Section: Icon, Title & Subtitle */}
                <div>
                  <div className="flex items-center">
                    <span className="text-amber-400 text-xl">
                      <DollarSign size={20} className="inline mr-2" />
                    </span>
                    <h2 className="text-3xl text-white">{title}</h2>
                  </div>
                  <p className="text-[#666666]">{subtitle}</p>
                </div>

                {/* Right Section: Filter Dropdown */}
                <Select value={timeRange} onValueChange={(value) => setTimeRange(value)}>
                  <SelectTrigger className="w-[170px] bg-[#1A1A1A] border-[#333333] text-white rounded-md px-3 py-1.5 text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#333333] text-white shadow-lg">
                    {Object.keys(timeFilters).map((label) => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {loading[key] ? (
                <div className="flex items-center justify-center h-[500px]">
                  <div className="w-8 h-8 border-4 border-[#edb900] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800 max-h-[600px] overflow-y-auto">
                  {data[key].map((trader, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors ${
                        index === 0
                          ? "bg-amber-400/5"
                          : index === 1
                            ? "bg-gray-300/5"
                            : index === 2
                              ? "bg-amber-700/5"
                              : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Ranking with circles only for top 3 */}
                        {renderRanking(index)}

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-amber-400">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-white text-lg">
                            {key === "top_by_payouts"
                              ? `${trader.total_payouts} payouts`
                              : `$${trader.total_amount.toLocaleString()}`}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-zinc-500">Paid by:</span>
                            {trader.companies_paid.map((company, i) => (
                              <div
                                key={i}
                                data-tippy-content={company.company}
                                style={{
                                  backgroundColor: company.brand_colour || "#2D2D2D",
                                  borderRadius: "4px",
                                  width: "24px",
                                  height: "24px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  overflow: "hidden",
                                }}
                              >
                                <Image
                                  src={company.logo_url || "/placeholder.svg"}
                                  alt={company.company}
                                  width={15}
                                  height={15}
                                  className="object-contain"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
