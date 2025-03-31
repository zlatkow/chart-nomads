/* eslint-disable */
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DollarSign, Users, TrendingUp, BarChart2, LoaderCircle, Gem, Banknote } from "lucide-react"

const CompanyStatsSlider = ({ companyName }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [statsData, setStatsData] = useState(null)
  const [error, setError] = useState(null)

  // Array of headings for each slide
  const slideHeadings = ["Last 24 Hours", "Last 7 Days", "Last 30 Days", "All Time"]

  // Fetch company stats data
  useEffect(() => {
    const fetchCompanyStats = async () => {
      if (!companyName) return

      try {
        setLoading(true)
        setError(null)
        console.log(`Fetching stats for company: ${companyName}`)

        const response = await fetch(`/api/getCompanyAllStats?company=${encodeURIComponent(companyName)}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Failed to fetch stats: ${response.status} - ${errorData.error || "Unknown error"}`)
        }

        const data = await response.json()
        console.log("Received company stats data:", data)

        // Transform API response to match expected format
        const transformedData = {
          last24Hours: data["24h"],
          last7Days: data["7d"],
          last30Days: data["30d"],
          sinceStart: data["all"],
        }

        setStatsData(transformedData)
        // Add a small delay to show loading animation
        setTimeout(() => setLoading(false), 500)
      } catch (error) {
        console.error("Error fetching company stats:", error)
        setError(error.message)
        setLoading(false)
      }
    }

    fetchCompanyStats()
  }, [companyName])

  const slides = statsData
    ? [statsData.last24Hours, statsData.last7Days, statsData.last30Days, statsData.sinceStart]
    : []

  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length)

  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !isHovered && slides.length > 0) handleNext()
    }, 3000)
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

  if (error) {
    return (
      <div className="relative w-full bg-[#0f0f0f] rounded-lg p-6 mb-[50px]">
        <div className="text-center py-6">
          <p className="text-red-500 mb-4">Error loading stats: {error}</p>
          <p className="text-gray-400">We're working on getting the latest stats for {companyName}.</p>
        </div>
      </div>
    )
  }

  if (!loading && (!statsData || !slides.length || !slides[0])) {
    return (
      <div className="relative w-full bg-[#0f0f0f] rounded-lg p-6 mb-[50px]">
        <div className="text-center py-6">
          <p className="text-gray-400">No stats data available for {companyName}.</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative w-full bg-[#0f0f0f] rounded-lg p-6 mb-[50px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Loading Indicator */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <LoaderCircle size={40} className="animate-spin text-[#edb900]" />
          <p className="text-white mt-4">Loading {companyName} Stats...</p>
        </div>
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
                    {slides.length > 0 &&
                      [
                        {
                          title: "Total Amount",
                          value:
                            `$${(slides[currentSlide]?.total_amount / 1_000_000)
                              .toFixed(2)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}M` || "0",
                          subtitle: "Cumulative paid amount",
                          change: slides[currentSlide]?.total_amount_change || null,
                          icon: <Banknote size={20} className="text-[#edb900]" />,
                        },
                        {
                          title: "Total Transactions",
                          value: slides[currentSlide]?.total_transactions?.toLocaleString() || "0",
                          subtitle: "Cumulative transactions",
                          change: slides[currentSlide]?.total_transactions_change || null,
                          icon: <BarChart2 className="h-5 w-5 text-[#edb900]" />,
                        },
                        {
                          title: "Unique Traders",
                          value: slides[currentSlide]?.unique_traders?.toLocaleString() || "0",
                          subtitle: "Unique traders count",
                          change: slides[currentSlide]?.unique_traders_change || null,
                          icon: <Users size={20} className="text-[#edb900]" />,
                        },
                        {
                          title: "Average Payout",
                          value: `$${Number.parseFloat(slides[currentSlide]?.average_payout || 0)
                            .toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
                          subtitle: "Average payout amount",
                          change: slides[currentSlide]?.average_payout_change || null,
                          icon: <DollarSign size={20} className="text-[#edb900]" />,
                        },
                        {
                          title: "Largest Payout",
                          value: `$${slides[currentSlide]?.largest_payout?.toLocaleString() || "0"}`,
                          subtitle: "Highest single payout",
                          change: slides[currentSlide]?.largest_payout_change || null,
                          icon: <Gem size={20} className="text-[#edb900]" />,
                        },
                        {
                          title: "Avg Transactions per Trader",
                          value: slides[currentSlide]?.avg_transactions_per_trader?.toFixed(2) || "0",
                          subtitle: "Average transactions per trader",
                          change: slides[currentSlide]?.avg_transactions_per_trader_change || null,
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
      {!loading && slides.length > 0 && (
        <div className="mt-4 text-gray-400 text-lg text-right px-10">
          <span className="text-white">Time Since Last Payout: </span>
          <span className="text-xl text-[#edb900]">
            {slides[currentSlide]?.time_since_last_transaction || "No recent transactions"}
          </span>
        </div>
      )}
    </div>
  )
}

export default CompanyStatsSlider

