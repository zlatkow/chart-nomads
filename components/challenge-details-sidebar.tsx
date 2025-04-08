/* eslint-disable */
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { X, Info, Star, StarHalf } from "lucide-react"
import { FaShoppingCart } from "react-icons/fa"
import { cn } from "@/lib/utils"
import { useNoise } from "@/components/providers/noise-provider"

interface TradingOverviewItem {
  label: string
  value: string | boolean | number
  tooltip?: string
}

interface ChallengeFirm {
  id: number
  name: string
  logo?: string
  color: string
  rating: number
  reviews: number
  category?: string
  country?: string
  favorites?: number
  maxAllocation?: string
  programType?: string
  yearsInOperation?: number
  availablePlatforms?: string[]
}

interface ChallengeDetails {
  id: number
  firmId: number
  firm: ChallengeFirm
  price: number
  originalPrice: number
  accountSize: string
  maxDrawdown: string
  profitTarget: {
    step1: string
    step2?: string
  }
  dailyLoss: string
  maxLossType?: string
  programName: string
  dailyDrawdownResetType?: string
  minTradingDays?: string
  timeLimit?: string
  tradingOverview?: TradingOverviewItem[]
  payoutOverview?: {
    profitSplit: string
    refundableFee: string
    payoutFrequency: string
  }
}

interface ChallengeSidebarProps {
  challenge: ChallengeDetails | null
  isOpen: boolean
  onClose: () => void
}

// Helper function to check if we're in the browser
const isBrowser = () => typeof window !== "undefined"

// Function to adjust navbar z-index
const adjustNavbarZIndex = (lower: boolean) => {
  if (typeof document === "undefined") return

  // Target all possible navbar elements
  const navbarSelectors = [
    "nav",
    "header",
    ".navbar",
    '[class*="navbar"]',
    '[id*="navbar"]',
    '[class*="header"]',
    '[id*="header"]',
  ]

  navbarSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector)
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement
      if (lower) {
        htmlEl.style.zIndex = "10"
      } else {
        const originalZIndex = htmlEl.getAttribute("data-original-zindex")
        htmlEl.style.zIndex = originalZIndex || "100" // Default fallback
      }
    })
  })
}

// Function to render stars based on rating
const renderStars = (rating: number) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} className="h-3 w-3 fill-[#edb900] text-[#edb900]" />)
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<StarHalf key={i} className="h-3 w-3 fill-[#edb900] text-[#edb900]" />)
    } else {
      stars.push(<Star key={i} className="h-3 w-3 text-gray-500" />)
    }
  }
  return stars
}

