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
import "tippy.js/dist/tippy.css"
import { faCalendar } from "@fortawesome/free-regular-svg-icons"
import Community from "../components/Community"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"
import MissingRuleForm from "../components/IssueReportForm"
import Image from "next/image"
import { ModalContext } from "./_app"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export async function getServerSideProps() {
  try {
    const { data: bannedCountries, error } = await supabase.from("banned_countries").select(`
        id,
        last_updated,
        banned_countries_list,
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

    if (error) {
      return { props: { bannedFirms: [] } }
    }

    return { props: { bannedFirms: bannedCountries } }
  } catch (error) {
    return { props: { bannedFirms: [] } }
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
      rgba(237, 185, 0, 0.15) 60%,
      rgba(34, 34, 34, 0)
    );
    animation: shimmer 2s infinite;
  }
`

const BannedCountries = ({ bannedFirms }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [userLikedFirms, setUserLikedFirms] = useState(new Set())
  const { user } = useUser()
  const [loadingLikes, setLoadingLikes] = useState(true)
  const [likesMap, setLikesMap] = useState({})
  const [visibleCount, setVisibleCount] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Use the ModalContext
  const { setShowLoginModal } = useContext(ModalContext)

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

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setSearchTerm(e.target.value)
  }

  const searchLower = searchTerm.toLowerCase()

  const filteredFirms = bannedFirms
    .filter((firm) => {
      if (!firm || !firm.prop_firms) return false

      // Safely access and convert strings to lowercase with fallbacks
      const companyName = firm.prop_firms.propfirm_name ? firm.prop_firms.propfirm_name.toLowerCase() : ""
      const companyCategory = firm.prop_firms.category ? firm.prop_firms.category.toLowerCase() : ""
      const bannedRules = firm.banned_countries_list ? firm.banned_countries_list.toLowerCase() : ""

      return (
        companyName.includes(searchLower) || companyCategory.includes(searchLower) || bannedRules.includes(searchLower)
      )
    })
    .sort((a, b) => {
      // Safe date comparison with null safety
      const dateA = a && a.last_updated ? new Date(a.last_updated) : new Date(0)
      const dateB = b && b.last_updated ? new Date(b.last_updated) : new Date(0)
      return dateB.getTime() - dateA.getTime()
    })

  const visibleFirms = filteredFirms.length > 0 ? filteredFirms.slice(0, visibleCount) : []

  useEffect(() => {
    const initialLikes = {}

    // Safely process each firm
    bannedFirms.forEach((firm) => {
      if (firm && firm.prop_firms && firm.prop_firms.id) {
        initialLikes[firm.prop_firms.id] = firm.prop_firms.likes || 0
      }
    })

    setLikesMap(initialLikes)
  }, [bannedFirms])

  // Fetch liked firms from the user
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

  // Function to handle opening the login modal
  const handleLoginModalOpen = () => {
    setShowLoginModal(true)
  }

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

  // Render skeleton cards for loading state
  const renderSkeletonCards = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="relative flex mb-20 bg-[#0f0f0f] border-[rgba(237,185,0,0.1)] border-[1px] p-5 rounded-[10px] z-50"
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

            {/* Title skeleton */}
            <div className="h-8 w-64 bg-[#222] rounded shimmer-effect mb-6"></div>

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
      <div className="min-h-screen text-white pt-[300px] container mx-auto z-50">
        <Navbar />
        <Noise />
        <h1 className="text-7xl font-bold text-center mb-10">Banned Countries</h1>
        <p className="mb-10">
          Many companies have a list of countries they restrict access to, either because of regulations or their own
          policies. On this page, we've compiled a complete list of banned countries for each company, organized to help
          you stay informed and up to date.
        </p>
        <div className="block">
          <div className="flex justify-end">
            <div className="flex mb-3">
              <div className="flex justify-end mx-3 text-xs my-3">
                <span>Showing</span>
                <span className="mx-2 text-[#EDB900]">{filteredFirms.length}</span>
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

          {isLoading ? (
            renderSkeletonCards()
          ) : filteredFirms.length > 0 ? (
            visibleFirms.map((entry, index) => (
              <div
                key={index}
                className="relative flex mb-20 bg-[#0f0f0f] border-[rgba(237,185,0,0.1)] border-[1px] p-5 rounded-[10px] z-50"
              >
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
                        ${entry.prop_firms.category === "Gold" ? "text-[#efbf04] border-[#efbf04]" : ""}
                        ${entry.prop_firms.category === "Platinum" ? "text-[#D9D9D9] border-[#D9D9D9]" : ""}
                        ${entry.prop_firms.category === "Diamond" ? "text-[#c8bfe7] border-[#c8bfe7]" : ""}
                        ${entry.prop_firms.category === "Silver" ? "text-[#c4c4c4] border-[#c4c4c4]" : ""}
                        ${entry.prop_firms.category === "Copper" ? "text-[#c68346] border-[#c68346]" : ""}`}
                    >
                      {entry.prop_firms.category}
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
                      onClick={() => handleLikeToggle(entry.prop_firms.id)}
                      className={`absolute top-3 right-3 transition-all duration-200 ${
                        userLikedFirms.has(entry.prop_firms.id)
                          ? "text-[#EDB900] scale-105 hover:animate-[heartbeat_1.5s_infinite_ease-in-out]"
                          : "text-[rgba(237,185,0,0.3)] hover:text-[#EDB900] hover:animate-[heartbeat_1.5s_infinite_ease-in-out]"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={userLikedFirms.has(Number(entry.prop_firms.id)) ? solidHeart : regularHeart}
                        className={`transition-all duration-200 text-[25px] ${
                          userLikedFirms.has(Number(entry.prop_firms.id))
                            ? "text-[#EDB900] scale-105"
                            : "text-[rgba(237,185,0,0.3)] hover:text-[#EDB900]"
                        }`}
                      />
                    </button>
                  </SignedIn>
                  <Link href={`/prop-firms/${entry.prop_firms.slug}`} passHref>
                    <div className="flex w-[300px] h-[200px] justify-between px-7">
                      <div
                        className="w-20 h-20 mb-2 flex items-center justify-center rounded-[10px] p-1 mt-[50px]"
                        style={{ backgroundColor: entry.prop_firms.brand_colour }}
                      >
                        <Image
                          src={entry.prop_firms.logo_url || "/default-logo.png"}
                          alt={entry.prop_firms.propfirm_name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>

                      <div className="block mt-9 justify-center">
                        <h3 className="text-2xl text-center">{entry.prop_firms.propfirm_name}</h3>
                        <p className="text-center text-2xl text-[#EDB900]">
                          <FontAwesomeIcon icon={faStar} className="text-lg" />
                          <span className="text-white"> {entry.prop_firms.rating}</span>
                        </p>
                        <p className="text-center text-xs text-black bg-yellow-500 px-2 py-[5px] rounded-[8px] mt-2 mb-10 min-w-[80px] w-fit mx-auto">
                          {entry.prop_firms.reviews_count} reviews
                        </p>
                        <p className="absolute top-4 right-[45px] text-center text-xs">
                          {likesMap[entry.prop_firms.id] || 0} Likes
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="rules-section rules-container ml-[20px] mt-6 p-3 border-l-[1px] border-[rgba(237,185,0,0.1)] px-[100px]">
                  <div className="flex text-xs justify-end flex-grow mt-[-35px] mb-10 min-w-[1075px]">
                    <FontAwesomeIcon icon={faCalendar} className="text-md text-white-500 mr-2 max-w-[20px] mt-[1px]" />
                    <p className="font-[balboa]">
                      Updated on:{" "}
                      {new Date(entry.last_updated).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <h2 className="text-3xl">Restricted Countries List:</h2>
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4"
                    dangerouslySetInnerHTML={{ __html: entry.banned_countries_list }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">No results found.</p>
          )}
          {filteredFirms.length > 0 && visibleCount < filteredFirms.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setVisibleCount((prev) => prev + 10)}
                className="px-4 py-2 bg-[#EDB900] text-black rounded-[10px] hover:bg-opacity-80 transition"
              >
                Load More
              </button>
            </div>
          )}
        </div>
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

export default BannedCountries

