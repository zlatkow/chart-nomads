import { ClerkProvider } from "@clerk/nextjs";
import { createContext, useState } from "react";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import LoginModal from "../components/Auth/LoginModal";
import "flag-icon-css/css/flag-icons.min.css";


// ✅ Create Global Context for the Login Modal
export const ModalContext = createContext(null);

export default function MyApp({ Component, pageProps }: AppProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <ClerkProvider {...pageProps}>
      <ModalContext.Provider value={{ showLoginModal, setShowLoginModal }}>
        <Component {...pageProps} />
        {/* ✅ Render modal globally so it works everywhere */}
        {showLoginModal && <LoginModal closeModal={() => setShowLoginModal(false)} />}
      </ModalContext.Provider>
    </ClerkProvider>
  );
}
