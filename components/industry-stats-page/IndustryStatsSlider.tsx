/* eslint-disable */
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DollarSign, Users, TrendingUp, BarChart2, Gem, Banknote } from "lucide-react"

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

// Simple function to check if data is valid
const isDataValid = (data) => {
  if (!data) return false

  // Check if at least one time period has valid data
  const periods = ["last24Hours", "last7Days", "last30Days", "sinceStart"]
  return periods.some((period) => {
    const periodData = data[period]
    return (
      periodData &&
      (typeof periodData.totalAmount === "number" ||
        typeof periodData.totalTransactions === "number" ||
        typeof periodData.uniqueTraders === "number")
    )
  })
}

// Create a cache key for this specific data
const CACHE_KEY = "industry-stats-slider-data"

const IndustryStatsSlider = ({ statsData }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const initialLoadComplete = useRef(false)
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

  // Handle data loading and caching
  useEffect(() => {
    // Only run this logic once on initial mount
    if (!initialLoadComplete.current) {
      // Check if we have valid data from props
      if (statsData && isDataValid(statsData)) {
        // We have valid data, use it and turn off loading
        setLoading(false)
        initialLoadComplete.current = true

        // Cache the data in sessionStorage
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(statsData))
        } catch (e) {
          console.warn("Failed to cache stats data:", e)
        }
        return
      }

      // If we don't have valid props data, try to get from cache
      try {
        const cachedData = sessionStorage.getItem(CACHE_KEY)
        if (cachedData) {
          const parsedData = JSON.parse(cachedData)
          if (isDataValid(parsedData)) {
            // We have valid cached data, use it and turn off loading
            setLoading(false)
            initialLoadComplete.current = true
            return
          }
        }
      } catch (e) {
        console.warn("Failed to retrieve cached stats data:", e)
      }

      // If we reach here, we don't have valid data yet
      // Keep loading state on until we get valid data
      const checkInterval = setInterval(() => {
        if (statsData && isDataValid(statsData)) {
          clearInterval(checkInterval)

          if (isMounted.current) {
            setLoading(false)
            initialLoadComplete.current = true

            // Cache the data
            try {
              sessionStorage.setItem(CACHE_KEY, JSON.stringify(statsData))
            } catch (e) {
              console.warn("Failed to cache stats data:", e)
            }
          }
        }
      }, 200)

      // Set a maximum loading time
      const maxLoadingTimer = setTimeout(() => {
        clearInterval(checkInterval)
        if (isMounted.current) {
          setLoading(false)
          initialLoadComplete.current = true
        }
      }, 5000)

      return () => {
        clearInterval(checkInterval)
        clearTimeout(maxLoadingTimer)
      }
    }
  }, [statsData])

  // Cache data when it changes after initial load
  useEffect(() => {
    if (initialLoadComplete.current && statsData && isDataValid(statsData)) {
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(statsData))
      } catch (e) {
        console.warn("Failed to update cached stats data:", e)
      }
    }
  }, [statsData])

  // Get the data to display - either from props or from cache
  const getDisplayData = () => {
    // First try props
    if (statsData && isDataValid(statsData)) {
      return statsData
    }

    // Then try cache
    try {
      const cachedData = sessionStorage.getItem(CACHE_KEY)
      if (cachedData) {
        const parsedData = JSON.parse(cachedData)
        if (isDataValid(parsedData)) {
          return parsedData
        }
      }
    } catch (e) {
      console.warn("Failed to retrieve cached stats data:", e)
    }

    // Fallback to empty data structure
    return {
      last24Hours: {},
      last7Days: {},
      last30Days: {},
      sinceStart: {},
    }
  }

  const displayData = getDisplayData()

  // Get slides from display data
  const slides = [displayData.last24Hours, displayData.last7Days, displayData.last30Days, displayData.sinceStart]

  // Handle slide navigation
  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length)

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !isHovered) handleNext()
    }, 2000)
    return () => clearInterval(interval)
  }, [currentSlide, loading, isHovered])

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
      {!loading && (
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

