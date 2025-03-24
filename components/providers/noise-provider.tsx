"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type NoiseContextType = {
  isNoiseVisible: boolean
  hideNoise: () => void
  showNoise: () => void
}

const NoiseContext = createContext<NoiseContextType | undefined>(undefined)

export function useNoise() {
  const context = useContext(NoiseContext)
  if (!context) {
    throw new Error("useNoise must be used within a NoiseProvider")
  }
  return context
}

export function NoiseProvider({ children }: { children: ReactNode }) {
  const [isNoiseVisible, setIsNoiseVisible] = useState(true)

  const hideNoise = () => setIsNoiseVisible(false)
  const showNoise = () => setIsNoiseVisible(true)

  return <NoiseContext.Provider value={{ isNoiseVisible, hideNoise, showNoise }}>{children}</NoiseContext.Provider>
}