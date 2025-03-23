/* eslint-disable */
"use client"
import { useState, useEffect } from "react"
import React from "react"

import Link from "next/link"
import { supabase } from "../../lib/supabase"
import Image from "next/image"
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  BarChart2,
  DollarSign,
  Award,
  FileText,
  MessageSquare,
  ExternalLink,
  Newspaper,
  ListTree,
  Check,
  Edit,
  Trash,
  X,
  Loader,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStar } from "@fortawesome/free-solid-svg-icons"
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

// Add this at the top of the file, after the imports
console.log("React version:", React.version)
console.log("Available React exports:", Object.keys(React))

function formatRelativeTime(dateString) {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now - date) / 1000)

  // Less than a minute
  if (diffInSeconds < 60) {
    return "Just now"
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    const minutes = Math.floor((diffInSeconds % 3600) / 60)
    return `${hours} ${hours === 1 ? "hour" : "hours"}${
      minutes > 0 ? ` and ${minutes} ${minutes === 1 ? "minute" : "minutes"}` : ""
    } ago`
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} ${days === 1 ? "day" : "days"} ago`
  }

  // Less than a month (30 days)
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800)
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
  }

  // More than a month, show the date
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Client component for interactive elements
function PropFirmUI({ firm, ratingBreakdown, formatCurrency }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(firm && firm.likes_count ? firm.likes_count : 91)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const { user } = useUser()
  const [userLikedFirms, setUserLikedFirms] = useState(new Set())
  const [loadingLikes, setLoadingLikes] = useState(true)
  const [mainRules, setMainRules] = useState(null)
  const [changeLogs, setChangeLogs] = useState([])
  const [rulesActiveTab, setRulesActiveTab] = useState("main-rules")
  const [rulesLoading, setRulesLoading] = useState(true)
  const [bannedCountries, setBannedCountries] = useState(null)
  const [comments, setComments] = useState([])

  // Memoize the firmId to prevent it from changing on every render
  const firmId = firm?.id || null

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

  const handleLikeToggle = async (firmId) => {
    if (!user) return

    setUserLikedFirms((prevLikes) => {
      const updatedLikes = new Set(prevLikes)
      const numericFirmId = Number(firmId) // ✅ Convert firmId to number to match state
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

  // Function to handle login modal opening (needed for Offers component)
  const handleLoginModalOpen = () => {
    setIsLoginOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <Noise />
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
                        setIsLoginOpen(true)
                      }}
                      className="relative top-1 right-50 hover:animate-[heartbeat_1.5s_infinite_ease-in-out] z-60"
                      style={{ color: "rgba(237, 185, 0, 0.3)" }}
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
                      <div className="w-24 h-24 p-5 bg-white rounded-lg flex items-center justify-center overflow-hidden">
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
                          {firm && firm.propfirm_name
                            ? firm.propfirm_name?.substring(0, 2).toUpperCase() || "FP"
                            : "FP"}
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
                    <FontAwesomeIcon icon={faStar} className="text-lg mr-1 text-[#0f0f0f]" />
                    <span className="font-bold">{firm?.rating?.toFixed(2) || "4.45"}</span>
                    <span className="text-xs ml-1">• {firm?.reviews_count || "4.5k"} reviews</span>
                  </div>
                </div>

                {/* Rating Breakdown - Static data */}
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span>5-star</span>
                    <Progress value={ratingBreakdown?.five_star || 58} className="h-2 w-40" />
                    <span>{ratingBreakdown?.five_star || 58}%</span>
                  </div>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span>4-star</span>
                    <Progress value={ratingBreakdown?.four_star || 30} className="h-2 w-40" />
                    <span>{ratingBreakdown?.four_star || 30}%</span>
                  </div>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span>3-star</span>
                    <Progress value={ratingBreakdown?.three_star || 7} className="h-2 w-40" />
                    <span>{ratingBreakdown?.three_star || 7}%</span>
                  </div>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span>2-star</span>
                    <Progress value={ratingBreakdown?.two_star || 3} className="h-2 w-40" />
                    <span>{ratingBreakdown?.two_star || 3}%</span>
                  </div>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span>1-star</span>
                    <Progress value={ratingBreakdown?.one_star || 2} className="h-2 w-40" />
                    <span>{ratingBreakdown?.one_star || 2}%</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="px-6 py-4 border-t border-[#0f0f0f]/10">
                  <h3 className="font-bold mb-3">Socials</h3>
                  <div className="flex space-x-3">
                    {firm?.social_links?.facebook && (
                      <Link href={firm.social_links.facebook} className="text-[#0f0f0f] hover:opacity-80">
                        <Facebook size={18} />
                      </Link>
                    )}
                    {firm?.social_links?.twitter && (
                      <Link href={firm.social_links.twitter} className="text-[#0f0f0f] hover:opacity-80">
                        <Twitter size={18} />
                      </Link>
                    )}
                    {firm?.social_links?.instagram && (
                      <Link href={firm.social_links.instagram} className="text-[#0f0f0f] hover:opacity-80">
                        <Instagram size={18} />
                      </Link>
                    )}
                    {firm?.social_links?.linkedin && (
                      <Link href={firm.social_links.linkedin} className="text-[#0f0f0f] hover:opacity-80">
                        <Linkedin size={18} />
                      </Link>
                    )}
                    {firm?.social_links?.youtube && (
                      <Link href={firm.social_links.youtube} className="text-[#0f0f0f] hover:opacity-80">
                        <Youtube size={18} />
                      </Link>
                    )}
                    {/* Show default social icons if none provided */}
                    {!firm?.social_links && (
                      <>
                        <Link href="#" className="text-[#0f0f0f] hover:opacity-80">
                          <Facebook size={18} />
                        </Link>
                        <Link href="#" className="text-[#0f0f0f] hover:opacity-80">
                          <Twitter size={18} />
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
                      </>
                    )}
                  </div>
                </div>

                {/* Company Info */}
                <div className="grid grid-cols-2 gap-4 px-6 py-4 border-t border-[#0f0f0f]/10">
                  <div>
                    <h3 className="font-bold mb-2">CEO</h3>
                    <p className="text-sm">{firm?.ceo || "Khaled Ayesh"}</p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Established</h3>
                    <p className="text-sm">{firm?.established || "11/2022"}</p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Country</h3>
                    <p className="text-sm">{firm?.country || "United Arab Emirates"}</p>
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
                    <p className="text-sm">{firm?.broker || "Liquidity Providers"}</p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Platform</h3>
                    <p className="text-sm">{firm?.platform || "TrustPilot"}</p>
                  </div>
                  {firm?.platform_details && (
                    <div>
                      <p className="text-xs">{firm.platform_details}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold mb-2">Rating</h3>
                    <p className="text-sm">{firm?.rating || "4.4"}</p>
                  </div>
                </div>

                {/* Instruments & Leverage */}
                <div className="grid grid-cols-2 gap-4 px-6 py-4 border-t border-[#0f0f0f]/10">
                  <div>
                    <h3 className="font-bold mb-3">Instruments</h3>
                    <ul className="text-xs space-y-1">
                      {firm.instruments ? (
                        firm.instruments.map((instrument, index) => (
                          <li key={index} className="flex items-center">
                            <span className="mr-2">•</span>
                            <span>{instrument}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-center">
                            <span className="mr-2">•</span>
                            <span>Forex</span>
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2">•</span>
                            <span>Crypto</span>
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2">•</span>
                            <span>Indices</span>
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2">•</span>
                            <span>Metals & Energies</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold mb-3">Leverage</h3>
                    <ul className="text-xs space-y-1">
                      {firm.leverage ? (
                        Object.entries(firm.leverage).map(([key, value], index) => (
                          <li key={index} className="flex items-center">
                            <span className="mr-2">•</span>
                            <span>
                              {key} - {value}
                            </span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-center">
                            <span className="mr-2">•</span>
                            <span>Forex - 1:100</span>
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2">•</span>
                            <span>Metals & Energies - 1:50</span>
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2">•</span>
                            <span>Indices - 1:30</span>
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2">•</span>
                            <span>Crypto - 1:2</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9">
              <Tabs defaultValue="overview" className="w-full">
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
                    <h2 className="text-xl font-bold mb-4">Payout Stats</h2>
                    <p className="text-gray-400">No data available at the moment.</p>
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
                    <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
                    <p className="text-gray-400">No reviews available at the moment.</p>
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
                    <h2 className="text-3xl font-bold text-[#edb900] mb-6">Community Discussion</h2>
                    <DiscussionSection firmId={firmId} />
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

function DiscussionSection({ firmId }) {
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [expandedReplies, setExpandedReplies] = useState({})

  // Add this function inside the DiscussionSection component
  const handleCommentDelete = (commentId) => {
    // Update the comments state by filtering out the deleted comment
    setComments(comments.filter((comment) => comment.id !== commentId))
  }

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }))
  }

  // Calculate vote counts and user's vote for a comment
  const getVoteInfo = (comment) => {
    // Ensure votes is always an array, even if it's null or undefined
    const votes = Array.isArray(comment.votes) ? comment.votes : []
    const upvotes = votes.filter((v) => v.vote_type === "upvote").length
    const downvotes = votes.filter((v) => v.vote_type === "downvote").length
    const userVote = user ? votes.find((v) => v.user_id === user.id)?.vote_type : null

    return {
      score: upvotes - downvotes,
      userVote,
    }
  }

  // Fetch comments for this prop firm
  useEffect(() => {
    async function fetchComments() {
      if (!firmId) return

      setIsLoading(true)
      try {
        // Fetch parent comments first
        const { data: parentComments, error: parentError } = await supabase
          .from("propfirm_comments")
          .select("*, votes:propfirm_comment_votes(*)")
          .eq("commented_on", firmId)
          .is("parent_comment_id", null)
          .order("created_at", { ascending: false })

        if (parentError) {
          console.error("Error fetching parent comments:", parentError)
          return
        }

        // Fetch replies for each parent comment
        const commentsWithReplies = await Promise.all(
          (parentComments || []).map(async (comment) => {
            const { data: replies, error: repliesError } = await supabase
              .from("propfirm_comments")
              .select("*, votes:propfirm_comment_votes(*)")
              .eq("parent_comment_id", comment.id)
              .order("created_at", { ascending: true })

            if (repliesError) {
              console.error(`Error fetching replies for comment ${comment.id}:`, repliesError)
              return { ...comment, replies: [] }
            }

            return { ...comment, replies: replies || [] }
          }),
        )

        setComments(commentsWithReplies || [])
      } catch (error) {
        console.error("Error in fetchComments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [firmId])

  const handleSubmitComment = async (e) => {
    e.preventDefault()

    if (!commentText.trim() || !user) return

    setIsSubmitting(true)

    try {
      // Store user's name and profile image URL directly in the comment
      const { data, error } = await supabase
        .from("propfirm_comments")
        .insert([
          {
            commented_on: firmId,
            author: user.id,
            comment: commentText.trim(),
            user_name: user.fullName || user.username || "User",
            user_image: user.imageUrl || "/placeholder-user.jpg",
          },
        ])
        .select()

      if (error) {
        console.error("Error posting comment:", error)
        return
      }

      // Clear the comment text
      setCommentText("")

      // Refresh comments
      const { data: refreshedComments, error: refreshError } = await supabase
        .from("propfirm_comments")
        .select("*, votes:propfirm_comment_votes(*)")
        .eq("commented_on", firmId)
        .is("parent_comment_id", null)
        .order("created_at", { ascending: false })

      if (refreshError) {
        console.error("Error refreshing comments:", refreshError)
        return
      }

      // Fetch replies for each parent comment
      const commentsWithReplies = await Promise.all(
        (refreshedComments || []).map(async (comment) => {
          const { data: replies, error: repliesError } = await supabase
            .from("propfirm_comments")
            .select("*, votes:propfirm_comment_votes(*)")
            .eq("parent_comment_id", comment.id)
            .order("created_at", { ascending: true })

          if (repliesError) {
            console.error(`Error fetching replies for comment ${comment.id}:`, repliesError)
            return { ...comment, replies: [] }
          }

          return { ...comment, replies: replies || [] }
        }),
      )

      setComments(commentsWithReplies || [])
    } catch (error) {
      console.error("Error in handleSubmitComment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (e) => {
    e.preventDefault()

    if (!replyText.trim() || !user || !replyingTo) return

    try {
      // Store user's name and profile image URL directly in the comment
      const { data, error } = await supabase
        .from("propfirm_comments")
        .insert([
          {
            commented_on: firmId,
            author: user.id,
            comment: replyText.trim(),
            user_name: user.fullName || user.username || "User",
            user_image: user.imageUrl || "/placeholder-user.jpg",
            parent_comment_id: replyingTo,
          },
        ])
        .select()

      if (error) {
        console.error("Error posting reply:", error)
        return
      }

      // Clear the reply text and close the reply form
      setReplyText("")
      setReplyingTo(null)

      // Find the parent comment and add the new reply
      const updatedComments = comments.map((comment) => {
        if (comment.id === replyingTo) {
          // Make sure replies array exists
          const replies = comment.replies || []
          return {
            ...comment,
            replies: [...replies, data[0]],
          }
        }
        return comment
      })

      setComments(updatedComments)

      // Ensure the replies for this comment are expanded
      setExpandedReplies((prev) => ({
        ...prev,
        [replyingTo]: true,
      }))
    } catch (error) {
      console.error("Error in handleSubmitReply:", error)
    }
  }

  // Add the handleVote function here
  const handleVote = async (commentId, voteType) => {
    if (!user) {
      console.warn("User not logged in.")
      return
    }

    try {
      // Check if the user has already voted on this comment
      const { data: existingVote, error: existingVoteError } = await supabase
        .from("propfirm_comment_votes")
        .select("*")
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .single()

      if (existingVoteError && existingVoteError.code !== "PGRST116") {
        console.error("Error checking existing vote:", existingVoteError)
        return
      }

      if (existingVote) {
        // User has already voted, update the vote
        const { error: updateError } = await supabase
          .from("propfirm_comment_votes")
          .update({ vote_type: voteType })
          .eq("id", existingVote.id)

        if (updateError) {
          console.error("Error updating vote:", updateError)
          return
        }

        // Optimistically update the comment in the UI
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.id === commentId) {
              const currentVotes = Array.isArray(comment.votes) ? comment.votes : []
              return {
                ...comment,
                votes: currentVotes.map((vote) => {
                  if (vote.user_id === user.id) {
                    return { ...vote, vote_type: voteType }
                  }
                  return vote
                }),
              }
            }
            return comment
          }),
        )
      } else {
        // User has not voted, create a new vote
        const { error: insertError } = await supabase
          .from("propfirm_comment_votes")
          .insert([{ comment_id: commentId, user_id: user.id, vote_type: voteType }])

        if (insertError) {
          console.error("Error inserting vote:", insertError)
          return
        }

        // Optimistically update the comment in the UI
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.id === commentId) {
              const currentVotes = Array.isArray(comment.votes) ? comment.votes : []
              return {
                ...comment,
                votes: [...currentVotes, { comment_id: commentId, user_id: user.id, vote_type: voteType }],
              }
            }
            return comment
          }),
        )
      }
    } catch (error) {
      console.error("Error in handleVote:", error)
    }
  }

  // Count total comments including replies
  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies?.length || 0)
  }, 0)

  return (
    <div className="space-y-6">
      <h3 className="text-xl text-[#edb900]">
        {totalComments} {totalComments === 1 ? "comment" : "comments"}
      </h3>

      {/* Comment form for logged-in users */}
      <SignedIn>
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <img
                src={user?.imageUrl || "/placeholder-user.jpg"}
                alt="Your profile"
                className="w-10 h-10 rounded-full"
              />
            </div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Create a new comment."
                className="w-full min-h-[100px] p-3 bg-[#0f0f0f] border border-[rgba(237,185,0,0.3)] rounded-lg text-white focus:outline-none focus:border-[#edb900]"
                required
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="px-6 py-2 bg-[#edb900] text-[#0f0f0f] font-medium rounded-md hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </SignedIn>

      {/* Login prompt for non-logged-in users */}
      <SignedOut>
        <div className="border border-[rgba(237,185,0,0.3)] rounded-lg p-6 mb-8">
          <h3 className="text-2xl font-bold text-[#edb900] text-center mb-2">Want to join the discussion?</h3>
          <p className="text-center text-white mb-6">Login or sign-up to leave a comment.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-8 py-3 bg-[#edb900] text-[#0f0f0f] font-medium rounded-md hover:brightness-110"
            >
              Login
            </button>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-8 py-3 bg-[#edb900] text-[#0f0f0f] font-medium rounded-md hover:brightness-110"
            >
              Sign-up
            </button>
          </div>
        </div>
      </SignedOut>

      {/* Reply form */}
      {replyingTo && (
        <div className="mb-6 ml-12 border-l-2 border-[rgba(237,185,0,0.3)] pl-4">
          <form onSubmit={handleSubmitReply}>
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <img
                  src={user?.imageUrl || "/placeholder-user.jpg"}
                  alt="Your profile"
                  className="w-8 h-8 rounded-full"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Replying to comment</span>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-400 hover:text-[#edb900]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full min-h-[80px] p-3 bg-[#0f0f0f] border border-[rgba(237,185,0,0.3)] rounded-lg text-white focus:outline-none focus:border-[#edb900]"
                  required
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-4 py-1.5 bg-[#edb900] text-[#0f0f0f] text-sm font-medium rounded-md hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post Reply
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#edb900]"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={handleCommentDelete}
              onReply={() => setReplyingTo(comment.id)}
              onVote={handleVote}
              getVoteInfo={getVoteInfo}
              isReplyOpen={replyingTo === comment.id}
              replies={comment.replies || []}
              showReplies={expandedReplies[comment.id]}
              toggleReplies={() => toggleReplies(comment.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#edb900] text-[#0f0f0f] rounded-lg p-6 text-center">Be the first to leave a comment.</div>
      )}
    </div>
  )
}

function CommentItem({
  comment,
  onDelete,
  onReply,
  onVote,
  getVoteInfo,
  isReplyOpen,
  replies = [],
  showReplies,
  toggleReplies,
}) {
  const { user } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [editedComment, setEditedComment] = useState(comment.comment)
  const [isDeleting, setIsDeleting] = useState(false)

  const isAuthor = user && user.id === comment.author
  const formattedTime = formatRelativeTime(comment.created_at)
  const { score, userVote } = getVoteInfo(comment)
  const hasReplies = replies.length > 0

  const handleSaveEdit = async () => {
    if (!editedComment.trim()) return

    try {
      const { error } = await supabase
        .from("propfirm_comments")
        .update({ comment: editedComment.trim() })
        .eq("id", comment.id)

      if (error) {
        console.error("Error updating comment:", error)
        return
      }

      // Update the comment locally
      comment.comment = editedComment.trim()
      setIsEditing(false)
    } catch (error) {
      console.error("Error in handleSaveEdit:", error)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const { error } = await supabase.from("propfirm_comments").delete().eq("id", comment.id)

      if (error) {
        console.error("Error deleting comment:", error)
        return
      }

      // Call the onDelete callback to update the parent component's state
      onDelete(comment.id)
    } catch (error) {
      console.error("Error in handleDelete:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="border-b border-[rgba(237,185,0,0.1)] pb-6">
      <div className="flex gap-3">
        {/* Vote buttons */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onVote(comment.id, "upvote")}
            className={`p-1 rounded-full transition-colors ${
              userVote === "upvote"
                ? "text-[#edb900] bg-[rgba(237,185,0,0.1)]"
                : "text-gray-400 hover:text-[#edb900] hover:bg-[rgba(237,185,0,0.05)]"
            }`}
          >
            <ChevronUpIcon className="h-4 w-4" />
          </button>
          <span
            className={`text-xs font-medium ${
              score > 0 ? "text-[#edb900]" : score < 0 ? "text-red-500" : "text-gray-400"
            }`}
          >
            {score}
          </span>
          <button
            onClick={() => onVote(comment.id, "downvote")}
            className={`p-1 rounded-full transition-colors ${
              userVote === "downvote"
                ? "text-red-500 bg-[rgba(239,68,68,0.1)]"
                : "text-gray-400 hover:text-red-500 hover:bg-[rgba(239,68,68,0.05)]"
            }`}
          >
            <ChevronDownIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img
                src={
                  comment.user_image || (user && user.id === comment.author ? user.imageUrl : "/placeholder-user.jpg")
                }
                alt={comment.user_name || "User"}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-medium text-white">
                  {comment.user_name ||
                    (user && user.id === comment.author ? user.fullName || user.username : "Anonymous User")}
                </div>
                <div className="text-xs text-gray-400">{formattedTime}</div>
              </div>
            </div>

            <div className="flex gap-2">
              {isAuthor && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-[#edb900] transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {isDeleting ? <Loader className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                  </button>
                </>
              )}
              {isEditing && (
                <>
                  <button onClick={handleSaveEdit} className="text-gray-400 hover:text-green-500 transition-colors">
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditedComment(comment.comment)
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="pl-[52px]">
            {isEditing ? (
              <textarea
                value={editedComment}
                onChange={(e) => setEditedComment(e.target.value)}
                className="w-full min-h-[100px] p-3 bg-[#0f0f0f] border border-[rgba(237,185,0,0.3)] rounded-lg text-white focus:outline-none focus:border-[#edb900]"
              />
            ) : (
              <p className="text-white whitespace-pre-wrap">{comment.comment}</p>
            )}

            {/* Comment actions */}
            {!isEditing && (
              <div className="mt-3 flex items-center gap-4">
                <button
                  onClick={onReply}
                  className={`text-xs flex items-center gap-1 ${
                    isReplyOpen ? "text-[#edb900]" : "text-gray-400 hover:text-[#edb900]"
                  } transition-colors`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Reply
                </button>

                {hasReplies && (
                  <button
                    onClick={toggleReplies}
                    className="text-xs flex items-center gap-1 text-gray-400 hover:text-[#edb900] transition-colors"
                  >
                    {showReplies ? (
                      <>
                        <ChevronUpIcon className="h-3.5 w-3.5" />
                        Hide replies ({replies.length})
                      </>
                    ) : (
                      <>
                        <ChevronDownIcon className="h-3.5 w-3.5" />
                        Show replies ({replies.length})
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Replies */}
            {hasReplies && showReplies && (
              <div className="mt-4 space-y-4 border-l-2 border-[rgba(237,185,0,0.15)] pl-4">
                {replies.map((reply) => (
                  <ReplyItem key={reply.id} reply={reply} onVote={onVote} getVoteInfo={getVoteInfo} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReplyItem({ reply, onVote, getVoteInfo }) {
  const { user } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [editedReply, setEditedReply] = useState(reply.comment)
  const [isDeleting, setIsDeleting] = useState(false)

  const isAuthor = user && user.id === reply.author
  const formattedTime = formatRelativeTime(reply.created_at)
  const { score, userVote } = getVoteInfo(reply)

  const handleSaveEdit = async () => {
    if (!editedReply.trim()) return

    try {
      const { error } = await supabase
        .from("propfirm_comments")
        .update({ comment: editedReply.trim() })
        .eq("id", reply.id)

      if (error) {
        console.error("Error updating reply:", error)
        return
      }

      // Update the reply locally
      reply.comment = editedReply.trim()
      setIsEditing(false)
    } catch (error) {
      console.error("Error in handleSaveEdit:", error)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const { error } = await supabase.from("propfirm_comments").delete().eq("id", reply.id)

      if (error) {
        console.error("Error deleting reply:", error)
        return
      }

      // Remove the reply from the DOM
      const replyElement = document.getElementById(`reply-${reply.id}`)
      if (replyElement) {
        replyElement.remove()
      }
    } catch (error) {
      console.error("Error in handleDelete:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div id={`reply-${reply.id}`} className="flex gap-2">
      {/* Vote buttons */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => onVote(reply.id, "upvote")}
          className={`p-1 rounded-full transition-colors ${
            userVote === "upvote"
              ? "text-[#edb900] bg-[rgba(237,185,0,0.1)]"
              : "text-gray-400 hover:text-[#edb900] hover:bg-[rgba(237,185,0,0.05)]"
          }`}
        >
          <ChevronUpIcon className="h-3 w-3" />
        </button>
        <span
          className={`text-xs font-medium ${
            score > 0 ? "text-[#edb900]" : score < 0 ? "text-red-500" : "text-gray-400"
          }`}
        >
          {score}
        </span>
        <button
          onClick={() => onVote(reply.id, "downvote")}
          className={`p-1 rounded-full transition-colors ${
            userVote === "downvote"
              ? "text-red-500 bg-[rgba(239,68,68,0.1)]"
              : "text-gray-400 hover:text-red-500 hover:bg-[rgba(239,68,68,0.05)]"
          }`}
        >
          <ChevronDownIcon className="h-3 w-3" />
        </button>
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <img
              src={reply.user_image || (user && user.id === reply.author ? user.imageUrl : "/placeholder-user.jpg")}
              alt={reply.user_name || "User"}
              className="w-6 h-6 rounded-full"
            />
            <div>
              <div className="font-medium text-white text-sm">
                {reply.user_name ||
                  (user && user.id === reply.author ? user.fullName || user.username : "Anonymous User")}
              </div>
              <div className="text-xs text-gray-400">{formattedTime}</div>
            </div>
          </div>

          <div className="flex gap-2">
            {isAuthor && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-[#edb900] transition-colors"
                >
                  <Edit className="h-3 w-3" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  {isDeleting ? <Loader className="h-3 w-3 animate-spin" /> : <Trash className="h-3 w-3" />}
                </button>
              </>
            )}
            {isEditing && (
              <>
                <button onClick={handleSaveEdit} className="text-gray-400 hover:text-green-500 transition-colors">
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditedReply(reply.comment)
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <textarea
            value={editedReply}
            onChange={(e) => setEditedReply(e.target.value)}
            className="w-full min-h-[80px] p-3 bg-[#0f0f0f] border border-[rgba(237,185,0,0.3)] rounded-lg text-white text-sm focus:outline-none focus:border-[#edb900]"
          />
        ) : (
          <p className="text-white text-sm whitespace-pre-wrap mt-2">{reply.comment}</p>
        )}
      </div>
    </div>
  )
}

function Star(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export default PropFirmUI

