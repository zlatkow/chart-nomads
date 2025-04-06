/* eslint-disable */
"use client"

import { useState, useEffect, useContext } from "react"
import { supabase } from "../lib/supabase"
import Navbar from "../components/Navbar"
import Noise from "../components/Noise"
import LatestBlogs from "../components/LatestBlogs"
import Testimonials from "../components/Testimonials"
import Community from "../components/Community"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"
import Image from "next/image"
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons"
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"
import Tippy from "@tippyjs/react"
import "tippy.js/dist/tippy.css"
import { ModalContext } from "./_app"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Update the shimmer animation CSS to match exactly what's in the blog page
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

// ✅ Fetch Blogs for Server Side Props
export async function getServerSideProps() {
  const { data, error } = await supabase.from("blogs").select("*").eq("featured", true)

  if (error) {
    return { props: { blogs: [] } }
  }

  return { props: { blogs: data } }
}

const AllPropFirms = ({ blogs }) => {
  const [propFirms, setPropFirms] = useState([])
  const [sortBy, setSortBy] = useState("name-asc")
  const [searchTerm, setSearchTerm] = useState("")
  const [timeRange, setTimeRange] = useState("All Time") // Add this line
  // Remove the local login modal state
  // const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user } = useUser()
  const [userLikedFirms, setUserLikedFirms] = useState(new Set())
  const [loadingLikes, setLoadingLikes] = useState(true)
  const [isLoading, setIsLoading] = useState(true) // Add loading state for prop firms
  const [searchQuery, setSearchQuery] = useState("")
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

      // ✅ Ensure firm IDs are stored as numbers to match the state type
      const likedFirmIds = new Set(data.map((entry) => Number(entry.firm_id)))

      setUserLikedFirms(likedFirmIds)
      setLoadingLikes(false) // ✅ Mark loading as false
    }

    fetchLikedFirms()
  }, [user]) // ✅ Runs when user logs in or reloads

  // ✅ Fetch Prop Firms Data
  useEffect(() => {
    const fetchPropFirms = async () => {
      setIsLoading(true) // Set loading to true before fetching
      const { data, error } = await supabase.from("prop_firms").select("*").eq("listing_status", "listed")

      if (error) {
        setIsLoading(false)
        return
      }

      setPropFirms(data || [])
      setIsLoading(false) // Set loading to false after fetching
    }

    fetchPropFirms()
  }, [])

  // Filter data based on time range selection
  useEffect(() => {
    if (!propFirms.length) return

    const now = new Date()
    let monthsToShow = 12 // Default to last 12 months

    if (timeRange === "All Time") {
      // No filtering needed for All Time
      return
    } else if (timeRange === "Last 6 Months") {
      monthsToShow = 6
    }

    // Calculate cutoff date
    const cutoffDate = new Date()
    cutoffDate.setMonth(now.getMonth() - monthsToShow)

    // Filter prop firms based on their creation date
    const filteredData = propFirms.filter((firm) => {
      // Assuming each firm has a created_at field
      const firmDate = new Date(firm.created_at)
      return firmDate >= cutoffDate
    })

    setPropFirms(filteredData)
  }, [timeRange])

  // ✅ Sorting Logic
  const sortPropFirms = (firms, criteria) => {
    return [...firms].sort((a, b) => {
      switch (criteria) {
        case "name-asc":
          return a.propfirm_name.localeCompare(b.propfirm_name)
        case "name-desc":
          return b.propfirm_name.localeCompare(a.propfirm_name)
        case "rating-desc":
          return b.rating - a.rating
        case "rating-asc":
          return a.rating - b.rating
        case "reviews-desc":
          return b.reviews_count - a.reviews_count
        case "reviews-asc":
          return a.reviews_count - b.reviews_count
        case "likes-desc":
          return b.likes - a.likes
        case "likes-asc":
          return a.likes - b.likes
        default:
          return firms
      }
    })
  }

  const handleLikeToggle = async (firmId) => {
    if (!user) {
      // Use the context to open the login modal
      setShowLoginModal(true)
      return
    }

    // Store the previous state to handle optimistic updates
    const wasLiked = userLikedFirms.has(Number(firmId))

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

    // ✅ Ensure UI updates correctly by modifying propFirms state
    setPropFirms((prev) =>
      prev.map((firm) =>
        firm.id === firmId ? { ...firm, likes: userLikedFirms.has(firmId) ? firm.likes - 1 : firm.likes + 1 } : firm,
      ),
    )

    const isCurrentlyLiked = userLikedFirms.has(firmId) // ❌ This is outdated!
    const newLikeStatus = !isCurrentlyLiked // ✅ Correct way to invert the state

    if (newLikeStatus) {
      // 🟢 Like: Insert into `user_likes`
      const { error } = await supabase.from("user_likes").insert([{ user_id: user.id, firm_id: firmId }])
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

      // 🟢 Increment likes in DB
      const { error: incrementError } = await supabase.rpc("increment_likes", { firm_id: firmId })
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
        description: "You&apos;ve added this company to your favorites.",
        action: (
          <div className="h-8 w-8 bg-[#edb900] rounded-full flex items-center justify-center mr-3">
            <FontAwesomeIcon icon={solidHeart} className="h-4 w-4 text-[#0f0f0f]" />
          </div>
        ),
      })
    } else {
      // 🔴 Unlike: Remove from `user_likes`
      const { error } = await supabase.from("user_likes").delete().eq("user_id", user.id).eq("firm_id", firmId)
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

      // 🔴 Decrement likes in DB
      const { error: decrementError } = await supabase.rpc("decrement_likes", { firm_id: firmId })
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
        description: "You’ve removed this company from your favorites.",
        action: (
          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
            <FontAwesomeIcon icon={regularHeart} className="h-4 w-4 text-gray-500" />
          </div>
        ),
      })
    }
  }

  // Function to handle opening the login modal
  const handleLoginModalOpen = () => {
    setShowLoginModal(true)
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setSearchTerm(e.target.value) // Update searchTerm to fix search functionality
  }

  // ✅ Filter and Sort
  const filteredPropFirms = propFirms.filter((firm) =>
    firm.propfirm_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  const sortedPropFirms = sortPropFirms(filteredPropFirms, sortBy)

  // Replace the renderSkeletonCards function with this updated version
  const renderSkeletonCards = () => {
    return Array(16)
      .fill(0)
      .map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="z-50 p-4 shadow-lg relative bg-[#1a1a1a] rounded-[10px] border border-[#2a2a2a]"
        >
          <div className="flex">
            <span className="absolute top-3 left-3 px-[5px] text-xs rounded-[10px] w-16 h-4 bg-[#222] shimmer-effect"></span>
            <span className="absolute top-3 right-3 w-6 h-6 bg-[#222] rounded-full shimmer-effect"></span>
          </div>
          <div className="flex justify-between">
            <div className="w-20 h-20 mb-2 flex items-center justify-center rounded-[10px] p-1 mt-[50px] bg-[#222] shimmer-effect"></div>
            <div className="block mt-9 min-w-[150px] justify-center">
              <div className="h-6 w-24 bg-[#222] rounded mb-2 mx-auto shimmer-effect"></div>
              <div className="h-6 w-16 bg-[#222] rounded mb-2 mx-auto shimmer-effect"></div>
              <div className="h-6 w-20 bg-[#222] rounded mx-auto shimmer-effect"></div>
              <div className="absolute top-4 right-[45px] h-4 w-16 bg-[#222] rounded shimmer-effect"></div>
            </div>
          </div>
        </div>
      ))
  }

  return (
    <div className="min-h-screen text-white pt-[300px]">
      <Navbar />
      <Noise />
      <div className="container max-w-[1280px] mx-auto z-50">
        <h1 className="text-7xl font-bold text-center z-50">ALL PROP FIRMS</h1>
        <p className="text-center mb-[150px] z-50">Select a specific company to find more information.</p>

        {/* Search & Sorting - Show either real UI or skeleton based on loading state */}
        {isLoading ? (
          /* Skeleton for search and sort UI */
          <div className="w-full flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex items-center gap-4 z-20">
              <div className="w-[300px] h-10 justify-center">
                <div className="relative h-10">
                  <div className="absolute left-2.5 top-2.5 h-4 w-4 bg-[#444] rounded shimmer-effect"></div>
                  <div className="w-full h-10 bg-[#333333] border border-[#333333] rounded-md shimmer-effect"></div>
                </div>
              </div>
              <div className="text-sm">
                <div className="h-5 w-32 bg-[#222] rounded shimmer-effect"></div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-end z-20 mt-4 md:mt-0">
              <div className="flex items-center gap-2">
                <div className="h-5 w-14 bg-[#222] rounded shimmer-effect"></div>
                <div className="w-[170px] h-10 bg-[#1A1A1A] border border-[#333333] rounded-md shimmer-effect"></div>
              </div>
            </div>
          </div>
        ) : (
          /* Actual search and sort UI */
          <div className="w-full flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex items-center gap-4 z-20">
              <div className="w-[300px] h-10 justify-center">
                <div className="relative h-10">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search by company name..."
                    className="searchDark w-full pl-8 bg-[#333333] border-[#333333] focus-visible:ring-[#edb900] h-10"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("")
                        setSearchTerm("") // Clear searchTerm as well to fix search functionality
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
              <div className="text-sm">
                <p className="text-white">
                  Showing <span className="text-[#EDB900]">{sortedPropFirms.length}</span> results.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-end z-20">
              <div className="flex items-center gap-2">
                <label className="text-sm">Sort by:</label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                  <SelectTrigger className="w-[170px] bg-[#1A1A1A] border-[#333333] text-gray-300 px-4 py-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#333333] text-white shadow-lg">
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="rating-desc">Highest Rating</SelectItem>
                    <SelectItem value="rating-asc">Lowest Rating</SelectItem>
                    <SelectItem value="reviews-desc">Most Reviews</SelectItem>
                    <SelectItem value="reviews-asc">Fewest Reviews</SelectItem>
                    <SelectItem value="likes-desc">Most Likes</SelectItem>
                    <SelectItem value="likes-asc">Fewest Likes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          /* Skeleton cards grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-[300px]">
            {renderSkeletonCards()}
          </div>
        ) : sortedPropFirms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-[300px]">
            {sortedPropFirms.map((firm) => {
              const isLiked = !loadingLikes && userLikedFirms.has(Number(firm.id))
              return (
                <div
                  key={firm.id}
                  className="z-50 p-4 shadow-lg relative bg-[rgba(255,255,255,0.03)] rounded-[10px] 
                               hover:bg-[#0f0f0f] py-7 hover:bg-gradient-to-r 
                               hover:from-[rgba(237,185,0,0.5)] hover:to-[rgba(255,255,255,0.10)] 
                               transition-transform duration-200 hover:scale-[1.03] cursor-pointer
                               border border-[#2a2a2a]"
                >
                  <div className="flex">
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
                        className={`absolute top-3 left-3 px-[5px] border text-xs rounded-[10px] font-[balboa] 
                          ${firm.category === "Gold" ? "text-[#efbf04] border-[#efbf04]" : ""}
                          ${firm.category === "Platinum" ? "text-[#D9D9D9] border-[#D9D9D9]" : ""}
                          ${firm.category === "Diamond" ? "text-[#c8bfe7] border-[#c8bfe7]" : ""}
                          ${firm.category === "Silver" ? "text-[#c4c4c4] border-[#c4c4c4]" : ""}
                          ${firm.category === "Copper" ? "text-[#c68346] border-[#c68346]" : ""}`}
                      >
                        {firm.category}
                      </span>
                    </Tippy>
                    <SignedOut>
                      <button
                        onClick={() => {
                          // Update to use the context
                          handleLoginModalOpen()
                        }}
                        className="absolute top-3 right-3 hover:animate-[heartbeat_1.5s_infinite_ease-in-out] z-60"
                        style={{ color: "rgba(237, 185, 0, 0.3)" }}
                      >
                        <FontAwesomeIcon icon={regularHeart} style={{ fontSize: "25px" }} />
                      </button>
                    </SignedOut>

                    <SignedIn>
                      <button
                        onClick={() => handleLikeToggle(firm.id)}
                        className={`absolute top-3 right-3 transition-all duration-200 ${
                          userLikedFirms.has(firm.id)
                            ? "text-[#EDB900] scale-105 hover:animate-[heartbeat_1.5s_infinite_ease-in-out]"
                            : "text-[rgba(237,185,0,0.3)] hover:text-[#EDB900] hover:animate-[heartbeat_1.5s_infinite_ease-in-out]"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={isLiked ? solidHeart : regularHeart}
                          className={`transition-all duration-200 text-[25px] ${
                            isLiked ? "text-[#EDB900] scale-105" : "text-[rgba(237,185,0,0.3)] hover:text-[#EDB900]"
                          }`}
                        />
                      </button>
                    </SignedIn>
                  </div>
                  <Link href={`/prop-firms/${firm.slug}`} passHref>
                    {/* Firm Logo & Info */}
                    <div className="flex justify-between">
                      <div
                        className="w-20 h-20 mb-2 flex items-center justify-center rounded-[10px] p-1 mt-[50px]"
                        style={{ backgroundColor: firm.brand_colour }}
                      >
                        <Image
                          src={firm.logo_url || "/placeholder.svg"}
                          alt={firm.propfirm_name}
                          width={48}
                          height={40}
                          style={{ maxHeight: "40px", width: "auto" }}
                        />
                      </div>

                      <div className="block mt-9 min-w-[150px] justify-center">
                        <h3 className="text-2xl text-center">{firm.propfirm_name}</h3>
                        <p className="text-center text-2xl text-[#EDB900]">
                          <FontAwesomeIcon icon={faStar} className="text-lg" />
                          <span className="text-white"> {firm.rating}</span>
                        </p>
                        <p className="text-center text-xs text-black bg-yellow-500 px-2 py-[5px] rounded-[8px] mt-2 min-w-[80px] w-fit mx-auto">
                          {firm.reviews_count} reviews
                        </p>
                        <p className="absolute top-4 right-[45px] text-center text-xs">{firm.likes} Likes</p>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-center">No matching prop firms found..</p>
        )}
      </div>
      <LatestBlogs blogs={blogs} />
      <Testimonials />
      <Community />
      <Newsletter />
      <Footer />
      <Toaster />
    </div>
  )
}

export default AllPropFirms