export default function ChallengeDetailsSidebar({ challenge, isOpen, onClose }: ChallengeSidebarProps) {
  // Try to use the noise provider, but don't crash if it's not available
  const noiseControls = useNoise()
  const hideNoise = useCallback(() => {
    noiseControls?.hideNoise()
  }, [noiseControls])

  const showNoise = useCallback(() => {
    noiseControls?.showNoise()
  }, [noiseControls])

  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [backdropVisible, setBackdropVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      setScrollPosition(window.scrollY)

      // First hide the noise completely before showing the sidebar
      hideNoise()

      // First show the backdrop
      setBackdropVisible(true)

      // Then after a small delay, slide in the sidebar
      setTimeout(() => {
        setSidebarVisible(true)
      }, 50)

      // Fix the body at the current scroll position without shifting content
      document.body.style.top = `-${window.scrollY}px`
      document.body.style.position = "fixed"
      document.body.style.width = "100%"
      document.body.style.overflow = "hidden"
      document.body.style.left = "0"
      document.body.style.right = "0"

      // Lower navbar z-index but don't change its position
      adjustNavbarZIndex(true)
    }
  }, [isOpen, hideNoise])

  const handleClose = () => {
    // Set closing state to prevent noise from showing prematurely
    setIsClosing(true)

    // First hide both the sidebar and backdrop with animation
    setSidebarVisible(false)
    setBackdropVisible(false)

    // Restore navbar z-index IMMEDIATELY
    adjustNavbarZIndex(false)

    // After animation completes (300ms), clean up everything else
    setTimeout(() => {
      // Restore scrolling
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""

      // Restore scroll position immediately to prevent layout shift
      window.scrollTo(0, scrollPosition)

      // Call the onClose prop
      onClose()

      // Wait a bit longer before showing noise
      setTimeout(() => {
        setIsClosing(false)
        showNoise()
      }, 50)
    }, 300) // Match this with the transition duration
  }

  if (!challenge) return null

  // Default values for new fields if not provided
  const yearsInOperation = challenge.firm.yearsInOperation || 5
  const availablePlatforms = challenge.firm.availablePlatforms || ["MT4", "MT5", "cTrader"]

  return (
    <>
      {(isOpen || backdropVisible) &&
        isBrowser() &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              overflow: "hidden",
              pointerEvents: "auto",
            }}
          >
            {/* Backdrop with animation */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-200 ease-in-out"
              style={{
                opacity: backdropVisible ? 1 : 0,
                pointerEvents: backdropVisible ? "auto" : "none",
              }}
              onClick={handleClose}
              aria-hidden="true"
            />

            {/* Sidebar with animation */}
            <div
              ref={sidebarRef}
              className="fixed top-0 bottom-0 p-2 right-0 w-full max-w-md bg-[#0f0f0f] text-white shadow-2xl transition-transform duration-300 ease-out flex flex-col"
              style={{
                transform: sidebarVisible ? "translateX(0)" : "translateX(100%)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                zIndex: 100000,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-[#222]">
                <div className="flex items-center gap-2">
                  <div
                    className="w-15 h-15 rounded-md flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: challenge.firm.color }}
                  >
                    {challenge.firm.logo ? (
                      <img
                        src={challenge.firm.logo || "/placeholder.svg"}
                        alt={challenge.firm.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-[#0f0f0f] font-bold text-lg">{challenge.firm.name.substring(0, 1)}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{challenge.firm.name}</h2>
                    <div className="flex items-center gap-1">
                      <span className="text-[#edb900] font-bold text-sm">{challenge.firm.rating.toFixed(1)}</span>
                      <div className="flex">{renderStars(challenge.firm.rating)}</div>
                      <span className="text-xs text-gray-400">({challenge.firm.reviews})</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-lg font-bold text-[#edb900]">${challenge.price.toFixed(2)}</div>
                  <div className="text-xs text-gray-400 line-through">${challenge.originalPrice.toFixed(2)}</div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-full hover:bg-[#222] transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto pb-20">
                <div className="p-10 space-y-4">
                  {/* Firm Overview - Moved to the top */}
                  <div>
                    <h3 className="text-base font-bold mb-2">Firm Overview</h3>
                    <div className="bg-[#1a1a1a] rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <div>Company Category:</div>
                        <div className="bg-[#edb900] text-[#0f0f0f] px-2 py-0.5 rounded-full font-bold text-xs">
                          {challenge.firm.category || "Gold"}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>Country:</div>
                        <div className="flex items-center gap-1">
                          <span className="inline-block w-5 h-3 overflow-hidden">
                            <img
                              src={`https://flagcdn.com/w20/gb.png`}
                              alt="GB"
                              className="w-full h-auto object-cover"
                            />
                          </span>
                          <span>GB</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>Years in Operation:</div>
                        <div className="font-medium">{yearsInOperation} years</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>Liked By:</div>
                        <div className="flex items-center gap-1">
                          <span className="text-red-500">❤</span>
                          <span>{challenge.firm.favorites || "3906"}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>Max Allocation:</div>
                        <div className="font-medium">{challenge.firm.maxAllocation || "$400K"}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>Program Name:</div>
                        <div className="font-medium">{challenge.programName}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>Program Type:</div>
                        <div className="bg-[#333] px-2 py-0.5 rounded-md text-xs">
                          {challenge.firm.programType || "2 Steps"}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>Account Size:</div>
                        <div className="font-medium">{challenge.accountSize}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>Available Platforms:</div>
                        <div className="flex flex-wrap justify-end gap-1">
                          {availablePlatforms.map((platform, index) => (
                            <span key={index} className="bg-[#333] px-1.5 py-0.5 rounded text-xs">
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Daily Drawdown and Profit Target */}
                  <div className="bg-[#1a1a1a] rounded-lg p-2.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <h3 className="text-xs text-gray-400 mb-1">Drawdown</h3>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs">
                              <span>Daily:</span>
                              <span className="text-red-500">-{challenge.dailyLoss}</span>
                            </div>
                            <div className="mt-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                                style={{ width: "100%" }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs">
                              <span>Max:</span>
                              <span className="text-red-500">-{challenge.maxDrawdown}</span>
                            </div>
                            <div className="mt-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                                style={{ width: "100%" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs text-gray-400 mb-1">Profit Target</h3>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs">
                              <span>1 step:</span>
                              <span className="text-green-500">{challenge.profitTarget.step1}</span>
                            </div>
                            <div className="mt-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
                              <div className="h-full bg-green-500" style={{ width: "60%" }}></div>
                            </div>
                          </div>
                          {challenge.profitTarget.step2 && (
                            <div>
                              <div className="flex justify-between text-xs">
                                <span>2 step:</span>
                                <span className="text-green-500">{challenge.profitTarget.step2}</span>
                              </div>
                              <div className="mt-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: "40%" }}></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Max Loss Type and Daily Drawdown Reset Type */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1a1a1a] rounded-lg p-2.5">
                      <h3 className="text-xs text-gray-400 mb-1">Max Loss Type:</h3>
                      <div className="text-sm font-medium">{challenge.maxLossType || "Static"}</div>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-2.5">
                      <h3 className="text-xs text-gray-400 mb-1">Daily Drawdown Reset:</h3>
                      <div className="text-sm font-medium">{challenge.dailyDrawdownResetType || "Balance Based"}</div>
                    </div>
                  </div>

                  {/* Time Limit and Min Trading Days */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1a1a1a] rounded-lg p-2.5">
                      <h3 className="text-xs text-gray-400 mb-1">Time Limit:</h3>
                      <div className="text-sm font-medium flex items-center">
                        <span className="mr-1">∞</span>
                        {challenge.timeLimit || "Unlimited"}
                      </div>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-2.5">
                      <h3 className="text-xs text-gray-400 mb-1">Min Trading Days:</h3>
                      <div className="text-sm font-medium">{challenge.minTradingDays || "3 days"}</div>
                    </div>
                  </div>

                  {/* Challenge Trading Overview */}
                  <div>
                    <h3 className="text-base font-bold mb-2">Challenge Trading Overview</h3>
                    <div className="bg-[#1a1a1a] rounded-lg p-3 space-y-2 text-sm">
                      {challenge.tradingOverview ? (
                        challenge.tradingOverview.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <span>{item.label}:</span>
                              {item.tooltip && <Info className="h-3 w-3 text-gray-400" />}
                            </div>
                            <div
                              className={cn(
                                typeof item.value === "boolean" || item.value === "Yes" || item.value === "Allowed"
                                  ? "text-green-500"
                                  : item.value === "No" || item.value === "Not Allowed"
                                    ? "text-red-500"
                                    : "",
                              )}
                            >
                              {typeof item.value === "boolean" ? (item.value ? "Yes" : "No") : item.value}
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <span>Max Leverage:</span>
                            </div>
                            <div>1:100</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <span>News-Trading:</span>
                            </div>
                            <div className="text-green-500">Yes</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <span>Copy-Trading:</span>
                            </div>
                            <div className="text-green-500">Yes</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <span>EA's:</span>
                            </div>
                            <div className="text-green-500">Allowed</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <span>Weekend Holding:</span>
                            </div>
                            <div className="text-green-500">Yes</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <span>Overnight Holding:</span>
                            </div>
                            <div className="text-green-500">Yes</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Payout Overview - Moved to the bottom */}
                  <div>
                    <h3 className="text-base font-bold mb-2">Payout Overview</h3>
                    <div className="bg-[#1a1a1a] rounded-lg p-3 space-y-2 text-sm">
                      {challenge.payoutOverview ? (
                        <>
                          <div className="flex justify-between items-center">
                            <div>Profit Split:</div>
                            <div className="font-medium">{challenge.payoutOverview.profitSplit}</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>Refundable Fee:</div>
                            <div
                              className={
                                challenge.payoutOverview.refundableFee === "Yes" ? "text-green-500" : "text-red-500"
                              }
                            >
                              {challenge.payoutOverview.refundableFee}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>Payout Frequency:</div>
                            <div>{challenge.payoutOverview.payoutFrequency}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <div>Profit Split:</div>
                            <div className="font-medium">80%</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>Refundable Fee:</div>
                            <div className="text-red-500">No</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>Payout Frequency:</div>
                            <div>14 days or on demand payout</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Buy Button with gradient background */}
              <div className="absolute bottom-0 left-0 right-0 w-full">
                <div className="h-20 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f] to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <button className="w-full py-2.5 bg-[#edb900] text-[#0f0f0f] rounded-md font-bold flex items-center justify-center gap-2 hover:bg-[#c99e00] transition-colors">
                    <FaShoppingCart size={16} />
                    Buy Challenge
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

