/* eslint-disable */
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DollarSign, Users, TrendingUp, BarChart2, Gem, Banknote } from "lucide-react"

// Global cache for industry stats data
let globalStatsData = null
let lastFetchTime = null
const CACHE_EXPIRY_TIME = 5 * 60 * 1000 // 5 minutes

// Add the shimmer animation CSS
const shimmerAnimation = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.shimmer-effect {
  position: relative;
  overflow: hidden;
  background-color: #222;
}

.shimmer-effect::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(34, 34, 34, 0) 0,
    rgba(34, 34, 34, 0.2) 20%,
    rgba(237, 185, 0, 0.15) 60%,
    rgba(34, 34, 34, 0)
  );
  animation: shimmer 2s infinite;
}
`

// Try to load cached data from sessionStorage when the module loads
if (typeof window !== "undefined") {
  try {
    const cachedData = sessionStorage.getItem("industryStatsData")
    const cachedTime = sessionStorage.getItem("industryStatsFetchTime")

    if (cachedData && cachedTime) {
      globalStatsData = JSON.parse(cachedData)
      lastFetchTime = Number.parseInt(cachedTime)
      console.log("Loaded industry stats from sessionStorage on module load")
    }
  } catch (e) {
    console.warn("Failed to load industry stats from sessionStorage:", e)
  }
}

// Function to prefetch and cache stats data
export function prefetchIndustryStats(fetchStatsFunction) {
  if (typeof window === "undefined") return

  // If we already have fresh data, don't refetch
  if (globalStatsData && lastFetchTime && Date.now() - lastFetchTime < CACHE_EXPIRY_TIME) {
    console.log("Using existing cached industry stats data")
    return
  }

  console.log("Prefetching industry stats data")
  fetchStatsFunction()
    .then((data) => {
      if (data) {
        globalStatsData = data
        lastFetchTime = Date.now()

        // Save to sessionStorage
        try {
          sessionStorage.setItem("industryStatsData", JSON.stringify(data))
          sessionStorage.setItem("industryStatsFetchTime", lastFetchTime.toString())
          console.log("Industry stats data cached successfully")
        } catch (e) {
          console.warn("Failed to save industry stats to sessionStorage:", e)
        }
      }
    })
    .catch((err) => {
      console.error("Error prefetching industry stats:", err)
    })
}

// Loader component that can be included in the page to trigger prefetching
export function IndustryStatsLoader({ fetchStatsFunction }) {
  useEffect(() => {
    if (fetchStatsFunction) {
      prefetchIndustryStats(fetchStatsFunction)
    }
  }, [fetchStatsFunction])

  return null
}

// Check if data is valid and ready to display
const isDataReady = (data) => {
  if (!data) return false

  const slides = [data.last24Hours, data.last7Days, data.last30Days, data.sinceStart]

  return slides.some(
    (slide) =>
      slide &&
      // Check for non-zero values in key metrics
      ((typeof slide.totalAmount === "number" && slide.totalAmount !== 0) ||
        (typeof slide.totalTransactions === "number" && slide.totalTransactions !== 0) ||
        (typeof slide.uniqueTraders === "number" && slide.uniqueTraders !== 0)),
  )
}

const IndustryStatsSlider = ({ statsData, fetchStats }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(false) // Start with false to prevent flashing on tab changes
  const [isHovered, setIsHovered] = useState(false)
  const [effectiveData, setEffectiveData] = useState(null)
  const initialLoadDone = useRef(false)
  const isMounted = useRef(true)

  // Array of headings for each slide
  const slideHeadings = ["Last 24 Hours", "Last 7 Days", "Last 30 Days", "All Time"]

  // Add shimmer animation to document
  useEffect(() => {
    if (typeof document !== "undefined") {
      const style = document.createElement("style")
      style.textContent = shimmerAnimation
      document.head.appendChild(style)

      return () => {
        document.head.removeChild(style)
      }
    }
  }, [])

  // Set up cleanup when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // Initialize data on mount
  useEffect(() => {
    // Only show loading state on initial mount if we don't have cached data
    if (!initialLoadDone.current) {
      // First check if we have data from props
      if (statsData && isDataReady(statsData)) {
        setEffectiveData(statsData)
        initialLoadDone.current = true

        // Cache the data
        globalStatsData = statsData
        lastFetchTime = Date.now()

        try {
          sessionStorage.setItem("industryStatsData", JSON.stringify(statsData))
          sessionStorage.setItem("industryStatsFetchTime", Date.now().toString())
        } catch (e) {
          console.warn("Failed to save industry stats to sessionStorage:", e)
        }

        return
      }

      // Then check if we have cached data
      if (globalStatsData && isDataReady(globalStatsData)) {
        console.log("Using cached industry stats data")
        setEffectiveData(globalStatsData)
        initialLoadDone.current = true
        return
      }

      // If no data available, show loading state and fetch
      setLoading(true)

      // Try to fetch data if we have a fetch function
      if (fetchStats) {
        fetchStats()
          .then((data) => {
            if (!isMounted.current) return

            if (data && isDataReady(data)) {
              setEffectiveData(data)
              globalStatsData = data
              lastFetchTime = Date.now()

              try {
                sessionStorage.setItem("industryStatsData", JSON.stringify(data))
                sessionStorage.setItem("industryStatsFetchTime", lastFetchTime.toString())
              } catch (e) {
                console.warn("Failed to save industry stats to sessionStorage:", e)
              }
            }

            // Delay turning off loading for visual consistency
            setTimeout(() => {
              if (isMounted.current) {
                setLoading(false)
                initialLoadDone.current = true
              }
            }, 1000)
          })
          .catch((err) => {
            console.error("Error fetching industry stats:", err)
            if (isMounted.current) {
              setLoading(false)
              initialLoadDone.current = true
            }
          })
      } else {
        // No fetch function provided, turn off loading after a delay
        setTimeout(() => {
          if (isMounted.current) {
            setLoading(false)
            initialLoadDone.current = true
          }
        }, 1000)
      }
    }
  }, [statsData, fetchStats])

  // Update effective data when props change, but don't trigger loading state
  useEffect(() => {
    if (statsData && isDataReady(statsData) && initialLoadDone.current) {
      setEffectiveData(statsData)

      // Update cache
      globalStatsData = statsData
      lastFetchTime = Date.now()

      try {
        sessionStorage.setItem("industryStatsData", JSON.stringify(statsData))
        sessionStorage.setItem("industryStatsFetchTime", lastFetchTime.toString())
      } catch (e) {
        console.warn("Failed to save industry stats to sessionStorage:", e)
      }
    }
  }, [statsData])

  // Get slides from effective data
  const slides = effectiveData
    ? [effectiveData.last24Hours, effectiveData.last7Days, effectiveData.last30Days, effectiveData.sinceStart]
    : []

  // Handle slide navigation
  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length)

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !isHovered && slides.length > 0) handleNext()
    }, 2000)
    return () => clearInterval(interval)
  }, [currentSlide, loading, isHovered, slides.length])

  const PercentageBubble = ({ change }) => {
    if (change === null || change === undefined) return null
    const parsedChange = Number.parseFloat(change)
    const isPositive = parsedChange >= 0
    return (
      <span
        className={`ml-2 px-2 py-1 rounded-full text-sm ${
          isPositive ? "bg-[#13261B] text-[#41DE80]" : "bg-[#771D1D] text-[#EFB4B4]"
        }`}
      >
        {isPositive ? `+${parsedChange}%` : `${parsedChange}%`}
      </span>
    )
  }

  // Skeleton loader for the stats cards
  const renderSkeletonCards = () => {
    return (
      <>
        {/* Skeleton Heading */}
        <div className="h-8 w-48 bg-[#222] rounded shimmer-effect mb-6 ml-3"></div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 px-2 py-1">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="relative bg-[#0f0f0f] p-6 rounded-lg shadow-sm flex flex-col items-start border-[1px] border-[#666666]"
              >
                {/* Icon placeholder */}
                <div className="absolute top-4 right-4">
                  <div className="h-5 w-5 bg-[#222] rounded shimmer-effect"></div>
                </div>

                {/* Title placeholder */}
                <div className="h-5 w-24 bg-[#222] rounded shimmer-effect mb-3"></div>

                {/* Value placeholder */}
                <div className="h-8 w-32 bg-[#222] rounded shimmer-effect mb-2"></div>

                {/* Subtitle placeholder */}
                <div className="h-4 w-36 bg-[#222] rounded shimmer-effect"></div>
              </div>
            ))}
        </div>

        {/* Time Since Last Payout placeholder */}
        <div className="mt-4 text-right px-10">
          <div className="h-6 w-64 bg-[#222] rounded shimmer-effect ml-auto"></div>
        </div>
      </>
    )
  }

  return (
    <div
      className="relative w-full bg-[#0f0f0f] rounded-lg p-6 mb-[50px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Loading Indicator with Shimmer Effect */}
      {loading ? (
        renderSkeletonCards()
      ) : !effectiveData || slides.length === 0 ? (
        <div className="text-center py-10 text-white">No data available</div>
      ) : (
        <>
          {/* Slide Heading */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={`heading-${currentSlide}`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-3xl text-white mb-6 flex items-center"
            >
              <span className="text-[#edb900] mr-2">|</span>
              {slideHeadings[currentSlide]}
            </motion.h2>
          </AnimatePresence>

          <div className="relative overflow-hidden">
            <div className="flex items-center justify-center">
              <div className="w-full overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-6 px-2 py-1"
                  >
                    {[
                      {
                        title: "Total Amount",
                        value:
                          `$${(slides[currentSlide]?.totalAmount / 1_000_000)
                            .toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}M` || "0",
                        subtitle: "Cumulative paid amount",
                        change: slides[currentSlide]?.totalAmountChange || null,
                        icon: <Banknote size={20} className="text-[#edb900]" />,
                      },
                      {
                        title: "Total Transactions",
                        value: slides[currentSlide]?.totalTransactions?.toLocaleString() || "0",
                        subtitle: "Cumulative transactions",
                        change: slides[currentSlide]?.totalTransactionsChange || null,
                        icon: <BarChart2 className="h-5 w-5 text-[#edb900]" />,
                      },
                      {
                        title: "Unique Traders",
                        value: slides[currentSlide]?.uniqueTraders?.toLocaleString() || "0",
                        subtitle: "Unique traders count",
                        change: slides[currentSlide]?.uniqueTradersChange || null,
                        icon: <Users size={20} className="text-[#edb900]" />,
                      },
                      {
                        title: "Average Payout",
                        value: `$${Number.parseFloat(slides[currentSlide]?.averagePayout || 0)
                          .toFixed(2)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
                        subtitle: "Average payout amount",
                        change: slides[currentSlide]?.averagePayoutChange || null,
                        icon: <DollarSign size={20} className="text-[#edb900]" />,
                      },
                      {
                        title: "Largest Payout",
                        value: `$${slides[currentSlide]?.largestPayout?.toLocaleString() || "0"}`,
                        subtitle: "Highest single payout",
                        change: slides[currentSlide]?.largestPayoutChange || null,
                        icon: <Gem size={20} className="text-[#edb900]" />,
                      },
                      {
                        title: "Avg Transactions per Trader",
                        value: slides[currentSlide]?.avgTransactionsPerTrader?.toFixed(2) || "0",
                        subtitle: "Average transactions per trader",
                        change: slides[currentSlide]?.avgTransactionsPerTraderChange || null,
                        icon: <TrendingUp size={20} className="text-[#edb900]" />,
                      },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="relative bg-[#0f0f0f] p-6 rounded-lg shadow-sm flex flex-col items-start border-[1px] border-[#666666] transition-transform duration-200 hover:scale-[1.03] hover:border-[#EDB900] hover:bg-[rgba(255,255,255,0.03)]"
                      >
                        <div className="absolute top-4 right-4">{stat.icon}</div>
                        <h3 className="text-[#666666] font-medium">{stat.title}</h3>
                        <p className="text-3xl font-bold text-white">
                          {stat.value}
                          {stat.change !== null && <PercentageBubble change={stat.change} />}
                        </p>
                        <p className="text-[#666666] text-sm">{stat.subtitle}</p>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Time Since Last Payout */}
      {!loading && effectiveData && slides.length > 0 && (
        <div className="mt-4 text-gray-400 text-lg text-right px-10">
          <span className="text-white">Time Since Last Payout: </span>
          <span className="text-xl text-[#edb900]">
            {slides[currentSlide]?.timeSinceLastTransaction || "No recent transactions"}
          </span>
        </div>
      )}
    </div>
  )
}

export default IndustryStatsSlider

