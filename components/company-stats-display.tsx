"use client"

import { useState, useEffect } from "react"
import { DollarSign, Users, TrendingUp, BarChart2, LoaderCircle, Gem, Banknote } from "lucide-react"

const CompanyStatsDisplay = ({ companyName }) => {
  const [loading, setLoading] = useState(true)
  const [statsData, setStatsData] = useState(null)
  const [error, setError] = useState(null)

  // Fetch company stats data
  useEffect(() => {
    const fetchCompanyStats = async () => {
      if (!companyName) return

      try {
        setLoading(true)
        console.log(`Fetching stats for company: ${companyName}`)

        const response = await fetch(`/api/getCompanyAllStats?company=${encodeURIComponent(companyName)}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.status}`)
        }

        const data = await response.json()
        console.log("Received company stats data:", data)

        setStatsData(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching company stats:", error)
        setError(error.message)
        setLoading(false)
      }
    }

    fetchCompanyStats()
  }, [companyName])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <LoaderCircle size={40} className="animate-spin text-[#edb900]" />
        <p className="text-white mt-4">Loading {companyName} Stats...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading stats: {error}</p>
      </div>
    )
  }

  if (!statsData || !statsData["24h"]) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">No stats available for {companyName}.</p>
      </div>
    )
  }

  const data24h = statsData["24h"]

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="relative bg-[#0f0f0f] p-6 rounded-lg shadow-sm flex flex-col items-start border-[1px] border-[#666666] transition-transform duration-200 hover:scale-[1.03] hover:border-[#EDB900] hover:bg-[rgba(255,255,255,0.03)]">
          <div className="absolute top-4 right-4">
            <Banknote size={20} className="text-[#edb900]" />
          </div>
          <h3 className="text-[#666666] font-medium">Total Amount</h3>
          <p className="text-3xl font-bold text-white">
            ${((data24h.total_amount || 0) / 1_000_000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}M
          </p>
          <p className="text-[#666666] text-sm">Cumulative paid amount</p>
        </div>

        <div className="relative bg-[#0f0f0f] p-6 rounded-lg shadow-sm flex flex-col items-start border-[1px] border-[#666666] transition-transform duration-200 hover:scale-[1.03] hover:border-[#EDB900] hover:bg-[rgba(255,255,255,0.03)]">
          <div className="absolute top-4 right-4">
            <BarChart2 size={20} className="text-[#edb900]" />
          </div>
          <h3 className="text-[#666666] font-medium">Total Transactions</h3>
          <p className="text-3xl font-bold text-white">{(data24h.total_transactions || 0).toLocaleString()}</p>
          <p className="text-[#666666] text-sm">Cumulative transactions</p>
        </div>

        <div className="relative bg-[#0f0f0f] p-6 rounded-lg shadow-sm flex flex-col items-start border-[1px] border-[#666666] transition-transform duration-200 hover:scale-[1.03] hover:border-[#EDB900] hover:bg-[rgba(255,255,255,0.03)]">
          <div className="absolute top-4 right-4">
            <Users size={20} className="text-[#edb900]" />
          </div>
          <h3 className="text-[#666666] font-medium">Unique Traders</h3>
          <p className="text-3xl font-bold text-white">{(data24h.unique_traders || 0).toLocaleString()}</p>
          <p className="text-[#666666] text-sm">Unique traders count</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative bg-[#0f0f0f] p-6 rounded-lg shadow-sm flex flex-col items-start border-[1px] border-[#666666] transition-transform duration-200 hover:scale-[1.03] hover:border-[#EDB900] hover:bg-[rgba(255,255,255,0.03)]">
          <div className="absolute top-4 right-4">
            <DollarSign size={20} className="text-[#edb900]" />
          </div>
          <h3 className="text-[#666666] font-medium">Average Payout</h3>
          <p className="text-3xl font-bold text-white">
            $
            {Number.parseFloat(data24h.average_payout || 0)
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </p>
          <p className="text-[#666666] text-sm">Average payout amount</p>
        </div>

        <div className="relative bg-[#0f0f0f] p-6 rounded-lg shadow-sm flex flex-col items-start border-[1px] border-[#666666] transition-transform duration-200 hover:scale-[1.03] hover:border-[#EDB900] hover:bg-[rgba(255,255,255,0.03)]">
          <div className="absolute top-4 right-4">
            <Gem size={20} className="text-[#edb900]" />
          </div>
          <h3 className="text-[#666666] font-medium">Largest Payout</h3>
          <p className="text-3xl font-bold text-white">${(data24h.largest_payout || 0).toLocaleString()}</p>
          <p className="text-[#666666] text-sm">Highest single payout</p>
        </div>

        <div className="relative bg-[#0f0f0f] p-6 rounded-lg shadow-sm flex flex-col items-start border-[1px] border-[#666666] transition-transform duration-200 hover:scale-[1.03] hover:border-[#EDB900] hover:bg-[rgba(255,255,255,0.03)]">
          <div className="absolute top-4 right-4">
            <TrendingUp size={20} className="text-[#edb900]" />
          </div>
          <h3 className="text-[#666666] font-medium">Avg Transactions per Trader</h3>
          <p className="text-3xl font-bold text-white">{(data24h.avg_transactions_per_trader || 0).toFixed(2)}</p>
          <p className="text-[#666666] text-sm">Average transactions per trader</p>
        </div>
      </div>

      <div className="mt-6 text-right">
        <span className="text-white">Time Since Last Payout: </span>
        <span className="text-xl text-[#edb900]">
          {data24h.time_since_last_transaction || "No recent transactions"}
        </span>
      </div>
    </div>
  )
}

export default CompanyStatsDisplay

