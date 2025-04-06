"use client"

/* eslint-disable */

import { useState, useEffect, useContext } from "react"
import { supabase } from "../lib/supabase"
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons"
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import Navbar from "../components/Navbar"
import Noise from "../components/Noise"
import Link from "next/link"
import Tippy from "@tippyjs/react"
import "tippy.js/dist/tippy.css" // Default tooltip styles
import { faCalendar } from "@fortawesome/free-regular-svg-icons"
import Community from "../components/Community"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"
import MissingRuleForm from "../components/MissingRuleForm"
import Image from "next/image"
// Import the ModalContext
import { ModalContext } from "./_app"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs_blog"

export async function getServerSideProps() {
  try {
    // Fetch main rules with prop firm details
    const { data: mainRules, error: mainRulesError } = await supabase.from("prop_firm_main_rules").select(`
      id,
      last_updated,
      main_rules,
      prop_firm,
      prop_firms (
        id,
        propfirm_name,
        category,
        rating,
        logo_url,
        slug,
        brand_colour,
        reviews_count,
        likes
      )
    `)

    if (mainRulesError) {
      return { props: { propFirmRules: [] } }
    }

    // Fetch change logs
    const { data: changeLogs, error: changeLogsError } = await supabase.from("prop_firm_rules_change_logs").select(`
      id,
      last_updated,
      change_log,
      prop_firm,
      prop_firms (
        id,
        propfirm_name,
        category,
        rating,
        logo_url,
        slug,
        brand_colour,
        reviews_count,
        likes
      )
    `)

    if (changeLogsError) {
      return { props: { propFirmRules: [] } }
    }

    // Process the data to include change logs with each firm
    const processedData = {
      mainRules: mainRules || [],
      changeLogs: changeLogs || [],
    }

    return { props: { propFirmRules: processedData } }
  } catch (error) {
    return { props: { propFirmRules: { mainRules: [], changeLogs: [] } } }
  }
}

// Add shimmer animation CSS
const shimmerAnimation = `
  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }

  .shimmer-effect {
    position: relative;
    overflow: hidden;
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
      rgba(237, 185, 0, 0.1) 60%,
      rgba(34, 34, 34, 0)
    );
    animation: shimmer 2s infinite;
  }
`

