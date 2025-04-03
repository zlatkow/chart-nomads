/* eslint-disable */
"use client"
import type { SupabaseClient } from "@supabase/supabase-js"
import { useState, useEffect, useContext } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { supabase } from "../../lib/supabase"
import Image from "next/image"
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  BarChart2,
  DollarSign,
  Award,
  FileText,
  MessageSquare,
  Newspaper,
  ListTree,
  Star,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons"
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons"
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons"
import Tippy from "@tippyjs/react"
import "tippy.js/dist/tippy.css" // Default tooltip styles
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs"
import Navbar from "../../components/Navbar"
import Noise from "../../components/Noise"
import Testimonials from "../../components/Testimonials"
import Community from "../../components/Community"
import Newsletter from "../../components/Newsletter"
import Offers from "../../components/Offers"
import Footer from "../../components/Footer"
import CommentSection from "../../components/comment-section"
import ReviewSystem from "../../components/review-system"
import CompanyStatsTabs from "../../components/industry-stats-page/CompanyStatsTabs"
import CompanyStatsTabContent from "../../components/industry-stats-page/CompanyStatsTabContent"
import { useNoise } from "../../components/providers/noise-provider"
import { ModalContext } from "../../pages/_app"
import CompanyStatsSlider from "../../components/company-stats-slider"
import { RiTwitterXFill, RiDiscordLine, RiTiktokLine } from "react-icons/ri"

// Add shimmer animation CSS
const shimmerAnimation = `
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-shimmer {
  position: relative;
  overflow: hidden;
}

.animate-shimmer::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.05) 20%,
    rgba(255, 255, 255, 0.1) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
  pointer-events: none;
}
`

// Define types for the firm and rating data
interface Firm {
  id: number
  propfirm_name: string
  logo_url?: string
  brand_colour?: string
  category?: string
  rating?: number
  reviews_count?: number
  likes?: number
  facebook_link?: string
  x_link?: string
  instagram_link?: string
  linkedin_link?: string
  youtube_link?: string
  tiktok_link?: string
  discord_link?: string
  ceo?: string
  established?: string
  years_in_operations?: string
  country?: number // Changed from string to number
  country_data?: {
    id: number
    country: string
    flag: string
  }
  referral_link?: string
  broker?: string
  platform?: string
  platform_details?: string
  instruments?: string[]
  leverage?: Record<string, string>
  "1_star_reviews"?: number
  "2_star_reviews"?: number
  "3_star_reviews"?: number
  "4_star_reviews"?: number
  "5_star_reviews"?: number
}

// Define a type for country data
interface CountryData {
  id: number
  country: string
  flag: string
}

// Import the RatingBreakdown type from the parent component or use any to avoid conflicts
type RatingBreakdown = any

interface OffersProps {
  firmId: number | null
  supabase: SupabaseClient
  hideCompanyCard: boolean
  onLoginModalOpen: () => void
  showTabs: boolean
}

interface PropFirmUIProps {
  slug: string
  ratingBreakdown?: RatingBreakdown
  formatCurrency?: (value: number, currency?: string) => string
  isLoading?: boolean
}

// Hardcoded country data as fallback
const countryMap: Record<number, CountryData> = {
  1: {
    id: 1,
    country: "United Kingdom",
    flag: "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg",
  },
  2: {
    id: 2,
    country: "United States",
    flag: "https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg",
  },
}

