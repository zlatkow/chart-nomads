/* eslint-disable */
"use client"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import Tippy from "@tippyjs/react"
import "tippy.js/dist/tippy.css"
import "tippy.js/themes/light.css"
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons"
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import { faTags } from "@fortawesome/free-solid-svg-icons"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Info, ShoppingCart, Copy, Check, Calendar, Infinity, Search } from "lucide-react"
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Replace the existing shimmer animation CSS with this updated version
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

// Update the component's props definition at the top of the file to properly type the supabase client
export default function OffersComponent({
  firmId,
  discounts: externalDiscounts,
  isLoading: externalLoading,
  activeTab: initialActiveTab = "Limited Time",
  supabase,
  onLoginModalOpen = () => {},
  showOptionalBonus = true,
  customClass = "",
  hideCompanyCard = false,
  showTabs = false, // New prop to control whether to show tabs
  showSearch = false, // New prop to control whether to show search
}: {
  firmId?: number | null
  discounts?: any[]
  isLoading?: boolean
  activeTab?: string
  supabase: any
  onLoginModalOpen?: () => void
  showOptionalBonus?: boolean
  customClass?: string
  hideCompanyCard?: boolean
  showTabs?: boolean
  showSearch?: boolean
}) {
  // State for tabs, search, and filtering
  const [activeTab, setActiveTab] = useState(initialActiveTab)
  const [searchQuery, setSearchQuery] = useState("")

  // Original state from Offers component
  const [userLikedFirms, setUserLikedFirms] = useState(new Set())
  const [copiedCodes, setCopiedCodes] = useState({})
  const [groupedDiscounts, setGroupedDiscounts] = useState([])
  const [expandedGroups, setExpandedGroups] = useState({})
  const [loadingLikes, setLoadingLikes] = useState(true)
  const [likesMap, setLikesMap] = useState({})
  const [hasMounted, setHasMounted] = useState(false)
  const [discounts, setDiscounts] = useState([])
  const [filteredDiscounts, setFilteredDiscounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()
  const { toast } = useToast()

  // Use a ref to track if the component is mounted
  const isMounted = useRef(true)

  // Replace the useEffect that sets up the isMounted ref with this improved version
  useEffect(() => {
    console.log("Component mounted")
    setHasMounted(true)
    isMounted.current = true

    // Cleanup function
    return () => {
      console.log("Component unmounting")
      isMounted.current = false
    }
  }, [])

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

  // Fetch liked firms from the user
  useEffect(() => {
    const fetchLikedFirms = async () => {
      if (!user || !supabase) {
        setLoadingLikes(false)
        return
      }

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

    if (hasMounted) {
      fetchLikedFirms()
    }
  }, [user, hasMounted, supabase])

  // Fetch discounts from Supabase or use external discounts
  useEffect(() => {
    // If discounts are provided externally (from the DiscountsPage)
    if (externalDiscounts) {
      console.log("Using external discounts:", externalDiscounts.length)

      // Filter by firmId if provided
      if (firmId) {
        console.log("Filtering external discounts by firmId:", firmId)
        const filtered = externalDiscounts.filter(
          (discount) => discount.prop_firm === firmId || discount.prop_firm === Number(firmId),
        )
        console.log("Filtered discounts:", filtered.length)
        setDiscounts(filtered)
        filterDiscountsByType(filtered, activeTab, searchQuery)
      } else {
        setDiscounts(externalDiscounts)
        filterDiscountsByType(externalDiscounts, activeTab, searchQuery)
      }

      setIsLoading(externalLoading)
      return
    }

    // Otherwise, fetch discounts directly
    async function fetchDiscounts() {
      if (!supabase) {
        console.error("Supabase client not available")
        setIsLoading(false)
        return
      }

      // Only start fetching if the component is mounted
      if (!isMounted.current) {
        console.log("Component not mounted, skipping fetch")
        return
      }

      setIsLoading(true)
      console.log("Starting to fetch discounts with:", {
        firmId,
        supabaseAvailable: !!supabase,
        isMounted: isMounted.current,
      })

      try {
        console.log("Fetching discounts directly with firmId:", firmId)

        let query = supabase
          .from("propfirm_discounts")
          .select(
            "*, prop_firms(id, propfirm_name, slug, logo_url, brand_colour, rating, reviews_count, likes, category)",
          )

        // Filter by firmId if provided
        if (firmId) {
          query = query.eq("prop_firm", firmId)
        }
        console.log("Query prepared with firmId:", firmId)

        const { data, error } = await query.order("created_at", { ascending: false })
        console.log("Raw data from Supabase:", {
          dataLength: data?.length,
          error,
          isMountedAfterFetch: isMounted.current,
        })

        if (error) {
          console.error("Error fetching discounts:", error)
          if (isMounted.current) setIsLoading(false)
          return
        }

        // Check if component is still mounted before updating state
        if (isMounted.current) {
          // Transform the data to include the prop firm details
          const transformedData = data.map((discount) => {
            return {
              ...discount,
              prop_firm: discount.prop_firms ? discount.prop_firms.id : null,
              propfirm_name: discount.prop_firms ? discount.prop_firms.propfirm_name : null,
              slug: discount.prop_firms ? discount.prop_firms.slug : null,
              logo_url: discount.prop_firms ? discount.prop_firms.logo_url : null,
              brand_colour: discount.prop_firms ? discount.prop_firms.brand_colour : null,
              rating: discount.prop_firms ? discount.prop_firms.rating : null,
              reviews_count: discount.prop_firms ? discount.prop_firms.reviews_count : null,
              likes: discount.prop_firms ? discount.prop_firms.likes : null,
              category: discount.prop_firms ? discount.prop_firms.category : discount.discount_type,
            }
          })

          // Filter out expired discounts
          const currentDate = new Date()
          currentDate.setHours(0, 0, 0, 0)
          const filteredData = transformedData.filter((discount) => {
            if (!discount.expiry_date) return true
            const expiryDate = new Date(discount.expiry_date)
            expiryDate.setHours(0, 0, 0, 0)
            return expiryDate >= currentDate
          })

          console.log("Processed discounts:", filteredData.length)
          setDiscounts(filteredData || [])
          filterDiscountsByType(filteredData || [], activeTab, searchQuery)
          setIsLoading(false)
        } else {
          console.log("Component unmounted during fetch, not updating state")
        }
      } catch (err) {
        console.error("Unexpected error fetching discounts:", err)
        if (isMounted.current) {
          setIsLoading(false)
        }
      }
    }

    fetchDiscounts()
  }, [firmId, externalDiscounts, externalLoading, supabase, activeTab])

  // Filter discounts based on active tab and search query
  const filterDiscountsByType = (discountsData, type, query = "") => {
    let filtered = []

    if (type === "Limited Time") {
      // For Limited Time tab, show only Limited Time discounts (with cashback if available)
      filtered = discountsData.filter(
        (discount) =>
          discount.discount_type === "Limited Time" &&
          (query === "" ||
            (discount.propfirm_name && discount.propfirm_name.toLowerCase().includes(query.toLowerCase()))),
      )
    } else if (type === "Exclusive") {
      // For Exclusive tab, show only Exclusive discounts
      filtered = discountsData.filter(
        (discount) =>
          discount.discount_type === "Exclusive" &&
          (query === "" ||
            (discount.propfirm_name && discount.propfirm_name.toLowerCase().includes(query.toLowerCase()))),
      )
    } else if (type === "Review & earn") {
      // For Review & earn tab, also show Exclusive discounts (same data as Exclusive tab)
      filtered = discountsData.filter(
        (discount) =>
          discount.discount_type === "Exclusive" &&
          (query === "" ||
            (discount.propfirm_name && discount.propfirm_name.toLowerCase().includes(query.toLowerCase()))),
      )
    }

    setFilteredDiscounts(filtered)
  }

  // Handle search query changes
  useEffect(() => {
    filterDiscountsByType(discounts, activeTab, searchQuery)
  }, [searchQuery, discounts, activeTab])

  // Initialize likesMap when discounts change
  useEffect(() => {
    if (discounts && discounts.length > 0) {
      const initialLikesMap = {}
      discounts.forEach((discount) => {
        if (discount.prop_firm && discount.likes) {
          initialLikesMap[discount.prop_firm] = discount.likes
        }
      })
      setLikesMap(initialLikesMap)
    }
  }, [discounts])

  // Group discounts by company
  useEffect(() => {
    if (filteredDiscounts && filteredDiscounts.length > 0) {
      // Create a map to group discounts by company
      const groupMap = {}

      filteredDiscounts.forEach((discount) => {
        const key = `${discount.prop_firm || discount.propfirm_name}`

        if (!groupMap[key]) {
          groupMap[key] = []
        }

        groupMap[key].push(discount)
      })

      // Convert the map to an array of groups
      const groups = Object.values(groupMap).map((group: any[]) => {
        // Sort by expiry date (if available) - show soonest expiring first
        return group.sort((a: any, b: any) => {
          if (!a.expiry_date) return 1
          if (!b.expiry_date) return -1
          return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
        })
      })

      // Filter out groups with only one discount
      const multiDiscountGroups = groups.filter((group) => group.length > 1)
      const singleDiscountGroups = groups.filter((group) => group.length === 1)

      // Combine them with multi-discount groups first
      setGroupedDiscounts((multiDiscountGroups || []).concat(singleDiscountGroups || []))
    } else {
      setGroupedDiscounts([])
    }
  }, [filteredDiscounts])

  // Toggle expanded state for a group
  const toggleGroupExpanded = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  const handleLikeToggle = async (firmId) => {
    if (!user || !supabase) {
      onLoginModalOpen()
      return
    }

    const numericFirmId = Number(firmId)

    // Check if the firm is already liked
    const isCurrentlyLiked = userLikedFirms.has(numericFirmId)

    // Update userLikedFirms state
    setUserLikedFirms((prevLikes) => {
      const updatedLikes = new Set(prevLikes)
      if (isCurrentlyLiked) {
        updatedLikes.delete(numericFirmId)
      } else {
        updatedLikes.add(numericFirmId)
      }
      return updatedLikes
    })

    // Update likesMap state for immediate UI update
    setLikesMap((prevLikes) => {
      const newLikes = { ...prevLikes }
      // If currently liked, we'll decrement; if not liked, we'll increment
      newLikes[numericFirmId] = (prevLikes[numericFirmId] || 0) + (isCurrentlyLiked ? -1 : 1)
      return newLikes
    })

    try {
      if (!isCurrentlyLiked) {
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
      console.error("❌ Unexpected error updating likes:", err)

      // Revert the UI changes if the database update fails
      setUserLikedFirms((prevLikes) => {
        const updatedLikes = new Set(prevLikes)
        if (isCurrentlyLiked) {
          updatedLikes.add(numericFirmId)
        } else {
          updatedLikes.delete(numericFirmId)
        }
        return updatedLikes
      })

      setLikesMap((prevLikes) => {
        const newLikes = { ...prevLikes }
        newLikes[numericFirmId] = (prevLikes[numericFirmId] || 0) + (isCurrentlyLiked ? 1 : -1)
        return newLikes
      })

      // Show error toast with icon
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        action: (
          <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <FontAwesomeIcon icon={regularHeart} className="h-4 w-4 text-red-500" />
          </div>
        ),
      })
    }
  }

  // Update the handleCopyCode function to use a unique identifier for each discount
  const handleCopyCode = (code, discountId) => {
    navigator.clipboard.writeText(code)
    setCopiedCodes((prev) => ({ ...prev, [`${code}-${discountId}`]: true }))

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      if (isMounted.current) {
        setCopiedCodes((prev) => ({ ...prev, [`${code}-${discountId}`]: false }))
      }
    }, 2000)
  }

  // Handle tab click
  const handleTabClick = (tabType) => {
    setActiveTab(tabType)
  }

  // Update the main grid layout to adjust columns when hideCompanyCard is true
  return (
    <div className={`space-y-8 mb-12 ${customClass}`}>
      {/* Tabs and Search - Only show if showTabs or showSearch is true */}
      {(showTabs || showSearch) && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          {showTabs && (
            <div className="flex bg-[#0f0f0f] rounded-md overflow-hidden">
              <button
                role="tab"
                className={`px-6 py-3 font-medium flex items-center gap-2 transition-all ${
                  activeTab === "Limited Time"
                    ? "bg-[#edb900] text-black"
                    : "bg-transparent text-white hover:text-[#826600]"
                }`}
                onClick={() => handleTabClick("Limited Time")}
              >
                Limited Time Offers
              </button>
              <button
                role="tab"
                className={`px-6 py-3 font-medium flex items-center gap-2 transition-colors ${
                  activeTab === "Exclusive"
                    ? "bg-[#edb900] text-black"
                    : "bg-transparent text-white hover:text-[#826600]"
                }`}
                onClick={() => handleTabClick("Exclusive")}
              >
                Exclusive offers
              </button>
              <button
                role="tab"
                className={`px-6 py-3 font-medium flex items-center gap-2 transition-colors ${
                  activeTab === "Review & earn"
                    ? "bg-[#edb900] text-black"
                    : "bg-transparent text-white hover:text-[#826600]"
                }`}
                onClick={() => handleTabClick("Review & earn")}
              >
                Review & earn offers
              </button>
            </div>
          )}

          {showSearch && (
            <div className="flex items-center gap-4">
              <span className="text-xs text-white">
                Showing <span className="text-[#edb900]">{filteredDiscounts.length}</span> results.
              </span>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search..."
                  className="searchDark bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 w-64 pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-[#edb900] hover:text-[#edb900]/80"
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
          )}
        </div>
      )}

      {/* Offers Display */}
      {isLoading ? (
        // Skeleton loading UI - show 3 rows of skeleton cards
        <div className="space-y-6">
          {/* Skeleton for tabs and search if they're shown */}
          {(showTabs || showSearch) && (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              {showTabs && (
                <div className="flex bg-[#222] rounded-md overflow-hidden h-12 w-[450px] shimmer-effect"></div>
              )}
              {showSearch && (
                <div className="flex items-center gap-4">
                  <div className="w-64 h-10 bg-[#222] rounded-md shimmer-effect"></div>
                </div>
              )}
            </div>
          )}

          {/* Skeleton cards - 3 rows */}
          {Array(3)
            .fill(0)
            .map((_, rowIndex) => (
              <div
                key={`skeleton-row-${rowIndex}`}
                className="bg-[#0f0f0f] border border-[rgba(237,185,0,0.15)] rounded-lg p-4"
              >
                <div
                  className={`grid grid-cols-1 ${hideCompanyCard ? "md:grid-cols-3" : "md:grid-cols-4"} gap-4 items-center`}
                >
                  {/* Company card skeleton - only if not hidden */}
                  {!hideCompanyCard && (
                    <div className="flex justify-start items-center">
                      <div className="flex w-[300px] h-[200px] shadow-lg relative bg-[rgba(255,255,255,0.03)] rounded-[10px] overflow-hidden">
                        <div className="absolute top-3 left-3 w-16 h-5 bg-[#222] rounded-[10px] shimmer-effect"></div>
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#222] shimmer-effect"></div>

                        <div className="flex w-full h-full justify-between px-7">
                          <div className="w-20 h-20 mb-2 flex items-center justify-center rounded-[10px] bg-[#222] mt-[50px] shimmer-effect"></div>

                          <div className="block mt-9 justify-center w-32">
                            <div className="h-8 bg-[#222] rounded mb-2 mx-auto shimmer-effect"></div>
                            <div className="h-6 bg-[#222] rounded mb-2 w-16 mx-auto shimmer-effect"></div>
                            <div className="h-6 bg-[#222] rounded mb-2 w-20 mx-auto shimmer-effect"></div>
                            <div className="absolute top-4 right-[45px] w-12 h-4 bg-[#222] rounded shimmer-effect"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Discount Description skeleton */}
                  <div className="text-center">
                    <div className="relative p-3 rounded-lg border border-[rgba(237,185,0,0.15)] h-[150px]">
                      <div className="h-12 bg-[#222] rounded-md mb-3 w-3/4 mx-auto shimmer-effect"></div>
                      <div className="h-4 bg-[#222] rounded w-full mb-2 shimmer-effect"></div>
                      <div className="h-4 bg-[#222] rounded w-2/3 mx-auto shimmer-effect"></div>
                      <div className="mt-4 w-full border-t border-[rgba(237,185,0,0.1)] pt-2">
                        <div className="h-6 bg-[#222] rounded w-1/2 mx-auto shimmer-effect"></div>
                      </div>
                    </div>
                  </div>

                  {/* Code skeleton */}
                  <div className="flex justify-center">
                    <div className="relative min-w-[150px] w-auto">
                      <div className="relative w-full bg-[#222] text-black font-medium rounded-md py-3 px-4 shadow-md h-12 shimmer-effect"></div>
                      <div className="h-4 bg-[#222] rounded w-24 mx-auto mt-2 shimmer-effect"></div>
                    </div>
                  </div>

                  {/* Buy button skeleton */}
                  <div className="flex justify-center">
                    <div className="bg-[#222] rounded-md min-w-[120px] min-h-[45px] w-16 h-12 shimmer-effect"></div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : groupedDiscounts.length === 0 ? (
        <div className="text-center py-8">No discounts found for this company.</div>
      ) : (
        // Rest of the existing code for displaying actual discounts
        groupedDiscounts.map((group, groupIndex) => {
          // Get the first discount in the group to display as the main one
          const mainDiscount = group[0]
          const hasMultipleDiscounts = group.length > 1
          const groupId = `group-${groupIndex}`
          const isExpanded = expandedGroups[groupId] || false

          // Get the current like count from likesMap or fall back to the original count
          const currentLikeCount = mainDiscount.prop_firm
            ? likesMap[mainDiscount.prop_firm] !== undefined
              ? likesMap[mainDiscount.prop_firm]
              : mainDiscount.likes
            : mainDiscount.likes || 0

          return (
            <div
              key={groupId}
              className={`bg-[#0f0f0f] border border-[rgba(237,185,0,0.3)] rounded-lg overflow-hidden discount-card ${isExpanded ? "expanded" : ""}`}
            >
              {/* Main discount row - adjust grid columns based on hideCompanyCard */}
              <div
                className={`grid grid-cols-1 ${hideCompanyCard ? "md:grid-cols-3" : "md:grid-cols-4"} gap-4 p-4 items-center`}
              >
                {/* Company - Only show if hideCompanyCard is false */}
                {!hideCompanyCard && mainDiscount.prop_firm ? (
                  <div className="flex justify-start items-center">
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
                      ${mainDiscount.category === "Gold" ? "text-[#efbf04] border-[#efbf04]" : ""}
                      ${mainDiscount.category === "Platinum" ? "text-[#D9D9D9] border-[#D9D9D9]" : ""}
                      ${mainDiscount.category === "Diamond" ? "text-[#c8bfe7] border-[#c8bfe7]" : ""}
                      ${mainDiscount.category === "Silver" ? "text-[#c4c4c4] border-[#c4c4c4]" : ""}
                      ${mainDiscount.category === "Copper" ? "text-[#c68346] border-[#c68346]" : ""}
                      ${mainDiscount.category === "Exclusive" ? "text-[#edb900] border-[#edb900]" : ""}`}
                        >
                          {mainDiscount.category}
                        </span>
                      </Tippy>

                      <SignedOut>
                        <button
                          onClick={onLoginModalOpen}
                          className="absolute top-3 right-3 hover:animate-[heartbeat_1.5s_infinite_ease-in-out] z-60"
                          style={{ color: "rgba(237, 185, 0, 0.3)" }}
                        >
                          <FontAwesomeIcon icon={regularHeart} style={{ fontSize: "25px" }} />
                        </button>
                      </SignedOut>

                      <SignedIn>
                        <button
                          onClick={() => handleLikeToggle(mainDiscount.prop_firm)}
                          className={`absolute top-3 right-3 transition-all duration-200 ${
                            userLikedFirms.has(Number(mainDiscount.prop_firm))
                              ? "text-[#EDB900] scale-105 hover:animate-[heartbeat_1.5s_infinite_ease-in-out]"
                              : "text-[rgba(237,185,0,0.3)] hover:text-[#EDB900] hover:animate-[heartbeat_1.5s_infinite_ease-in-out]"
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={userLikedFirms.has(Number(mainDiscount.prop_firm)) ? solidHeart : regularHeart}
                            className={`transition-all duration-200 text-[25px] ${
                              userLikedFirms.has(Number(mainDiscount.prop_firm))
                                ? "text-[#EDB900] scale-105"
                                : "text-[rgba(237,185,0,0.3)] hover:text-[#EDB900]"
                            }`}
                          />
                        </button>
                      </SignedIn>

                      <Link href={`/prop-firms/${mainDiscount.slug}`} passHref>
                        <div className="flex w-[300px] h-[200px] justify-between px-7">
                          <div
                            className="w-20 h-20 mb-2 flex items-center justify-center rounded-[10px] p-1 mt-[50px]"
                            style={{ backgroundColor: mainDiscount.brand_colour || "#38BDF8" }}
                          >
                            <Image
                              src={mainDiscount.logo_url || "/default-logo.png"}
                              alt={mainDiscount.propfirm_name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>

                          <div className="block mt-9 justify-center">
                            <h3 className="text-2xl text-center">{mainDiscount.propfirm_name}</h3>
                            <p className="text-center text-2xl text-[#EDB900]">
                              <FontAwesomeIcon icon={faStar} className="text-lg" />
                              <span className="text-white"> {mainDiscount.rating || "4.5"}</span>
                            </p>
                            <p className="text-center text-xs text-black bg-[#edb900] px-2 py-[5px] rounded-[8px] mt-2 mb-10 min-w-[80px] w-fit mx-auto">
                              {mainDiscount.reviews_count || 0} reviews
                            </p>
                            <p className="absolute top-4 right-[45px] text-center text-xs">{currentLikeCount} Likes</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                ) : !hideCompanyCard ? (
                  <div className="flex flex-col items-start text-left">
                    <div className="h-16 w-16 bg-black rounded-lg flex items-center justify-center overflow-hidden mb-2">
                      <Image
                        src={mainDiscount.logo_url || "/placeholder.svg"}
                        alt={mainDiscount.propfirm_name || mainDiscount.discount_code}
                        width={48}
                        height={48}
                      />
                    </div>
                    <div className="font-medium">{mainDiscount.propfirm_name || mainDiscount.discount_code}</div>
                  </div>
                ) : null}

                {/* Adjust the grid columns based on whether the company card is hidden */}
                <div className={`text-center ${hideCompanyCard ? "md:col-span-1" : ""}`}>
                  <div className="relative p-3 to-transparent rounded-lg border border-[rgba(237,185,0,0.15)]">
                    {/* Extract and emphasize percentage + "OFF" if it exists */}
                    {mainDiscount.description && mainDiscount.description.match(/\d+%\s*(?:OFF|off)?/) ? (
                      <div className="flex flex-col items-center">
                        {/* Main percentage + OFF - large and bold */}
                        <div className="text-5xl font-extrabold text-[#edb900] mb-1 leading-tight">
                          {mainDiscount.description.match(/\d+%\s*(?:OFF|off)?/)[0].toUpperCase()}
                        </div>

                        {/* Secondary text - the rest of the description */}
                        <div className="text-sm text-gray-300 mb-2">
                          {mainDiscount.description.replace(/\d+%\s*(?:OFF|off)?/, "").trim()}
                        </div>

                        {/* Optional bonus at the bottom with small font */}
                        {showOptionalBonus &&
                          mainDiscount.cashback_bonus &&
                          (activeTab === "Review & earn" || activeTab === "Limited Time") && (
                            <Tippy content={bonusTooltipContent} theme="custom" placement="top" arrow={true}>
                              <div className="mt-2 w-full border-t border-[rgba(237,185,0,0.2)] pt-2 bg-gradient-to-b from-[rgba(237,185,0,0.1)] rounded-md relative">
                                <div className="absolute top-1 right-1">
                                  <Info className="h-4 w-4 text-[#edb900] cursor-pointer" />
                                </div>
                                <div className="text-xs text-gray-400 pt-1">
                                  Optional cashback:
                                  <div className="flex items-center justify-center gap-1 text-[#edb900] text-sm font-medium mt-1">
                                    {mainDiscount.cashback_bonus}
                                  </div>
                                </div>
                              </div>
                            </Tippy>
                          )}
                      </div>
                    ) : (
                      // If no percentage is found, display the description normally with optional bonus below
                      <div className="flex flex-col items-center">
                        <div className="text-white mb-2 ">{mainDiscount.description}</div>
                        {/* Optional bonus at the bottom with small font */}
                        {showOptionalBonus &&
                          mainDiscount.cashback_bonus &&
                          (activeTab === "Review & earn" || activeTab === "Limited Time") && (
                            <Tippy content={bonusTooltipContent} theme="custom" placement="top" arrow={true}>
                              <div className="mt-2 w-full border-t border-[rgba(237,185,0,0.2)] pt-2 bg-gradient-to-b from-[rgba(237,185,0,0.1)] rounded-md relative">
                                <div className="absolute top-1 right-1">
                                  <Info className="h-4 w-4 text-[#edb900] cursor-pointer" />
                                </div>
                                <div className="text-xs text-gray-400 pt-1">
                                  Optional cashback:
                                  <div className="flex items-center justify-center gap-1 text-[#edb900] text-sm font-medium mt-1">
                                    {mainDiscount.cashback_bonus}
                                  </div>
                                </div>
                              </div>
                            </Tippy>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Code */}
                <div className="flex justify-center">
                  {mainDiscount.no_code ? (
                    <div className="relative min-w-[150px] w-auto">
                      {" "}
                      <Tippy content={noCodeTooltipContent} theme="custom" placement="top" arrow={true}>
                        <div className="relative w-full bg-[#edb900] text-black font-medium rounded-md py-3 px-4 shadow-md text-center">
                          No code needed, proceed to checkout
                          <div className="absolute top-2 right-2">
                            <Info className="h-4 w-4 text-[#0f0f0f] cursor-pointer" />
                          </div>
                        </div>
                      </Tippy>
                    </div>
                  ) : (
                    <div className="relative min-w-[150px] w-auto">
                      <div className="flex items-center gap-2">
                        {/* Update the button in the main discount section */}
                        <button
                          className={`relative w-full bg-[#edb900] text-black font-medium rounded-md py-3 px-4 transition-all duration-300 shadow-md hover:shadow-lg ${
                            copiedCodes[`${mainDiscount.discount_code}-${mainDiscount.id}`]
                              ? "bg-green-500 scale-105"
                              : "hover:brightness-110"
                          }`}
                          onClick={() => handleCopyCode(mainDiscount.discount_code, mainDiscount.id)}
                        >
                          <div className="flex items-center justify-center">
                            <span className="font-bold tracking-wider mr-5">
                              {copiedCodes[`${mainDiscount.discount_code}-${mainDiscount.id}`]
                                ? "COPIED!"
                                : mainDiscount.discount_code}
                            </span>
                          </div>

                          {/* Copy/Check Icon positioned absolutely in the top right */}
                          <div
                            className={`absolute top-2 right-2 transition-all duration-300 ${
                              copiedCodes[`${mainDiscount.discount_code}-${mainDiscount.id}`]
                                ? "opacity-100 scale-110"
                                : "opacity-80"
                            }`}
                          >
                            {copiedCodes[`${mainDiscount.discount_code}-${mainDiscount.id}`] ? (
                              <Check className="h-5 w-5 stroke-[3]" />
                            ) : (
                              <Copy className="h-5 w-5" />
                            )}
                          </div>
                        </button>

                        {/* Show more promos button - moved next to discount code button */}
                        {hasMultipleDiscounts && (
                          <button
                            onClick={() => toggleGroupExpanded(groupId)}
                            className="h-full bg-[#edb900] text-black rounded-[10px] py-3 px-3 flex items-center justify-center gap-1.5 transition-all hover:shadow-lg"
                          >
                            <FontAwesomeIcon icon={faTags} className="text-black" />
                            <span>{group.length - 1}</span>
                            <FontAwesomeIcon
                              icon={isExpanded ? faChevronUp : faChevronDown}
                              className={`text-black ml-1 text-xs chevron-icon ${isExpanded ? "open" : ""}`}
                            />
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col items-center">
                        {mainDiscount.expiry_date ? (
                          <>
                            {isLastDay(mainDiscount.expiry_date) ? (
                              <div className="text-xs mt-2 flex items-center justify-center gap-1.5 bg-[#0f0f0f] border border-[#edb900] rounded-md py-1 px-2.5 text-white animate-pulse">
                                <span className="text-[#edb900]">🔥</span>
                                <span>Last day, hurry up!</span>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Ends: {new Date(mainDiscount.expiry_date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          // Show infinity sign for Limited Time discounts with no expiry date
                          mainDiscount.discount_type === "Limited Time" && (
                            <div className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                              <Calendar className="mb-1 h-3.5 w-3.5" />
                              <span className="flex">
                                Ends: <Infinity className="pb-[3px] h-5 w-5" />
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Buy */}
                <div className="flex justify-center">
                  <button className="bg-[#edb900] text-[#0f0f0f] rounded-md min-w-[120px] min-h-[45px] w-16 h-12 flex items-center justify-center transition-all hover:brightness-110 shadow-md">
                    <ShoppingCart className="h-7 w-7" />
                  </button>
                </div>
              </div>

              {/* Additional discounts (shown when expanded) */}
              {hasMultipleDiscounts && (
                <div className={`accordion-content ${isExpanded ? "open" : ""}`}>
                  {group.slice(1).map((additionalDiscount, idx) => (
                    <div
                      key={`${groupId}-additional-${idx}`}
                      className={`grid grid-cols-1 ${hideCompanyCard ? "md:grid-cols-3" : "md:grid-cols-4"} gap-4 py-6 px-4 items-center bg-[#0f0f0f]`}
                      style={{
                        animation: isExpanded ? `fadeIn 0.3s ease-in-out forwards ${idx * 0.1}s` : "none",
                        opacity: isExpanded ? 1 : 0,
                        borderTop: "1px solid rgba(237,185,0,0.2)",
                        width: "100%", // Cover the full width
                      }}
                    >
                      {/* Empty column for company info (since we're showing in the same card) - only if not hiding company card */}
                      {!hideCompanyCard && <div className="flex flex-col items-start text-left opacity-50"></div>}

                      {/* Discount Description */}
                      <div className="text-center">
                        <div className="relative p-3 to-transparent rounded-lg border border-[rgba(237,185,0,0.15)]">
                          {/* Extract and emphasize percentage + "OFF" if it exists */}
                          {additionalDiscount.description &&
                          additionalDiscount.description.match(/\d+%\s*(?:OFF|off)?/) ? (
                            <div className="flex flex-col items-center">
                              {/* Main percentage + OFF - large and bold */}
                              <div className="text-5xl font-extrabold text-[#edb900] mb-1 leading-tight">
                                {additionalDiscount.description.match(/\d+%\s*(?:OFF|off)?/)[0].toUpperCase()}
                              </div>

                              {/* Secondary text - the rest of the description */}
                              <div className="text-sm text-gray-300 mb-2">
                                {additionalDiscount.description.replace(/\d+%\s*(?:OFF|off)?/, "").trim()}
                              </div>

                              {/* Optional bonus at the bottom with small font */}
                              {showOptionalBonus &&
                                additionalDiscount.cashback_bonus &&
                                (activeTab === "Review & earn" || activeTab === "Limited Time") && (
                                  <Tippy content={bonusTooltipContent} theme="custom" placement="top" arrow={true}>
                                    <div className="mt-2 w-full border-t border-[rgba(237,185,0,0.2)] pt-2 bg-gradient-to-b from-[rgba(237,185,0,0.1)] rounded-md relative">
                                      <div className="absolute top-1 right-1">
                                        <Info className="h-4 w-4 text-[#edb900] cursor-pointer" />
                                      </div>
                                      <div className="text-xs text-gray-400 pt-1">
                                        Optional cashback:
                                        <div className="flex items-center justify-center gap-1 text-[#edb900] text-sm font-medium mt-1">
                                          {additionalDiscount.cashback_bonus}
                                        </div>
                                      </div>
                                    </div>
                                  </Tippy>
                                )}
                            </div>
                          ) : (
                            // If no percentage is found, display the description normally with optional bonus below
                            <div className="flex flex-col items-center">
                              <div className="text-white mb-2 ">{additionalDiscount.description}</div>
                              {/* Optional bonus at the bottom with small font */}
                              {showOptionalBonus &&
                                additionalDiscount.cashback_bonus &&
                                (activeTab === "Review & earn" || activeTab === "Limited Time") && (
                                  <Tippy content={bonusTooltipContent} theme="custom" placement="top" arrow={true}>
                                    <div className="mt-2 w-full border-t border-[rgba(237,185,0,0.2)] pt-2 bg-gradient-to-b from-[rgba(237,185,0,0.1)] rounded-md relative">
                                      <div className="absolute top-1 right-1">
                                        <Info className="h-4 w-4 text-[#edb900] cursor-pointer" />
                                      </div>
                                      <div className="text-xs text-gray-400 pt-1">
                                        Optional cashback:
                                        <div className="flex items-center justify-center gap-1 text-[#edb900] text-sm font-medium mt-1">
                                          {additionalDiscount.cashback_bonus}
                                        </div>
                                      </div>
                                    </div>
                                  </Tippy>
                                )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Code */}
                      <div className="flex justify-center">
                        {additionalDiscount.no_code ? (
                          <div className="relative w-[300px]">
                            {" "}
                            <Tippy content={noCodeTooltipContent} theme="custom" placement="top" arrow={true}>
                              <div className="relative w-full bg-[#edb900] text-black font-medium rounded-md py-4 px-4 shadow-md text-center">
                                No code needed, proceed to checkout
                                <div className="absolute top-2 right-2">
                                  <Info className="h-4 w-4 text-[#0f0f0f] cursor-pointer" />
                                </div>
                              </div>
                            </Tippy>
                          </div>
                        ) : (
                          <div className="relative [min-w-[150px]] w-auto">
                            {/* Update the button in the additional discounts section */}
                            <button
                              className={`relative w-full bg-[#edb900] text-black font-medium rounded-md py-3 px-4 transition-all duration-300 shadow-md hover:shadow-lg ${
                                copiedCodes[`${additionalDiscount.discount_code}-${additionalDiscount.id}`]
                                  ? "bg-green-500 scale-105"
                                  : "hover:brightness-110"
                              }`}
                              onClick={() => handleCopyCode(additionalDiscount.discount_code, additionalDiscount.id)}
                            >
                              <div className="flex items-center justify-center">
                                <span className="font-bold tracking-wider mr-5">
                                  {copiedCodes[`${additionalDiscount.discount_code}-${additionalDiscount.id}`]
                                    ? "COPIED!"
                                    : additionalDiscount.discount_code}
                                </span>
                              </div>

                              {/* Copy/Check Icon positioned absolutely in the top right */}
                              <div
                                className={`absolute top-2 right-2 transition-all duration-300 ${
                                  copiedCodes[`${additionalDiscount.discount_code}-${additionalDiscount.id}`]
                                    ? "opacity-100 scale-110"
                                    : "opacity-80"
                                }`}
                              >
                                {copiedCodes[`${additionalDiscount.discount_code}-${additionalDiscount.id}`] ? (
                                  <Check className="h-5 w-5 stroke-[3]" />
                                ) : (
                                  <Copy className="h-5 w-5" />
                                )}
                              </div>
                            </button>
                            {additionalDiscount.expiry_date ? (
                              <>
                                {isLastDay(additionalDiscount.expiry_date) ? (
                                  <div className="text-xs mt-2 flex items-center justify-center gap-1.5 bg-[#0f0f0f] border border-[#edb900] rounded-md py-1 px-2.5 text-white animate-pulse">
                                    <span className="text-[#edb900]">🔥</span>
                                    <span>Last day, hurry up!</span>
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>Ends: {new Date(additionalDiscount.expiry_date).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </>
                            ) : (
                              // Show infinity sign for Limited Time discounts with no expiry date
                              additionalDiscount.discount_type === "Limited Time" && (
                                <div className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                                  <Calendar className="mb-1 h-3.5 w-3.5" />
                                  <span className="flex">
                                    Ends: <Infinity className="pb-[3px] h-5 w-5" />
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      {/* Buy */}
                      <div className="flex justify-center">
                        <button className="bg-[#edb900] text-[#0f0f0f] rounded-md min-w-[120px] min-h-[45px] w-16 h-12 flex items-center justify-center transition-all hover:brightness-110 shadow-md">
                          <ShoppingCart className="h-7 w-7" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })
      )}
      <Toaster />
    </div>
  )
}

const bonusTooltipContent = (
  <div className="font-[balboa]">
    This cashback is applied when you write a review for the prop firm. Submit your review to earn the additional
    cashback.
  </div>
)

const noCodeTooltipContent = (
  <div className="font-[balboa]">
    In order to receive a discount/cashback you just need to purchase through our link.
  </div>
)

function isLastDay(dateString) {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Set to beginning of day

  const expiryDate = new Date(dateString)
  expiryDate.setHours(0, 0, 0, 0) // Set to beginning of day

  // Calculate the difference in days
  const diffTime = expiryDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays === 0 // Return true if it's the last day
}

