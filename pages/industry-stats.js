/* eslint-disable */

"use client"

import { useState } from "react"
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

const StatsPage = () => {
  const { stats, loading } = useFetchStats()
  const [activeTab, setActiveTab] = useState("stats")

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
          <IndustryStatsSlider statsData={statsData} />
          {!loading && (
        //   {/* Add the tabs component here */}
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

