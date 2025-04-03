/* eslint-disable */
"use client"
import type { SupabaseClient } from "@supabase/supabase-js"
import { useState, useEffect, useContext } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { supabase } from "../../lib/supabase"
import Image from "next/image"
import { Facebook, Instagram, Linkedin, Youtube, BarChart2, DollarSign, Award, FileText, MessageSquare, ExternalLink, Newspaper, ListTree, Star, X } from 'lucide-react'
import { FaTiktok, FaDiscord } from "react-icons/fa"
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

// Define types for the firm and rating data
interface Firm {
  id: number
  propfirm_name: string
  logo_url?: string
  brand_colour?: string
  category?: string
  rating?: number
  reviews_count?: number
  likes_count?: number
  facebook_link?: string
  x_link?: string
  instagram_link?: string
  linkedin_link?: string
  youtube_link?: string
  tiktok_link?: string
  discord_link?: string
  ceo?: string
  established?: string
  country?: string
  website?: string
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
  firm: Firm | null
  ratingBreakdown?: RatingBreakdown
  formatCurrency?: (value: number, currency?: string) => string
}

function PropFirmUI({
  firm,
  ratingBreakdown,
  formatCurrency = (value: number, currency?: string) => `$${value}`,
}: PropFirmUIProps) {
  console.log("PropFirmUI received firm:", firm)

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

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(firm && firm.likes_count ? firm.likes_count : 91)
  const { user } = useUser()
  const [userLikedFirms, setUserLikedFirms] = useState(new Set())
  const [loadingLikes, setLoadingLikes] = useState(true)
  const [mainRules, setMainRules] = useState(null)
  const [changeLogs, setChangeLogs] = useState([])
  const [rulesActiveTab, setRulesActiveTab] = useState("main-rules")
  const [rulesLoading, setRulesLoading] = useState(true)
  const [bannedCountries, setBannedCountries] = useState(null)

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

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <Noise isVisible={isNoiseVisible} />
      <div className="w-full border-b border-[#edb900]">
        <div className="relative container mx-auto px-4 pt-[200px] mb-[200px] z-50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
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
                          We use AI to categorize all the companies. You can learn more on our Evaluation process page.
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
                        <X size={18} />
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
                        <FaTiktok size={18} />
                      </Link>
                    )}
                    {firm?.discord_link && (
                      <Link href={firm.discord_link} className="text-[#0f0f0f] hover:opacity-80">
                        <FaDiscord size={18} />
                      </Link>
                    )}
                    {/* Show default social icons if no links provided */}
                    {!firm?.facebook_link &&
                      !firm?.x_link &&
                      !firm?.instagram_link &&
                      !firm?.linkedin_link &&
                      !firm?.youtube_link &&
                      !firm?.tiktok_link &&
                      !firm?.discord_link && (
                        <>
                          <Link href="#" className="text-[#0f0f0f] hover:opacity-80">
                            <Facebook size={18} />
                          </Link>
                          <Link href="#" className="text-[#0f0f0f] hover:opacity-80">
                            <X size={18} />
                          </Link>
                          <Link href="#" className="text-[#0f0f0f] hover:opacity-80">
                            <Instagram size={18} />
                          </Link>
                          <Link href="#" className="text-[#0f0f0f] hover:opacity-80">
                            <Linkedin size={18} />
                          </Link>
                          <Link href="#" className="text-[#0f0f0f] hover:opacity-80">
                            <Youtube size={18} />
                          </Link>
                          <Link href="#" className="text-[#0f0f0f] hover:opacity-80">
                            <FaTiktok size={18} />
                          </Link>
                          <Link href="#" className="text-[#0f0f0f] hover:opacity-80">
                            <FaDiscord size={18} />
                          </Link>
                        </>
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
                    <p className="text-sm">{firm?.country}</p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Established</h3>
                    <p className="text-sm">{firm?.established}</p>
                  </div>
                  {firm?.website && (
                    <div>
                      <h3 className="font-bold mb-2">Website</h3>
                      <a
                        href={firm.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm flex items-center hover:underline"
                      >
                        Visit <ExternalLink size={12} className="ml-1" />
                      </a>
                    </div>
                  )}
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
