"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { createContext, useState, useEffect } from "react"
import type { AppProps } from "next/app"
import "../styles/globals.css"
import LoginModal from "../components/Auth/LoginModal"
import "flag-icon-css/css/flag-icons.min.css"
import { NoiseProvider } from "../components/providers/noise-provider"
import { createPortal } from "react-dom"
import ReviewModal from "../components/review-system/review-modal"

// Define the context type
interface ModalContextType {
  // Login modal
  showLoginModal: boolean
  setShowLoginModal: (value: boolean) => void

  // Review system modals
  reviewModal: {
    isOpen: boolean
    companyName: string
    companyLogo?: string
  }
  openReviewModal: (props: { companyName: string; companyLogo?: string }) => void
  closeReviewModal: () => void
}

// Create Global Context with proper typing and default values
export const ModalContext = createContext<ModalContextType>({
  showLoginModal: false,
  setShowLoginModal: () => {},
  reviewModal: {
    isOpen: false,
    companyName: "",
  },
  openReviewModal: () => {},
  closeReviewModal: () => {},
})

// Helper function to adjust navbar z-index
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
      const element = el as HTMLElement // Cast to HTMLElement
      if (lower) {
        // Store the original z-index if we haven't already
        if (!element.getAttribute("data-original-zindex")) {
          element.setAttribute("data-original-zindex", element.style.zIndex || "")
        }
        // Set to a low z-index
        element.style.zIndex = "10"
      } else {
        // Restore the original z-index
        const originalZIndex = element.getAttribute("data-original-zindex")
        if (originalZIndex !== null) {
          element.style.zIndex = originalZIndex
        } else {
          element.style.zIndex = "100" // Default fallback
        }
      }
    })
  })
}

export default function MyApp({ Component, pageProps }: AppProps) {
  // Original login modal state
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Review modal state
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    companyName: "",
    companyLogo: undefined as string | undefined,
  })

  // Function to open review modal
  const openReviewModal = (props: { companyName: string; companyLogo?: string }) => {
    console.log("Opening review modal with:", props)
    setReviewModal({
      isOpen: true,
      companyName: props.companyName,
      companyLogo: props.companyLogo,
    })

    if (typeof document !== "undefined") {
      // Disable scrolling
      document.body.style.overflow = "hidden"

      // Lower navbar z-index
      adjustNavbarZIndex(true)
    }
  }

  // Function to close review modal
  const closeReviewModal = () => {
    console.log("Closing review modal")
    setReviewModal((prev) => ({ ...prev, isOpen: false }))

    if (typeof document !== "undefined") {
      // Re-enable scrolling
      document.body.style.overflow = "auto"

      // Restore navbar z-index
      adjustNavbarZIndex(false)
    }
  }

  // Handle login modal open/close with navbar z-index adjustment
  const handleLoginModalOpen = () => {
    setShowLoginModal(true)
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden"
      adjustNavbarZIndex(true)
    }
  }

  const handleLoginModalClose = () => {
    setShowLoginModal(false)
    if (typeof document !== "undefined") {
      document.body.style.overflow = "auto"
      adjustNavbarZIndex(false)
    }
  }

  // Effect to ensure navbar z-index is restored when component unmounts
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        adjustNavbarZIndex(false)
      }
    }
  }, [])

  // Check if we're in the browser
  const isBrowser = typeof window !== "undefined"

  return (
    <NoiseProvider>
      <ClerkProvider {...pageProps}>
        <ModalContext.Provider
          value={{
            showLoginModal,
            setShowLoginModal: handleLoginModalOpen,
            reviewModal,
            openReviewModal,
            closeReviewModal,
          }}
        >
          <Component {...pageProps} />

          {/* Original login modal */}
          <LoginModal isOpen={showLoginModal} onClose={handleLoginModalClose} />

          {/* Review modal */}
          {isBrowser &&
            reviewModal.isOpen &&
            createPortal(
              <ReviewModal
                isOpen={true}
                onClose={closeReviewModal}
                companyName={reviewModal.companyName}
                companyLogo={reviewModal.companyLogo}
              />,
              document.body,
            )}
        </ModalContext.Provider>
      </ClerkProvider>
    </NoiseProvider>
  )
}

