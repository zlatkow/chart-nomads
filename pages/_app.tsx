"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { createContext, useState } from "react"
import type { AppProps } from "next/app"
import "../styles/globals.css"
import LoginModal from "../components/Auth/LoginModal"
import "flag-icon-css/css/flag-icons.min.css"

// Define the context type to match what your app needs
interface ModalContextType {
  showLoginModal: boolean
  setShowLoginModal: (value: boolean) => void
}

// Create Global Context with proper typing
export const ModalContext = createContext<ModalContextType>({
  showLoginModal: false,
  setShowLoginModal: () => {}, // Default no-op function
})

export default function MyApp({ Component, pageProps }: AppProps) {
  const [showLoginModal, setShowLoginModal] = useState(false)

  return (
    <ClerkProvider {...pageProps}>
      <ModalContext.Provider value={{ showLoginModal, setShowLoginModal }}>
        <Component {...pageProps} />
        {/* Update props to match what LoginModal expects */}
        {showLoginModal && <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />}
      </ModalContext.Provider>
    </ClerkProvider>
  )
}

