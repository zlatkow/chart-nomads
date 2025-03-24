"use client"

/* eslint-disable */

import { useState, useEffect, useContext } from "react"
import { supabase } from "../lib/supabase"
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons"
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
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
      console.error("❌ ERROR Fetching Main Rules:", mainRulesError)
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
      console.error("❌ ERROR Fetching Change Logs:", changeLogsError)
      return { props: { propFirmRules: [] } }
    }

    // Process the data to include change logs with each firm
    const processedData = {
      mainRules: mainRules || [],
      changeLogs: changeLogs || [],
    }

    return { props: { propFirmRules: processedData } }
  } catch (error) {
    console.error("🔥 UNEXPECTED ERROR in getServerSideProps:", error)
    return { props: { propFirmRules: { mainRules: [], changeLogs: [] } } }
  }
}

const PropFirmRules = ({ propFirmRules }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [userLikedFirms, setUserLikedFirms] = useState(new Set())
  const { user } = useUser()
  const [likesMap, setLikesMap] = useState({})
  const [activeTab, setActiveTab] = useState("tab1")
  const [visibleCount, setVisibleCount] = useState(10)
  const [loadingLikes, setLoadingLikes] = useState(true)

  // Use the ModalContext
  const { setShowLoginModal } = useContext(ModalContext)

  // Extract the main rules and change logs from props
  const { mainRules = [], changeLogs = [] } = propFirmRules || {}

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    setVisibleCount(10)
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
        console.error("Error fetching liked firms:", error)
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
      const isLiked = userLikedFirms.has(numericFirmId)
      newLikes[numericFirmId] = isLiked ? (newLikes[numericFirmId] || 0) - 1 : (newLikes[numericFirmId] || 0) + 1
      return newLikes
    })

    try {
      if (!userLikedFirms.has(numericFirmId)) {
        await supabase.from("user_likes").insert([{ user_id: user.id, firm_id: numericFirmId }])
        await supabase.rpc("increment_likes", { firm_id: numericFirmId })
      } else {
        await supabase.from("user_likes").delete().eq("user_id", user.id).eq("firm_id", numericFirmId)
        await supabase.rpc("decrement_likes", { firm_id: numericFirmId })
      }
    } catch (err) {
      console.error("❌ Unexpected error updating likes:", err)
    }
  }

  // Function to handle opening the login modal
  const handleLoginModalOpen = () => {
    setShowLoginModal(true)
  }

  return (
    <div className="w-full">
      <div className="min-h-screen text-white pt-[300px] container mx-auto z-50">
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
            <div className="tabs flex space-x-4 z-50">
              <button
                onClick={() => handleTabClick("tab1")}
                className={`px-2 py-1 rounded-[10px] border-[1px] border-[rgba(237,185,0,0.1)] transition-colors h-[35px] text-sm ${
                  activeTab === "tab1" ? "bg-[#EDB900] text-black" : "opacity-100"
                } hover:border-[#EDB900] hover:opacity-80 focus:outline-none`}
              >
                Main Rules
              </button>
              <button
                onClick={() => handleTabClick("tab2")}
                className={`px-2 py-1 rounded-[10px] border-[1px] border-[rgba(237,185,0,0.1)] transition-colors h-[35px] text-sm ${
                  activeTab === "tab2" ? "bg-[#EDB900] text-black" : "opacity-100"
                } hover:border-[#EDB900] hover:opacity-80 focus:outline-none`}
              >
                Change Log
              </button>
            </div>

            <div className="flex mb-3">
              <div className="flex justify-end mx-3 text-xs my-3">
                <span>Showing</span>
                <span className="mx-2 text-[#EDB900]">{totalResults}</span>
                <span>results.</span>
              </div>

              {/* ✅ Search Bar (Works for Both Tabs) */}
              <div className="relative w-[250px] justify-center z-20 mb-4">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="absolute left-3 max-w-[20px] top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search.."
                  className="searchInput pl-10 search-input p-2 bg-[#0f0f0f] text-white placeholder-gray-400 caret-white rounded-[10px] border border-gray-600 w-full md:w-[250px] z-20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ✅ Displaying Content Based on Active Tab */}
          {filteredData.length > 0 ? (
            filteredData.map((entry, index) => (
              <div
                key={index}
                className="relative flex mb-20 bg-[#0f0f0f] border-[rgba(237,185,0,0.1)] border-[1px] p-5 rounded-[10px] z-50"
              >
                {/* ✅ Firm Info Section */}
                <div className="flex w-[300px] h-[200px] shadow-lg relative bg-[rgba(255,255,255,0.03)] rounded-[10px] hover:bg-[#0f0f0f] py-7 hover:bg-gradient-to-r hover:from-[rgba(237,185,0,0.5)] hover:to-[rgba(255,255,255,0.10)] transition-transform duration-200 hover:scale-[1.03] cursor-pointer z-50">
                  <Tippy
                    content={
                      <span className="font-[balboa]">
                        We use AI to categorize all the companies. You can learn more on our Evaluation process page.
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
                        <h3 className="text-2xl text-center">{entry.prop_firms?.propfirm_name || "Unknown Company"}</h3>
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
                    <FontAwesomeIcon icon={faCalendar} className="text-md text-white-500 mr-2 max-w-[20px] mt-[1px]" />
                    <p className="font-[balboa]">
                      Updated on:{" "}
                      {new Date(entry.last_updated || new Date()).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {activeTab === "tab1" ? (
                    <div dangerouslySetInnerHTML={{ __html: entry.main_rules || "No rules available" }} />
                  ) : (
                    <div
                      className="w-full min-w-[975px] flex-grow"
                      dangerouslySetInnerHTML={{ __html: entry.change_log || "No change log available" }}
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">No results found.</p>
          )}
        </div>
        {/* Remove the direct LoginModal component */}
        {visibleCount < totalResults && (
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
      </div>
      <Community />
      <Newsletter />
      <Footer />
    </div>
  )
}

export default PropFirmRules