const PropFirmRules = ({ propFirmRules }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [userLikedFirms, setUserLikedFirms] = useState(new Set())
  const { user } = useUser()
  const [likesMap, setLikesMap] = useState({})
  const [activeTab, setActiveTab] = useState("tab1")
  const [visibleCount, setVisibleCount] = useState(10)
  const [loadingLikes, setLoadingLikes] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Use the ModalContext
  const { setShowLoginModal } = useContext(ModalContext)

  // Extract the main rules and change logs from props
  const { mainRules = [], changeLogs = [] } = propFirmRules || {}

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

  // Set loading to false after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    setVisibleCount(10)
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setSearchTerm(e.target.value)
  }

  const searchLower = searchTerm.toLowerCase()

  // Filter and prepare data based on active tab
  const filteredData =
    activeTab === "tab1"
      ? (mainRules || [])
          .filter((item) => {
            if (!item || !item.prop_firms) return false

            // Safely access and convert strings to lowercase with fallbacks
            const name = item.prop_firms.propfirm_name ? item.prop_firms.propfirm_name.toLowerCase() : ""
            const category = item.prop_firms.category ? item.prop_firms.category.toLowerCase() : ""
            const rules = item.main_rules ? item.main_rules.toLowerCase() : ""

            return name.includes(searchLower) || category.includes(searchLower) || rules.includes(searchLower)
          })
          .sort((a, b) => {
            // Simple date comparison with null safety
            const dateA = a && a.last_updated ? new Date(a.last_updated) : new Date(0)
            const dateB = b && b.last_updated ? new Date(b.last_updated) : new Date(0)
            return dateB.getTime() - dateA.getTime()
          })
          .slice(0, visibleCount)
      : (changeLogs || [])
          .filter((item) => {
            if (!item || !item.prop_firms) return false

            // Safely access and convert strings to lowercase with fallbacks
            const name = item.prop_firms.propfirm_name ? item.prop_firms.propfirm_name.toLowerCase() : ""
            const category = item.prop_firms.category ? item.prop_firms.category.toLowerCase() : ""
            const log = item.change_log ? item.change_log.toLowerCase() : ""

            return name.includes(searchLower) || category.includes(searchLower) || log.includes(searchLower)
          })
          .sort((a, b) => {
            // Simple date comparison with null safety
            const dateA = a && a.last_updated ? new Date(a.last_updated) : new Date(0)
            const dateB = b && b.last_updated ? new Date(b.last_updated) : new Date(0)
            return dateB.getTime() - dateA.getTime()
          })
          .slice(0, visibleCount)

  // Update the totalResults calculation to be safer
  const totalResults = activeTab === "tab1" ? (mainRules || []).length : (changeLogs || []).length

  // Initialize likes map
  useEffect(() => {
    const initialLikes = {}

    // Process main rules
    mainRules.forEach((item) => {
      if (item && item.prop_firms && item.prop_firms.id) {
        initialLikes[item.prop_firms.id] = item.prop_firms.likes || 0
      }
    })

    // Process change logs
    changeLogs.forEach((item) => {
      if (item && item.prop_firms && item.prop_firms.id) {
        initialLikes[item.prop_firms.id] = item.prop_firms.likes || 0
      }
    })

    setLikesMap(initialLikes)
  }, [mainRules, changeLogs])

  // Fetch liked firms
  useEffect(() => {
    if (!user) {
      setLoadingLikes(false)
      return
    }

    const fetchLikedFirms = async () => {
      const { data, error } = await supabase.from("user_likes").select("firm_id").eq("user_id", user.id)

      if (error) {
        setLoadingLikes(false)
        return
      }

      const likedFirmIds = new Set(data.map((entry) => Number(entry.firm_id)))
      setUserLikedFirms(likedFirmIds)
      setLoadingLikes(false)
    }

    fetchLikedFirms()
  }, [user])

  // Handle like toggle
  const handleLikeToggle = async (firmId) => {
    if (!user) {
      setShowLoginModal(true)
      return
    }

    const numericFirmId = Number(firmId)
    const wasLiked = userLikedFirms.has(numericFirmId)

    // Update local state
    setUserLikedFirms((prevLikes) => {
      const updatedLikes = new Set(prevLikes)
      if (updatedLikes.has(numericFirmId)) {
        updatedLikes.delete(numericFirmId)
      } else {
        updatedLikes.add(numericFirmId)
      }
      return updatedLikes
    })

    // Update likes count in UI
    setLikesMap((prevLikes) => {
      const newLikes = { ...prevLikes }
      newLikes[numericFirmId] = wasLiked ? (newLikes[numericFirmId] || 0) - 1 : (newLikes[numericFirmId] || 0) + 1
      return newLikes
    })

    try {
      if (!wasLiked) {
        // Like the firm
        const { error } = await supabase.from("user_likes").insert([{ user_id: user.id, firm_id: numericFirmId }])
        if (error) {
          // Show error toast with icon
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to like company. Please try again.",
            action: (
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={regularHeart} className="h-4 w-4 text-red-500" />
              </div>
            ),
          })
          return
        }

        // Increment likes in DB
        const { error: incrementError } = await supabase.rpc("increment_likes", { firm_id: numericFirmId })
        if (incrementError) {
          // Show error toast with icon
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update like count. Please try again.",
            action: (
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={regularHeart} className="h-4 w-4 text-red-500" />
              </div>
            ),
          })
          return
        }

        // Show success toast with icon
        toast({
          title: "Company liked",
          description: "You've added this company to your favorites.",
          action: (
            <div className="h-8 w-8 bg-[#edb900] rounded-full flex items-center justify-center mr-3">
              <FontAwesomeIcon icon={solidHeart} className="h-4 w-4 text-[#0f0f0f]" />
            </div>
          ),
        })
      } else {
        // Unlike the firm
        const { error } = await supabase.from("user_likes").delete().eq("user_id", user.id).eq("firm_id", numericFirmId)
        if (error) {
          // Show error toast with icon
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to unlike company. Please try again.",
            action: (
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={regularHeart} className="h-4 w-4 text-red-500" />
              </div>
            ),
          })
          return
        }

        // Decrement likes in DB
        const { error: decrementError } = await supabase.rpc("decrement_likes", { firm_id: numericFirmId })
        if (decrementError) {
          // Show error toast with icon
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update like count. Please try again.",
            action: (
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={regularHeart} className="h-4 w-4 text-red-500" />
              </div>
            ),
          })
          return
        }

        // Show success toast with icon
        toast({
          title: "Company unliked",
          description: "You've removed this company from your favorites.",
          action: (
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
              <FontAwesomeIcon icon={regularHeart} className="h-4 w-4 text-gray-500" />
            </div>
          ),
        })
      }
    } catch (err) {
      // Show general error toast
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
    }
  }

  // Function to handle opening the login modal
  const handleLoginModalOpen = () => {
    setShowLoginModal(true)
  }

  // Render skeleton cards for loading state
  const renderSkeletonCards = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="relative flex mb-5 bg-[#0f0f0f] border-[rgba(237,185,0,0.1)] border-[1px] p-5 rounded-[10px] z-50"
        >
          {/* Firm info skeleton */}
          <div className="flex w-[300px] h-[200px] shadow-lg relative bg-[rgba(255,255,255,0.03)] rounded-[10px] p-7">
            {/* Category tag skeleton */}
            <div className="absolute top-3 left-3 w-16 h-4 bg-[#222] rounded-[10px] shimmer-effect"></div>

            {/* Heart icon skeleton */}
            <div className="absolute top-3 right-3 w-6 h-6 bg-[#222] rounded-full shimmer-effect"></div>

            <div className="flex w-full justify-between">
              {/* Logo skeleton */}
              <div className="w-20 h-20 mb-2 rounded-[10px] mt-[50px] shimmer-effect"></div>

              <div className="block mt-9 justify-center w-[150px]">
                {/* Company name skeleton */}
                <div className="h-6 w-full bg-[#222] rounded shimmer-effect mx-auto mb-2"></div>

                {/* Rating skeleton */}
                <div className="h-6 w-16 bg-[#222] rounded shimmer-effect mx-auto mb-2"></div>

                {/* Reviews count skeleton */}
                <div className="h-6 w-24 bg-[#222] rounded-[8px] shimmer-effect mx-auto mb-10"></div>

                {/* Likes count skeleton */}
                <div className="absolute top-4 right-[45px] w-16 h-4 bg-[#222] rounded shimmer-effect"></div>
              </div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="ml-[20px] mt-6 p-3 border-l-[1px] border-[rgba(237,185,0,0.1)] px-[100px] w-full">
            {/* Date skeleton */}
            <div className="flex justify-end mt-[-35px] mb-10 mr-[-100px]">
              <div className="w-32 h-4 bg-[#222] rounded shimmer-effect"></div>
            </div>

            {/* Content lines skeleton */}
            <div className="space-y-4">
              <div className="h-4 w-full bg-[#222] rounded shimmer-effect"></div>
              <div className="h-4 w-3/4 bg-[#222] rounded shimmer-effect"></div>
              <div className="h-4 w-5/6 bg-[#222] rounded shimmer-effect"></div>
              <div className="h-4 w-2/3 bg-[#222] rounded shimmer-effect"></div>
              <div className="h-4 w-4/5 bg-[#222] rounded shimmer-effect"></div>
            </div>
          </div>
        </div>
      ))
  }

  return (
    <div className="w-full">
      <div className="min-h-screen text-white pt-[300px] container max-w-[1280px] mx-auto z-50">
        <Navbar />
        <Noise />
        <h1 className="text-7xl font-bold text-center mb-10">Prop Firm Rules</h1>

        <p className="mb-5">
          In the prop trading industry, rules can vary significantly from one firm to another, depending on their risk
          management policies.
        </p>
        <p className="mb-5">
          While there are some well-known common rules, such as restrictions on the use of Expert Advisors (EAs),
          High-Frequency Trading (HFT), latency arbitrage, and any trading activity that exploits platform
          inefficiencies, there are also firm-specific rules that traders need to consider.
        </p>
        <p className="mb-[150px]">
          Through extensive research into the terms and conditions of all listed prop trading firms, we have identified
          some major key rules that you should be aware of before joining any of these funded programs.
        </p>

        {/* ✅ Tabs & Search Section */}
        <div className="block">
          <div className="flex justify-between">
            <Tabs
              defaultValue="tab1"
              className="w-full z-20"
              value={activeTab === "tab1" ? "tab1" : "tab2"}
              onValueChange={(value) => handleTabClick(value)}
            >
              <div className="flex flex-col z-20 md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <TabsList className="bg-[#1a1a1a] overflow-x-auto flex-wrap">
                  <TabsTrigger
                    value="tab1"
                    className="data-[state=active]:bg-[#edb900] data-[state=active]:text-[#0f0f0f] transition-colors duration-300 ease-in-out hover:text-[#edb900]"
                  >
                    Main Rules
                  </TabsTrigger>
                  <TabsTrigger
                    value="tab2"
                    className="data-[state=active]:bg-[#edb900] data-[state=active]:text-[#0f0f0f] transition-colors duration-300 ease-in-out hover:text-[#edb900]"
                  >
                    Change Log
                  </TabsTrigger>
                </TabsList>

                <div className="flex h-[35px]">
                  <div className="flex justify-end mx-3 text-xs mt-3">
                    <span>Showing</span>
                    <span className="mx-2 text-[#EDB900]">{totalResults}</span>
                    <span>results.</span>
                  </div>

                  {/* ✅ Updated Search Bar with clear button */}
                  <div className="relative w-[250px] justify-center z-20 mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      className="searchDark w-full pl-8 bg-[#0f0f0f] border-gray-600 focus-visible:ring-[#edb900] h-10"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("")
                          setSearchTerm("")
                        }}
                        className="absolute right-2.5 top-2.5 h-4 w-4 text-[#edb900] hover:text-[#edb900]/80"
                        aria-label="Clear search"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ✅ Displaying Content Based on Active Tab */}
              <TabsContent value="tab1" className="mt-0">
                {isLoading ? (
                  renderSkeletonCards()
                ) : filteredData.length > 0 ? (
                  filteredData.map((entry, index) => (
                    <div
                      key={index}
                      className="relative flex mb-5 bg-[#0f0f0f] border-[rgba(237,185,0,0.1)] border-[1px] p-5 rounded-[10px] z-50"
                    >
                      {/* ✅ Firm Info Section */}
                      <div className="flex w-[300px] h-[200px] shadow-lg relative bg-[rgba(255,255,255,0.03)] rounded-[10px] hover:bg-[#0f0f0f] py-7 hover:bg-gradient-to-r hover:from-[rgba(237,185,0,0.5)] hover:to-[rgba(255,255,255,0.10)] transition-transform duration-200 hover:scale-[1.03] cursor-pointer z-50">
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
                          theme="custom"
                        >
                          <span
                            className={`absolute top-3 left-3 px-[5px] border text-xs rounded-[10px] font-[balboa]
                            ${entry.prop_firms?.category === "Gold" ? "text-[#efbf04] border-[#efbf04]" : ""}
                            ${entry.prop_firms?.category === "Platinum" ? "text-[#D9D9D9] border-[#D9D9D9]" : ""}
                            ${entry.prop_firms?.category === "Diamond" ? "text-[#c8bfe7] border-[#c8bfe7]" : ""}
                            ${entry.prop_firms?.category === "Silver" ? "text-[#c4c4c4] border-[#c4c4c4]" : ""}
                            ${entry.prop_firms?.category === "Copper" ? "text-[#c68346] border-[#c68346]" : ""}`}
                          >
                            {entry.prop_firms?.category || "Unknown"}
                          </span>
                        </Tippy>

                        <SignedOut>
                          <button
                            onClick={handleLoginModalOpen}
                            className="absolute top-3 right-3 hover:animate-[heartbeat_1.5s_infinite_ease-in-out] z-60"
                            style={{ color: "rgba(237, 185, 0, 0.3)" }}
                          >
                            <FontAwesomeIcon icon={regularHeart} style={{ fontSize: "25px" }} />
                          </button>
                        </SignedOut>

                        <SignedIn>
                          <button
                            onClick={() => handleLikeToggle(entry.prop_firms?.id)}
                            className={`absolute top-3 right-3 transition-all duration-200 ${
                              userLikedFirms.has(Number(entry.prop_firms?.id))
                                ? "text-[#EDB900] scale-105 hover:animate-[heartbeat_1.5s_infinite_ease-in-out]"
                                : "text-[rgba(237,185,0,0.3)] hover:text-[#EDB900] hover:animate-[heartbeat_1.5s_infinite_ease-in-out]"
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={userLikedFirms.has(Number(entry.prop_firms?.id)) ? solidHeart : regularHeart}
                              className={`transition-all duration-200 text-[25px] ${
                                userLikedFirms.has(Number(entry.prop_firms?.id))
                                  ? "text-[#EDB900] scale-105"
                                  : "text-[rgba(237,185,0,0.3)] hover:text-[#EDB900]"
                              }`}
                            />
                          </button>
                        </SignedIn>

                        <Link href={`/prop-firms/${entry.prop_firms?.slug || ""}`} passHref>
                          <div className="flex w-[300px] h-[200px] justify-between px-7">
                            <div
                              className="w-20 h-20 mb-2 flex items-center justify-center rounded-[10px] p-1 mt-[50px]"
                              style={{ backgroundColor: entry.prop_firms?.brand_colour || "#000" }}
                            >
                              <Image
                                src={entry.prop_firms?.logo_url || "/default-logo.png"}
                                alt={entry.prop_firms?.propfirm_name || "Company"}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>

                            <div className="block mt-9 justify-center">
                              <h3 className="text-2xl text-center">
                                {entry.prop_firms?.propfirm_name || "Unknown Company"}
                              </h3>
                              <p className="text-center text-2xl text-[#EDB900]">
                                <FontAwesomeIcon icon={faStar} className="text-lg" />
                                <span className="text-white"> {entry.prop_firms?.rating || "N/A"}</span>
                              </p>
                              <p className="text-center text-xs text-black bg-yellow-500 px-2 py-[5px] rounded-[8px] mt-2 mb-10 min-w-[80px] w-fit mx-auto">
                                {entry.prop_firms?.reviews_count || 0} reviews
                              </p>
                              <p className="absolute top-4 right-[45px] text-center text-xs">
                                {likesMap[entry.prop_firms?.id] || 0} Likes
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>

                      {/* ✅ Content Section */}
                      <div className="rules-section rules-container ml-[20px] mt-6 p-3 border-l-[1px] border-[rgba(237,185,0,0.1)] px-[100px]">
                        <div className="flex text-xs justify-end flex-grow mt-[-35px] mb-10 mr-[-100px]">
                          <FontAwesomeIcon
                            icon={faCalendar}
                            className="text-md text-white-500 mr-2 max-w-[20px] mt-[1px]"
                          />
                          <p className="font-[balboa]">
                            Updated on:{" "}
                            {new Date(entry.last_updated || new Date()).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>

                        <div dangerouslySetInnerHTML={{ __html: entry.main_rules || "No rules available" }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center">No results found.</p>
                )}
              </TabsContent>

              <TabsContent value="tab2" className="mt-0">
                {isLoading ? (
                  renderSkeletonCards()
                ) : filteredData.length > 0 ? (
                  filteredData.map((entry, index) => (
                    <div
                      key={index}
                      className="relative flex mb-5 bg-[#0f0f0f] border-[rgba(237,185,0,0.1)] border-[1px] p-5 rounded-[10px] z-50"
                    >
                      {/* ✅ Firm Info Section */}
                      <div className="flex w-[300px] h-[200px] shadow-lg relative bg-[rgba(255,255,255,0.03)] rounded-[10px] hover:bg-[#0f0f0f] py-7 hover:bg-gradient-to-r hover:from-[rgba(237,185,0,0.5)] hover:to-[rgba(255,255,255,0.10)] transition-transform duration-200 hover:scale-[1.03] cursor-pointer z-50">
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
                          theme="custom"
                        >
                          <span
                            className={`absolute top-3 left-3 px-[5px] border text-xs rounded-[10px] font-[balboa]
                            ${entry.prop_firms?.category === "Gold" ? "text-[#efbf04] border-[#efbf04]" : ""}
                            ${entry.prop_firms?.category === "Platinum" ? "text-[#D9D9D9] border-[#D9D9D9]" : ""}
                            ${entry.prop_firms?.category === "Diamond" ? "text-[#c8bfe7] border-[#c8bfe7]" : ""}
                            ${entry.prop_firms?.category === "Silver" ? "text-[#c4c4c4] border-[#c4c4c4]" : ""}
                            ${entry.prop_firms?.category === "Copper" ? "text-[#c68346] border-[#c68346]" : ""}`}
                          >
                            {entry.prop_firms?.category || "Unknown"}
                          </span>
                        </Tippy>

                        <SignedOut>
                          <button
                            onClick={handleLoginModalOpen}
                            className="absolute top-3 right-3 hover:animate-[heartbeat_1.5s_infinite_ease-in-out] z-60"
                            style={{ color: "rgba(237, 185, 0, 0.3)" }}
                          >
                            <FontAwesomeIcon icon={regularHeart} style={{ fontSize: "25px" }} />
                          </button>
                        </SignedOut>

                        <SignedIn>
                          <button
                            onClick={() => handleLikeToggle(entry.prop_firms?.id)}
                            className={`absolute top-3 right-3 transition-all duration-200 ${
                              userLikedFirms.has(Number(entry.prop_firms?.id))
                                ? "text-[#EDB900] scale-105 hover:animate-[heartbeat_1.5s_infinite_ease-in-out]"
                                : "text-[rgba(237,185,0,0.3)] hover:text-[#EDB900] hover:animate-[heartbeat_1.5s_infinite_ease-in-out]"
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={userLikedFirms.has(Number(entry.prop_firms?.id)) ? solidHeart : regularHeart}
                              className={`transition-all duration-200 text-[25px] ${
                                userLikedFirms.has(Number(entry.prop_firms?.id))
                                  ? "text-[#EDB900] scale-105"
                                  : "text-[rgba(237,185,0,0.3)] hover:text-[#EDB900]"
                              }`}
                            />
                          </button>
                        </SignedIn>

                        <Link href={`/prop-firms/${entry.prop_firms?.slug || ""}`} passHref>
                          <div className="flex w-[300px] h-[200px] justify-between px-7">
                            <div
                              className="w-20 h-20 mb-2 flex items-center justify-center rounded-[10px] p-1 mt-[50px]"
                              style={{ backgroundColor: entry.prop_firms?.brand_colour || "#000" }}
                            >
                              <Image
                                src={entry.prop_firms?.logo_url || "/default-logo.png"}
                                alt={entry.prop_firms?.propfirm_name || "Company"}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>

                            <div className="block mt-9 justify-center">
                              <h3 className="text-2xl text-center">
                                {entry.prop_firms?.propfirm_name || "Unknown Company"}
                              </h3>
                              <p className="text-center text-2xl text-[#EDB900]">
                                <FontAwesomeIcon icon={faStar} className="text-lg" />
                                <span className="text-white"> {entry.prop_firms?.rating || "N/A"}</span>
                              </p>
                              <p className="text-center text-xs text-black bg-yellow-500 px-2 py-[5px] rounded-[8px] mt-2 mb-10 min-w-[80px] w-fit mx-auto">
                                {entry.prop_firms?.reviews_count || 0} reviews
                              </p>
                              <p className="absolute top-4 right-[45px] text-center text-xs">
                                {likesMap[entry.prop_firms?.id] || 0} Likes
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>

                      {/* ✅ Content Section */}
                      <div className="rules-section rules-container ml-[20px] mt-6 p-3 border-l-[1px] border-[rgba(237,185,0,0.1)] px-[100px]">
                        <div className="flex text-xs justify-end flex-grow mt-[-35px] mb-10 mr-[-100px]">
                          <FontAwesomeIcon
                            icon={faCalendar}
                            className="text-md text-white-500 mr-2 max-w-[20px] mt-[1px]"
                          />
                          <p className="font-[balboa]">
                            Updated on:{" "}
                            {new Date(entry.last_updated || new Date()).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>

                        <div
                          className="w-full min-w-[715px] flex-grow"
                          dangerouslySetInnerHTML={{ __html: entry.change_log || "No change log available" }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center">No results found.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
        {/* Remove the direct LoginModal component */}
        {filteredData.length > 0 && visibleCount < totalResults && (
          <div className="text-center mt-5">
            <button
              onClick={() => setVisibleCount((prev) => prev + 10)}
              className="px-4 py-2 bg-[#EDB900] text-black rounded-[10px] hover:opacity-80 transition"
            >
              Load More
            </button>
          </div>
        )}
        <MissingRuleForm />
        <Toaster />
      </div>
      <Community />
      <Newsletter />
      <Footer />
      {/* Shimmer effect styles */}
      <style jsx global>{`
        .shimmer-effect {
          position: relative;
          overflow: hidden;
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

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

export default PropFirmRules

