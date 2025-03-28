/* eslint-disable */
"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import ReviewModal from "./review-system/review-modal"
import { createPortal } from "react-dom"

// Define the context type
type ModalContextType = {
  openReviewModal: (props: { companyName: string; companyLogo?: string }) => void
  closeReviewModal: () => void
  openGallery: (images: any[], startIndex: number) => void
  closeGallery: () => void
  openProfileSidebar: (profileData: any) => void
  closeProfileSidebar: () => void
}

// Create the context with default values
const ModalContext = createContext<ModalContextType>({
  openReviewModal: () => {},
  closeReviewModal: () => {},
  openGallery: () => {},
  closeGallery: () => {},
  openProfileSidebar: () => {},
  closeProfileSidebar: () => {},
})

// Hook to use the modal context
export const useModal = () => useContext(ModalContext)

// Modal container component
export function ModalProvider({ children }: { children: ReactNode }) {
  const [reviewModalProps, setReviewModalProps] = useState<{
    isOpen: boolean
    companyName: string
    companyLogo?: string
  }>({
    isOpen: false,
    companyName: "",
  })

  const [galleryState, setGalleryState] = useState<{ isOpen: boolean; images: any[]; currentIndex: number }>({
    isOpen: false,
    images: [],
    currentIndex: 0,
  })

  const [profileState, setProfileState] = useState<{ isOpen: boolean; profileData: any }>({
    isOpen: false,
    profileData: null,
  })

  // Functions to control modals
  const openReviewModal = (props: { companyName: string; companyLogo?: string }) => {
    setReviewModalProps({ isOpen: true, ...props })
    document.body.style.overflow = "hidden"
  }

  const closeReviewModal = () => {
    setReviewModalProps((prev) => ({ ...prev, isOpen: false }))
    document.body.style.overflow = "auto"
  }

  const openGallery = (images: any[], startIndex: number) => {
    setGalleryState({ isOpen: true, images, currentIndex: startIndex })
    document.body.style.overflow = "hidden"
  }

  const closeGallery = () => {
    setGalleryState((prev) => ({ ...prev, isOpen: false }))
    document.body.style.overflow = "auto"
  }

  const openProfileSidebar = (profileData: any) => {
    setProfileState({ isOpen: true, profileData })
    document.body.style.overflow = "hidden"
  }

  const closeProfileSidebar = () => {
    setProfileState((prev) => ({ ...prev, isOpen: false }))
    document.body.style.overflow = "auto"
  }

  // Check if we're in the browser
  const isBrowser = typeof window !== "undefined"

  return (
    <ModalContext.Provider
      value={{
        openReviewModal,
        closeReviewModal,
        openGallery,
        closeGallery,
        openProfileSidebar,
        closeProfileSidebar,
      }}
    >
      {children}

      {/* Render modals with extremely high z-index */}
      {isBrowser &&
        reviewModalProps.isOpen &&
        createPortal(
          <div style={{ position: "relative", zIndex: 99999 }}>
            <ReviewModal
              isOpen={true}
              onClose={closeReviewModal}
              companyName={reviewModalProps.companyName}
              companyLogo={reviewModalProps.companyLogo}
              companyId="your-company-id" // Add this line
            />
          </div>,
          document.body,
        )}

      {/* Add gallery and profile sidebar portals here when needed */}
    </ModalContext.Provider>
  )
}