function PropFirmUI({
  slug,
  ratingBreakdown,
  formatCurrency = (value: number, currency?: string) => `$${value}`,
  isLoading: initialLoading = false,
}: PropFirmUIProps) {
  const [firm, setFirm] = useState<Firm | null>(null)
  const [loading, setLoading] = useState(initialLoading || !slug)

  // Fetch firm data when slug changes
  useEffect(() => {
    async function fetchFirmData() {
      if (!slug) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Fetch the firm data
        const { data: firmData, error: firmError } = await supabase
          .from("prop_firms")
          .select("*")
          .eq("slug", slug)
          .single()

        if (firmError) {
          console.error("Error fetching firm data:", firmError)
          setFirm(null)
        } else {
          console.log("Fetched firm data:", firmData)
          setFirm(firmData)

          // Immediately try to fetch country data if we have a country ID
          if (firmData && firmData.country) {
            fetchCountryDataDirectly(firmData.country)
          }
        }
      } catch (error) {
        console.error("Error in fetchFirmData:", error)
        setFirm(null)
      } finally {
        setLoading(false)
      }
    }

    fetchFirmData()
  }, [slug])

  console.log("PropFirmUI received slug:", slug, "firm:", firm)

  // Get URL search params to handle tab selection and review highlighting
  const searchParams = useSearchParams()
  const highlightReviewId = searchParams.get("highlight")
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview")

  // Add stats related state
  const [statsActiveTab, setStatsActiveTab] = useState("stats")

  // Add this useEffect to update the active tab when the URL changes
  useEffect(() => {
    const tab = searchParams.get("tab") || "overview"
    setActiveTab(tab)
  }, [searchParams])

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

  // Remove this useEffect since we're now managing loading state in the fetchFirmData function
  // useEffect(() => {
  //   setLoading(isLoading || !firm)
  // }, [isLoading, firm])

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const { user } = useUser()
  const [userLikedFirms, setUserLikedFirms] = useState(new Set())
  const [loadingLikes, setLoadingLikes] = useState(true)
  const [mainRules, setMainRules] = useState(null)
  const [changeLogs, setChangeLogs] = useState([])
  const [rulesActiveTab, setRulesActiveTab] = useState("main-rules")
  const [rulesLoading, setRulesLoading] = useState(true)
  const [bannedCountries, setBannedCountries] = useState(null)
  const [countryData, setCountryData] = useState<CountryData | null>(null)

  // Get the noise context
  const { isNoiseVisible } = useNoise()

  // Get the modal context
  const modalContext = useContext(ModalContext)

  // Check if the context is available
  if (!modalContext) {
    console.error("ModalContext is not available in PropFirmUI")
  }

  const { setShowLoginModal } = modalContext || {
    setShowLoginModal: () => console.error("setShowLoginModal not available"),
  }

  // Memoize the firmId to prevent it from changing on every render
  const firmId = firm?.id || null

  // Direct function to fetch country data
  async function fetchCountryDataDirectly(countryId: number) {
    console.log("DIRECT FETCH: Fetching country data for ID:", countryId)

    try {
      // First try to get from hardcoded map as fallback
      if (countryMap[countryId]) {
        console.log("DIRECT FETCH: Found country in hardcoded map:", countryMap[countryId])
        setCountryData(countryMap[countryId])
        return
      }

      // Otherwise try to fetch from database
      const { data, error } = await supabase.from("countries").select("id, country, flag").eq("id", countryId).single()

      console.log("DIRECT FETCH: Supabase response:", { data, error })

      if (error) {
        console.error("DIRECT FETCH: Error fetching country data:", error)
        setCountryData(null)
        return
      }

      if (data) {
        console.log("DIRECT FETCH: Successfully fetched country data:", data)
        setCountryData(data)
      } else {
        console.log("DIRECT FETCH: No country data found for ID:", countryId)
        setCountryData(null)
      }
    } catch (err) {
      console.error("DIRECT FETCH: Unexpected error:", err)
      setCountryData(null)
    }
  }

  // Then modify the handleTabChange function to:
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Update URL with the new tab value without refreshing the page
    const url = new URL(window.location.href)
    url.searchParams.set("tab", value)

    // Remove the highlight parameter when changing tabs
    if (value !== "reviews" && url.searchParams.has("highlight")) {
      url.searchParams.delete("highlight")
    }

    window.history.pushState({}, "", url.toString())
  }

  // Effect to scroll to highlighted review when component mounts or when highlightReviewId changes
  useEffect(() => {
    if (highlightReviewId) {
      console.log(`Looking for review with ID: review-${highlightReviewId}`)

      // Small delay to ensure the DOM is fully rendered
      setTimeout(() => {
        const reviewElement = document.getElementById(`review-${highlightReviewId}`)
        if (reviewElement) {
          console.log(`Found review element, scrolling to it`)
          // Scroll to the review with smooth behavior
          reviewElement.scrollIntoView({ behavior: "smooth", block: "center" })

          // Add a highlight effect
          reviewElement.classList.add("highlight-review")

          // Remove the highlight effect after a few seconds
          setTimeout(() => {
            reviewElement.classList.remove("highlight-review")
          }, 3000)
        } else {
          console.warn(`Review element with ID review-${highlightReviewId} not found`)
        }
      }, 500)
    }
  }, [highlightReviewId])

  useEffect(() => {
    if (!user) {
      console.warn("🚨 No user found! Skipping fetch for liked companies.")
      setLoadingLikes(false)
      return
    }

    console.log("🟡 Fetching liked companies for user:", user.id)

    const fetchLikedFirms = async () => {
      const { data, error } = await supabase.from("user_likes").select("firm_id").eq("user_id", user.id)

      if (error) {
        console.error("❌ Error fetching liked firms:", error)
        setLoadingLikes(false)
        return
      }

      console.log("✅ Fetched liked firms:", data)

      // ✅ Ensure firm IDs are stored as numbers to match the state type
      const likedFirmIds = new Set(data.map((entry) => Number(entry.firm_id)))

      setUserLikedFirms(likedFirmIds)
      setLoadingLikes(false) // ✅ Mark loading as false
    }

    fetchLikedFirms()
  }, [user]) // ✅ Runs when user logs in or reloads

  // Fetch company-specific rules and change logs
  useEffect(() => {
    const fetchRules = async () => {
      if (!firmId) return

      setRulesLoading(true)

      // Fetch main rules for this specific prop firm
      const { data: mainRulesData, error: mainRulesError } = await supabase
        .from("prop_firm_main_rules")
        .select("id, last_updated, main_rules")
        .eq("prop_firm", firmId)
        .single()

      if (mainRulesError && mainRulesError.code !== "PGRST116") {
        console.error("Error fetching main rules:", mainRulesError)
      } else if (mainRulesData) {
        setMainRules(mainRulesData)
      }

      // Fetch change logs for this specific prop firm
      const { data: changeLogsData, error: changeLogsError } = await supabase
        .from("prop_firm_rules_change_logs")
        .select("id, last_updated, change_log")
        .eq("prop_firm", firmId)
        .order("last_updated", { ascending: false })

      if (changeLogsError) {
        console.error("Error fetching change logs:", changeLogsError)
      } else {
        setChangeLogs(changeLogsData || [])
      }

      // Fetch banned countries for this specific prop firm
      const { data: bannedCountriesData, error: bannedCountriesError } = await supabase
        .from("banned_countries")
        .select("id, last_updated, banned_countries_list")
        .eq("prop_firm", firmId)
        .single()

      if (bannedCountriesError && bannedCountriesError.code !== "PGRST116") {
        console.error("Error fetching banned countries:", bannedCountriesError)
      } else if (bannedCountriesData) {
        setBannedCountries(bannedCountriesData)
      }

      setRulesLoading(false)
    }

    fetchRules()
  }, [firmId])

  // Update likeCount when firm data changes
  useEffect(() => {
    if (firm && firm.likes !== undefined) {
      setLikeCount(firm.likes)
      console.log("Updated like count from firm data:", firm.likes)
    }
  }, [firm])

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setLiked(!liked)
  }

  const handleLikeToggle = async (firmId: number | null) => {
    if (!user || !firmId) return

    setUserLikedFirms((prevLikes) => {
      const updatedLikes = new Set(prevLikes)
      const numericFirmId = Number(firmId)
      if (updatedLikes.has(numericFirmId)) {
        updatedLikes.delete(numericFirmId)
      } else {
        updatedLikes.add(numericFirmId)
      }
      return updatedLikes
    })

    const isCurrentlyLiked = userLikedFirms.has(Number(firmId))
    const newLikeStatus = !isCurrentlyLiked

    if (newLikeStatus) {
      // 🟢 Like: Insert into `user_likes`
      const { error } = await supabase.from("user_likes").insert([{ user_id: user.id, firm_id: firmId }])
      if (error) {
        console.error("Error liking firm:", error)
        return
      }

      // 🟢 Increment likes in DB
      const { error: incrementError } = await supabase.rpc("increment_likes", { firm_id: firmId })
      if (incrementError) {
        console.error("Error incrementing likes:", incrementError)
        return
      }
    } else {
      // 🔴 Unlike: Remove from `user_likes`
      const { error } = await supabase.from("user_likes").delete().eq("user_id", user.id).eq("firm_id", firmId)
      if (error) {
        console.error("Error unliking firm:", error)
        return
      }

      // 🔴 Decrement likes in DB
      const { error: decrementError } = await supabase.rpc("decrement_likes", { firm_id: firmId })
      if (decrementError) {
        console.error("Error decrementing likes:", decrementError)
        return
      }
    }
  }

  const isLiked = !loadingLikes && userLikedFirms.has(Number(firmId))

  // Function to handle login modal opening
  const handleLoginModalOpen = () => {
    console.log("Opening login modal from PropFirmUI")
    if (setShowLoginModal) {
      setShowLoginModal(true)
    } else {
      console.error("setShowLoginModal is not available")
    }
  }

  // Render loading skeleton with shimmer effect
  const renderSkeleton = () => {
    return (
      <div className="lg:col-span-3">
        <div className="bg-[#edb900] text-[#0f0f0f] rounded-lg overflow-hidden animate-shimmer">
          {/* Header with likes */}
          <div className="flex justify-end w-full pr-3 pt-3">
            <div className="text-xs pt-2 pr-2 bg-[rgba(15,15,15,0.1)] w-16 h-6 rounded"></div>
            <div className="relative top-1 right-50 w-6 h-6 bg-[rgba(15,15,15,0.1)] rounded-full"></div>
          </div>

          {/* Firm Logo and Rating */}
          <div className="p-6 flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 bg-[rgba(255,255,255,0.1)] rounded-lg flex items-center justify-center"></div>
              <span className="absolute top-1 left-1 px-[5px] border text-xs rounded-[10px] bg-[rgba(15,15,15,0.1)] w-12 h-5"></span>
            </div>
            <div className="flex items-center mb-1">
              <span className="text-xl font-bold bg-[rgba(15,15,15,0.1)] w-32 h-8 rounded"></span>
            </div>
            <div className="flex items-center mb-2">
              <div className="text-lg mr-1 bg-[rgba(15,15,15,0.1)] w-5 h-5 rounded-full"></div>
              <span className="font-bold bg-[rgba(15,15,15,0.1)] w-10 h-6 rounded"></span>
              <span className="text-xs ml-1 bg-[rgba(15,15,15,0.1)] w-20 h-4 rounded"></span>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="px-6 pb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <div key={star} className="flex items-center justify-between mb-1 text-xs">
                <span className="bg-[rgba(15,15,15,0.1)] w-12 h-4 rounded"></span>
                <div className="h-2 w-40 bg-[rgba(15,15,15,0.1)] rounded"></div>
                <span className="bg-[rgba(15,15,15,0.1)] w-8 h-4 rounded"></span>
              </div>
            ))}
          </div>

          {/* Social Links */}
          <div className="px-6 py-4 border-t border-[#0f0f0f]/10">
            <h3 className="font-bold mb-3 bg-[rgba(15,15,15,0.1)] w-16 h-6 rounded"></h3>
            <div className="flex space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-6 h-6 bg-[rgba(15,15,15,0.1)] rounded-full"></div>
              ))}
            </div>
          </div>

          {/* Company Info */}
          <div className="grid grid-cols-2 gap-4 px-6 py-4 border-t border-[#0f0f0f]/10">
            {["CEO", "Established", "Years In Operations"].map((label, i) => (
              <div key={i}>
                <h3 className="font-bold mb-2">{label}</h3>
                <p className="text-sm bg-[rgba(15,15,15,0.1)] w-20 h-5 rounded"></p>
              </div>
            ))}
            <div>
              <h3 className="font-bold mb-2">Country</h3>
              <div className="flex items-center gap-2">
                <div className="bg-[rgba(15,15,15,0.1)] w-5 h-4 rounded"></div>
                <div className="bg-[rgba(15,15,15,0.1)] w-20 h-5 rounded"></div>
              </div>
            </div>
          </div>

          {/* Broker & Platform */}
          <div className="grid grid-cols-1 gap-4 px-6 py-4 border-t border-[#0f0f0f]/10">
            <div>
              <h3 className="font-bold mb-2">Broker</h3>
              <p className="text-sm bg-[rgba(15,15,15,0.1)] w-24 h-5 rounded"></p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Platform</h3>
              <p className="text-sm bg-[rgba(15,15,15,0.1)] w-24 h-5 rounded"></p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If we have a firm with a country ID but no country data yet, try to fetch it
  useEffect(() => {
    if (firm && firm.country && !countryData) {
      fetchCountryDataDirectly(firm.country)
    }
  }, [firm, countryData])

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <Noise isVisible={isNoiseVisible} />
      <div className="w-full border-b border-[#edb900]">
        <div className="relative container mx-auto px-4 pt-[200px] mb-[200px] z-50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar - Show skeleton when loading */}
            {loading ? (
              renderSkeleton()
            ) : (
              <div className="lg:col-span-3">
                <div className="bg-[#edb900] text-[#0f0f0f] rounded-lg overflow-hidden">
                  <div className="flex justify-end w-full pr-3 pt-3">
                    <div className="text-xs pt-2 pr-2">{likeCount} likes</div>
                    <SignedOut>
                      <button
                        onClick={() => {
                          console.log("Opening login modal from heart button")
                          handleLoginModalOpen()
                        }}
                        className="relative top-1 right-50 hover:animate-[heartbeat_1.5s_infinite_ease-in-out] z-60"
                        style={{ color: "#0f0f0f" }}
                      >
                        <FontAwesomeIcon icon={regularHeart} style={{ fontSize: "25px" }} />
                      </button>
                    </SignedOut>

                    <SignedIn>
                      <button
                        onClick={() => handleLikeToggle(firmId)}
                        className={`relative transition-all duration-200 ${
                          userLikedFirms.has(firmId)
                            ? "text-[#0f0f0f] scale-105 hover:animate-[heartbeat_1.5s_infinite_ease-in-out]"
                            : "text-[#0f0f0f] hover:text-[#0f0f0f] hover:animate-[heartbeat_1.5s_infinite_ease-in-out]"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={isLiked ? solidHeart : regularHeart}
                          className={`transition-all duration-200 text-[25px] ${
                            isLiked ? "text-[#0f0f0f] scale-105" : "text-[#0f0f0f] hover:text-[#0f0f0f]"
                          }`}
                        />
                      </button>
                    </SignedIn>
                  </div>

                  {/* Firm Logo and Rating */}
                  <div className="p-6 flex flex-col items-center">
                    <div className="relative mb-4">
                      {firm && firm.logo_url ? (
                        <div
                          className="w-24 h-24 p-5 bg-white rounded-lg flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: firm.brand_colour }}
                        >
                          <Image
                            src={firm.logo_url || "/placeholder.svg"}
                            alt={`${firm?.propfirm_name || "Company"} logo`}
                            width={96}
                            height={96}
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center">
                          <span className="text-[#0f0f0f] font-bold text-4xl">
                            {firm && firm.propfirm_name ? firm.propfirm_name?.substring(0, 2).toUpperCase() : "FP"}
                          </span>
                        </div>
                      )}

                      <Tippy
                        content={
                          <span className="font-[balboa]">
                            We use AI to categorize all the companies. You can learn more on our Evaluation process
                            page.
                          </span>
                        }
                        placement="top"
                        delay={[100, 0]}
                        className="z-50"
                        theme="custom" // Apply the custom theme
                      >
                        <span
                          className={`absolute top-1 left-1 px-[5px] border text-xs rounded-[10px] font-[balboa] 
                            ${firm?.category === "Gold" ? "text-[#efbf04] border-[#efbf04]" : ""}
                            ${firm?.category === "Platinum" ? "text-[#D9D9D9] border-[#D9D9D9]" : ""}
                            ${firm?.category === "Diamond" ? "text-[#c8bfe7] border-[#c8bfe7]" : ""}
                            ${firm?.category === "Silver" ? "text-[#c4c4c4] border-[#c4c4c4]" : ""}
                            ${firm?.category === "Copper" ? "text-[#c68346] border-[#c68346]" : ""}`}
                        >
                          {firm?.category || "Unrated"}
                        </span>
                      </Tippy>
                    </div>
                    <div className="flex items-center mb-1">
                      <span className="text-xl font-bold">
                        {firm && firm.propfirm_name ? firm.propfirm_name : "Company Name"}
                      </span>
                    </div>
                    <div className="flex items-center mb-2">
                      <FontAwesomeIcon icon={solidStar} className="text-lg mr-1 text-[#0f0f0f]" />
                      <span className="font-bold">{firm?.rating?.toFixed(2)}</span>
                      <span className="text-xs ml-1">• {firm?.reviews_count} reviews</span>
                    </div>
                  </div>

                  {/* Rating Breakdown */}
                  <div className="px-6 pb-4">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span>5-star</span>
                      <Progress value={firm?.["5_star_reviews"] || 0} className="h-2 w-40" />
                      <span>{firm?.["5_star_reviews"] || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span>4-star</span>
                      <Progress value={firm?.["4_star_reviews"] || 0} className="h-2 w-40" />
                      <span>{firm?.["4_star_reviews"] || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span>3-star</span>
                      <Progress value={firm?.["3_star_reviews"] || 0} className="h-2 w-40" />
                      <span>{firm?.["3_star_reviews"] || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span>2-star</span>
                      <Progress value={firm?.["2_star_reviews"] || 0} className="h-2 w-40" />
                      <span>{firm?.["2_star_reviews"] || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span>1-star</span>
                      <Progress value={firm?.["1_star_reviews"] || 0} className="h-2 w-40" />
                      <span>{firm?.["1_star_reviews"] || 0}%</span>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="px-6 py-4 border-t border-[#0f0f0f]/10">
                    <h3 className="font-bold mb-3">Socials</h3>
                    <div className="flex space-x-3">
                      {firm?.facebook_link && (
                        <Link href={firm.facebook_link} className="text-[#0f0f0f] hover:opacity-80">
                          <Facebook size={18} />
                        </Link>
                      )}
                      {firm?.x_link && (
                        <Link href={firm.x_link} className="text-[#0f0f0f] hover:opacity-80">
                          <RiTwitterXFill size={18} />
                        </Link>
                      )}
                      {firm?.instagram_link && (
                        <Link href={firm.instagram_link} className="text-[#0f0f0f] hover:opacity-80">
                          <Instagram size={18} />
                        </Link>
                      )}
                      {firm?.linkedin_link && (
                        <Link href={firm.linkedin_link} className="text-[#0f0f0f] hover:opacity-80">
                          <Linkedin size={18} />
                        </Link>
                      )}
                      {firm?.youtube_link && (
                        <Link href={firm.youtube_link} className="text-[#0f0f0f] hover:opacity-80">
                          <Youtube size={18} />
                        </Link>
                      )}
                      {firm?.tiktok_link && (
                        <Link href={firm.tiktok_link} className="text-[#0f0f0f] hover:opacity-80">
                          <RiTiktokLine size={18} />
                        </Link>
                      )}
                      {firm?.discord_link && (
                        <Link href={firm.discord_link} className="text-[#0f0f0f] hover:opacity-80">
                          <RiDiscordLine size={18} />
                        </Link>
                      )}
                      {!firm?.facebook_link &&
                        !firm?.x_link &&
                        !firm?.instagram_link &&
                        !firm?.linkedin_link &&
                        !firm?.youtube_link &&
                        !firm?.tiktok_link &&
                        !firm?.discord_link && (
                          <span className="text-xs text-[#0f0f0f]">No social links available</span>
                        )}
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="grid grid-cols-2 gap-4 px-6 py-4 border-t border-[#0f0f0f]/10">
                    <div>
                      <h3 className="font-bold mb-2">CEO</h3>
                      <p className="text-sm">{firm?.ceo}</p>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">Country</h3>
                      {loading ? (
                        <p className="text-sm bg-[rgba(15,15,15,0.1)] w-20 h-5 rounded"></p>
                      ) : countryData ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={countryData.flag || "/placeholder.svg"}
                            alt={`${countryData.country} flag`}
                            className="w-5 h-4 object-cover rounded-sm"
                          />
                          <p className="text-sm">{countryData.country}</p>
                        </div>
                      ) : (
                        <p className="text-sm">Unknown</p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">Established</h3>
                      <p className="text-sm">{firm?.established}</p>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">Years In Operations</h3>
                      <p className="text-sm">{firm?.years_in_operations}</p>
                    </div>
                  </div>

                  {/* Broker & Platform */}
                  <div className="grid grid-cols-1 gap-4 px-6 py-4 border-t border-[#0f0f0f]/10">
                    <div>
                      <h3 className="font-bold mb-2">Broker</h3>
                      <p className="text-sm">{firm?.broker}</p>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">Platform</h3>
                      <p className="text-sm">{firm?.platform}</p>
                    </div>
                    {firm?.platform_details && (
                      <div>
                        <p className="text-xs">{firm.platform_details}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="lg:col-span-9">
              <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
                <TabsList className="bg-[#0f0f0f] p-0 mb-6 w-full flex overflow-x-auto h-[50px]">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-[#edb900] data-[state=active]:text-[#0f0f0f] rounded-none h-[50px] flex-1 hover:text-[#826600]"
                  >
                    <ListTree className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="stats"
                    className="data-[state=active]:bg-[#edb900] data-[state=active]:text-[#0f0f0f] rounded-none h-[50px] flex-1 hover:text-[#826600]"
                  >
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Stats
                  </TabsTrigger>
                  <TabsTrigger
                    value="news"
                    className="data-[state=active]:bg-[#edb900] data-[state=active]:text-[#0f0f0f] rounded-none h-[50px] flex-1 hover:text-[#826600]"
                  >
                    <Newspaper className="w-4 h-4 mr-2" />
                    News
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="data-[state=active]:bg-[#edb900] data-[state=active]:text-[#0f0f0f] rounded-none h-[50px] flex-1 hover:text-[#826600]"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Reviews
                  </TabsTrigger>
                  <TabsTrigger
                    value="offers"
                    className="data-[state=active]:bg-[#edb900] data-[state=active]:text-[#0f0f0f] rounded-none h-[50px] flex-1 hover:text-[#826600]"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Offers
                  </TabsTrigger>
                  <TabsTrigger
                    value="challenges"
                    className="data-[state=active]:bg-[#edb900] data-[state=active]:text-[#0f0f0f] rounded-none h-[50px] flex-1 hover:text-[#826600]"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Challenges
                  </TabsTrigger>
                  <TabsTrigger
                    value="rules"
                    className="data-[state=active]:bg-[#edb900] data-[state=active]:text-[#0f0f0f] rounded-none h-[50px] flex-1 hover:text-[#826600]"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Rules
                  </TabsTrigger>
                  <TabsTrigger
                    value="discussion"
                    className="data-[state=active]:bg-[#edb900] data-[state=active]:text-[#0f0f0f] rounded-none h-[50px] flex-1 hover:text-[#826600]"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Discussion
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  <div className="bg-[#0f0f0f] rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Overview</h2>
                    <p className="text-gray-400">No data available at the moment.</p>
                  </div>
                </TabsContent>
                <TabsContent value="stats" className="mt-0">
                  <div className="bg-[#0f0f0f] rounded-lg p-6">
                    <h2 className="text-3xl text-[#edb900] font-bold mb-4">Payout Stats</h2>

                    {/* Company-specific stats section */}
                    <div className="w-full mb-12">
                      {firm && firm.propfirm_name ? (
                        <>
                          {/* Use the CompanyStatsSlider component */}
                          <CompanyStatsSlider companyName={firm.propfirm_name} />
                        </>
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-gray-400">No company-specific stats available.</p>
                        </div>
                      )}
                    </div>
                    <div className="w-full mt-8">
                      <div className="flex justify-left mx-auto">
                        <CompanyStatsTabs activeTab={statsActiveTab} onTabChange={setStatsActiveTab} />
                      </div>
                      <CompanyStatsTabContent
                        activeTab={statsActiveTab}
                        stats={null}
                        companyName={firm?.propfirm_name}
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="news">
                  <div className="bg-[#0f0f0f] rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Latest News</h2>
                    <p className="text-gray-400">No news available at the moment.</p>
                  </div>
                </TabsContent>
                <TabsContent value="reviews">
                  <div className="bg-[#0f0f0f] rounded-lg p-6">
                    <ReviewSystem
                      companyName={firm?.propfirm_name || "CHART NOMADS"}
                      companyLogo={firm?.logo_url}
                      highlightReviewId={highlightReviewId ? highlightReviewId : null}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="offers">
                  <div className="bg-[#0f0f0f] rounded-lg p-6">
                    <h2 className="text-3xl font-bold text-[#edb900] mb-6">Special Offers</h2>
                    {firmId ? (
                      <>
                        {console.log("Rendering offers component with firmId:", firmId)}
                        <Offers
                          firmId={firmId}
                          supabase={supabase}
                          hideCompanyCard={true}
                          onLoginModalOpen={handleLoginModalOpen}
                          showTabs={true}
                        />
                      </>
                    ) : (
                      <p className="text-gray-400">Unable to load offers at this time. No firm ID available.</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="challenges">
                  <div className="bg-[#0f0f0f] rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Trading Challenges</h2>
                    <p className="text-gray-400">No challenges available at the moment.</p>
                  </div>
                </TabsContent>
                <TabsContent value="rules">
                  <div className="bg-[#0f0f0f] rounded-lg p-6">
                    <h2 className="text-3xl font-bold text-[#edb900] mb-6">Trading Rules</h2>

                    {rulesLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#edb900]"></div>
                      </div>
                    ) : (
                      <>
                        {/* Rules Tabs */}
                        <div className="flex space-x-4 mb-6">
                          <button
                            onClick={() => setRulesActiveTab("main-rules")}
                            className={`px-4 py-2 rounded-[10px] border border-[rgba(237,185,0,0.1)] transition-colors ${
                              rulesActiveTab === "main-rules" ? "bg-[#EDB900] text-black" : "opacity-100"
                            } hover:border-[#EDB900] hover:opacity-80 focus:outline-none`}
                          >
                            Main Rules
                          </button>
                          <button
                            onClick={() => setRulesActiveTab("change-log")}
                            className={`px-4 py-2 rounded-[10px] border border-[rgba(237,185,0,0.1)] transition-colors ${
                              rulesActiveTab === "change-log" ? "bg-[#EDB900] text-black" : "opacity-100"
                            } hover:border-[#EDB900] hover:opacity-80 focus:outline-none`}
                          >
                            Change Log
                          </button>
                          <button
                            onClick={() => setRulesActiveTab("banned-countries")}
                            className={`px-4 py-2 rounded-[10px] border border-[rgba(237,185,0,0.1)] transition-colors ${
                              rulesActiveTab === "banned-countries" ? "bg-[#EDB900] text-black" : "opacity-100"
                            } hover:border-[#EDB900] hover:opacity-80 focus:outline-none`}
                          >
                            Banned Countries
                          </button>
                        </div>

                        {/* Main Rules Content */}
                        {rulesActiveTab === "main-rules" && (
                          <>
                            {mainRules ? (
                              <div className="rules-section">
                                <div className="flex text-xs justify-end mb-6">
                                  <span className="mr-2">Updated on:</span>
                                  <span>
                                    {new Date(mainRules.last_updated).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                                <div
                                  className="prose prose-invert max-w-none"
                                  dangerouslySetInnerHTML={{ __html: mainRules.main_rules }}
                                />
                              </div>
                            ) : (
                              <div className="text-center py-10">
                                <p className="text-gray-400">No rules available for this prop firm.</p>
                              </div>
                            )}
                          </>
                        )}

                        {/* Change Log Content */}
                        {rulesActiveTab === "change-log" && (
                          <>
                            {changeLogs.length > 0 ? (
                              <div className="space-y-8">
                                {changeLogs.map((log, index) => (
                                  <div
                                    key={index}
                                    className="rules-section border-b border-[rgba(237,185,0,0.1)] pb-8 mb-8 last:border-b-0"
                                  >
                                    <div className="flex text-xs justify-end mb-6">
                                      <span className="mr-2">Updated on:</span>
                                      <span>
                                        {new Date(log.last_updated).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        })}
                                      </span>
                                    </div>
                                    <div
                                      className="prose prose-invert max-w-none"
                                      dangerouslySetInnerHTML={{ __html: log.change_log }}
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-10">
                                <p className="text-gray-400">No change logs available for this prop firm.</p>
                              </div>
                            )}
                          </>
                        )}

                        {/* Banned Countries Content */}
                        {rulesActiveTab === "banned-countries" && (
                          <>
                            {bannedCountries ? (
                              <div className="rules-section">
                                <div className="flex text-xs justify-end mb-6">
                                  <span className="mr-2">Updated on:</span>
                                  <span>
                                    {new Date(bannedCountries.last_updated).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                                <h2 className="text-3xl mb-6">Restricted Countries List:</h2>
                                <div
                                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4"
                                  dangerouslySetInnerHTML={{ __html: bannedCountries.banned_countries_list }}
                                />
                              </div>
                            ) : (
                              <div className="text-center py-10">
                                <p className="text-gray-400">
                                  No banned countries information available for this prop firm.
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="discussion">
                  <div className="bg-[#0f0f0f] rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Discussion</h2>
                    <CommentSection type="propfirm" itemId={firmId || 0} onLoginModalOpen={handleLoginModalOpen} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <Testimonials />
      <Community />
      <Newsletter />
      <Footer />
    </div>
  )
}

export default PropFirmUI

