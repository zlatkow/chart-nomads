import { ClerkProvider } from "@clerk/nextjs"
import { createContext, useState } from "react"
import type { AppProps } from "next/app"
import "../styles/globals.css"
import LoginModal from "../components/Auth/LoginModal"
import "flag-icon-css/css/flag-icons.min.css"
import { NoiseProvider } from '../components/providers/noise-provider'

// Define the context type
interface ModalContextType {
  showLoginModal: boolean
  setShowLoginModal: (value: boolean) => void
}

// Create Global Context with proper typing and default values
export const ModalContext = createContext<ModalContextType>({
  showLoginModal: false,
  setShowLoginModal: () => {}, // Default no-op function
})

export default function MyApp({ Component, pageProps }: AppProps) {
  const [showLoginModal, setShowLoginModal] = useState(false)

  return (
    <NoiseProvider>
      <ClerkProvider {...pageProps}>
        <ModalContext.Provider value={{ showLoginModal, setShowLoginModal }}>
          <Component {...pageProps} />
          <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </ModalContext.Provider>
      </ClerkProvider>
    </NoiseProvider>
  )
}