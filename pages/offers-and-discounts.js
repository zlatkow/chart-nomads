"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import Navbar from "../components/Navbar"
import Noise from "../components/Noise"
import Community from "../components/Community"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"
import LoginModal from "../components/Auth/LoginModal"
import OffersComponent from "../components/Offers"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function DiscountsPage() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  // Animation effect for the hero section
  useEffect(() => {
    // Start animation after a short delay
    const startTimer = setTimeout(() => {
      setIsAnimating(true)
    }, 300)

    // Stop animation after animation completes
    const stopTimer = setTimeout(() => {
      setIsAnimating(false)
    }, 1600) // 300ms delay + 1300ms animation duration

    return () => {
      clearTimeout(startTimer)
      clearTimeout(stopTimer)
    }
  }, [])

  // Function to delete old expired discounts (runs once on component mount)
  useEffect(() => {
    async function deleteOldExpiredDiscounts() {
      try {
        const { data, error } = await supabase.from("propfirm_discounts").select("id, expiry_date")

        if (error) {
          console.error("Error fetching discounts for deletion check:", error)
          return
        }

        const currentDate = new Date()
        currentDate.setHours(0, 0, 0, 0) // Set to beginning of day
        const tenDaysInMs = 10 * 24 * 60 * 60 * 1000 // 10 days in milliseconds

        // Find discounts that expired more than 10 days ago
        const discountsToDelete = data.filter((discount) => {
          if (!discount.expiry_date) return false

          const expiryDate = new Date(discount.expiry_date)
          expiryDate.setHours(0, 0, 0, 0) // Set to beginning of day
          const timeDifference = currentDate - expiryDate

          return timeDifference > tenDaysInMs
        })

        // Delete the old expired discounts
        if (discountsToDelete.length > 0) {
          const idsToDelete = discountsToDelete.map((discount) => discount.id)
          const { error: deleteError } = await supabase.from("propfirm_discounts").delete().in("id", idsToDelete)

          if (deleteError) {
            console.error("Error deleting old expired discounts:", deleteError)
          } else {
            console.log(`Successfully deleted ${discountsToDelete.length} old expired discounts`)
          }
        }
      } catch (error) {
        console.error("Error in deleteOldExpiredDiscounts:", error)
      }
    }

    // Run once when component mounts
    deleteOldExpiredDiscounts()
  }, [])

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <Noise />

      {/* Login Modal */}
      {isLoginOpen && <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />}

      {/* Main Content */}
      <main className="relative container mx-auto px-4 pt-[250px] z-10 mb-[150px]">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 flex flex-wrap items-center justify-center gap-2 md:gap-4">
            <span className="text-white text-5xl md:text-6xl">OFFERS</span>{" "}
            <span
              className={`text-[#edb900] text-6xl md:text-8xl mb-6 font-extrabold transition-all duration-300 ${
                isAnimating ? "tilt-animation" : ""
              }`}
              style={{ display: "inline-block", transformOrigin: "center" }}
            >
              UNLIKE
            </span>{" "}
            <span className="text-white text-5xl md:text-6xl">ANY OTHER</span>
          </h1>
          <p className="text-xl text-white mb-[200px]">Find the best deals in one place.</p>
        </div>

        {/* Offers Component with tabs and search enabled */}
        <OffersComponent
          supabase={supabase}
          onLoginModalOpen={() => setIsLoginOpen(true)}
          showTabs={true}
          showSearch={true}
        />
      </main>

      <Community />
      <Newsletter />
      <Footer />
    </div>
  )
}

