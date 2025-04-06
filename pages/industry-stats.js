"use client"

import { useState, useEffect } from "react"
import useFetchStats from "../webhooks/useFetchStats"
import IndustryStatsSlider from "../components/industry-stats-page/IndustryStatsSlider"
import Navbar from "../components/Navbar"
import Noise from "../components/Noise"
import Accordion from "../components/Accordion"
import Community from "../components/Community"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"
import StatsTabs from "../components/industry-stats-page/StatsTabs"
import StatsTabContent from "../components/industry-stats-page/StatsTabContent"

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

const StatsPage = () => {
  const { stats, loading } = useFetchStats()
  const [activeTab, setActiveTab] = useState("stats")

  // Add the shimmer animation to the document
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

  const statsData = {
    last24Hours: {
      totalAmount: stats?.transactions24h?.[0]?.totalamount || 0,
      totalAmountChange: stats?.transactions24h?.[0]?.totalamountchange || "0%",
      totalTransactions: stats?.transactions24h?.[0]?.totaltransactions || 0,
      totalTransactionsChange: stats?.transactions24h?.[0]?.totaltransactionschange || "0%",
      uniqueTraders: stats?.transactions24h?.[0]?.uniquetraders || 0,
      uniqueTradersChange: stats?.transactions24h?.[0]?.uniquetraderschange || "0%",
      averagePayout: stats?.transactions24h?.[0]?.averagepayout || 0,
      largestPayout: stats?.transactions24h?.[0]?.largestpayout || 0,
      avgTransactionsPerTrader: stats?.transactions24h?.[0]?.avgtransactionspertrader || 0,
      timeSinceLastTransaction: stats?.transactions24h?.[0]?.timesincelasttransaction || "N/A",
    },
    last7Days: {
      totalAmount: stats?.transactions7d?.[0]?.totalamount || 0,
      totalAmountChange: stats?.transactions7d?.[0]?.totalamountchange || "0%",
      totalTransactions: stats?.transactions7d?.[0]?.totaltransactions || 0,
      totalTransactionsChange: stats?.transactions7d?.[0]?.totaltransactionschange || "0%",
      uniqueTraders: stats?.transactions7d?.[0]?.uniquetraders || 0,
      uniqueTradersChange: stats?.transactions7d?.[0]?.uniquetraderschange || "0%",
      averagePayout: stats?.transactions7d?.[0]?.averagepayout || 0,
      largestPayout: stats?.transactions7d?.[0]?.largestpayout || 0,
      avgTransactionsPerTrader: stats?.transactions7d?.[0]?.avgtransactionspertrader || 0,
      timeSinceLastTransaction: stats?.transactions7d?.[0]?.timesincelasttransaction || "N/A",
    },
    last30Days: {
      totalAmount: stats?.transactions30d?.[0]?.totalamount || 0,
      totalAmountChange: stats?.transactions30d?.[0]?.totalamountchange || "0%",
      totalTransactions: stats?.transactions30d?.[0]?.totaltransactions || 0,
      totalTransactionsChange: stats?.transactions30d?.[0]?.totaltransactionschange || "0%",
      uniqueTraders: stats?.transactions30d?.[0]?.uniquetraders || 0,
      uniqueTradersChange: stats?.transactions30d?.[0]?.uniquetraderschange || "0%",
      averagePayout: stats?.transactions30d?.[0]?.averagepayout || 0,
      largestPayout: stats?.transactions30d?.[0]?.largestpayout || 0,
      avgTransactionsPerTrader: stats?.transactions30d?.[0]?.avgtransactionspertrader || 0,
      timeSinceLastTransaction: stats?.transactions30d?.[0]?.timesincelasttransaction || "N/A",
    },
    sinceStart: {
      totalAmount: stats?.allTransactions?.[0]?.totalamount || 0,
      totalTransactions: stats?.allTransactions?.[0]?.totaltransactions || 0,
      uniqueTraders: stats?.allTransactions?.[0]?.uniquetraders || 0,
      averagePayout: stats?.allTransactions?.[0]?.averagepayout || 0,
      largestPayout: stats?.allTransactions?.[0]?.largestpayout || 0,
      avgTransactionsPerTrader: stats?.allTransactions?.[0]?.avgtransactionspertrader || 0,
      timeSinceLastTransaction: stats?.allTransactions?.[0]?.timesincelasttransaction || "N/A",
    },
  }

  // Skeleton for the industry stats slider
  const renderSliderSkeleton = () => {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <div key={`slider-skeleton-${index}`} className="bg-[#1a1a1a] rounded-[10px] border border-[#2a2a2a] p-6">
              <div className="h-8 w-40 bg-[#222] rounded shimmer-effect mb-4"></div>
              <div className="h-10 w-32 bg-[#222] rounded shimmer-effect mb-6"></div>
              <div className="h-6 w-full bg-[#222] rounded shimmer-effect mb-3"></div>
              <div className="h-6 w-3/4 bg-[#222] rounded shimmer-effect"></div>
            </div>
          ))}
      </div>
    )
  }

  // Skeleton for the tabs content
  const renderTabsContentSkeleton = () => {
    return (
      <div className="w-full">
        <div className="flex justify-left mx-auto mb-6">
          <div className="h-10 w-64 bg-[#222] rounded shimmer-effect"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div
                key={`tab-content-skeleton-${index}`}
                className="bg-[#1a1a1a] rounded-[10px] border border-[#2a2a2a] p-6"
              >
                <div className="h-6 w-32 bg-[#222] rounded shimmer-effect mb-4"></div>
                <div className="h-8 w-24 bg-[#222] rounded shimmer-effect mb-3"></div>
                <div className="h-4 w-full bg-[#222] rounded shimmer-effect"></div>
              </div>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      <Navbar />
      <Noise />
      <div className="container mx-auto mb-[200px] w-[1250px] z-50">
        <div className="w-full flex justify-center items-center flex-col">
          <div className="w-[900px] flex justify-center items-center flex-col mb-[150px]">
            <h1 className="text-6xl font-[balboa] mt-[200px]">Industry Statistics</h1>
            <p className="mb-[50px] mt-[20px] text-center">
              In this section of our website we will be presenting industry specific statistics about payouts, web
              traffic, trends and overall customer sentiment.
            </p>
            <Accordion title="Learn more about our data collection process">
              <p>We collect our data from publicly available sources, primarily the Arbitrum blockchain.</p>
              <p className="mt-[20px]">
                It is important to note that our data is not 100% complete. This means that some companies may not be
                featured, or portions of their data might be missing.
              </p>
              <p className="mt-[20px]">
                However, our dataset represents a significant sample of the industry and can be used by users as part of
                their due diligence when researching the industry or specific companies.
              </p>
            </Accordion>
          </div>

          {loading ? (
            // Show skeleton loader for the slider when loading
            renderSliderSkeleton()
          ) : (
            <IndustryStatsSlider statsData={statsData} />
          )}

          {loading ? (
            // Show skeleton loader for the tabs content when loading
            renderTabsContentSkeleton()
          ) : (
            <div className="w-full">
              <div className="flex justify-left mx-auto">
                <StatsTabs activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
              {/* Tab content */}
              <StatsTabContent activeTab={activeTab} stats={stats} />
            </div>
          )}
        </div>
      </div>
      <Community />
      <Newsletter />
      <Footer />
    </div>
  )
}

export default StatsPage

