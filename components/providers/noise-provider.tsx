"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type NoiseContextType = {
  isNoiseVisible: boolean
  hideNoise: () => void
  showNoise: () => void
  setIsNoiseVisible: (value: boolean) => void
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

  const hideNoise = () => {
    console.log("hideNoise called")
    setIsNoiseVisible(false)
  }

  const showNoise = () => {
    console.log("showNoise called")
    setIsNoiseVisible(true)
  }

  // Add an effect to log state changes
  useEffect(() => {
    console.log("NoiseProvider state changed:", isNoiseVisible)
  }, [isNoiseVisible])

  return (
    <NoiseContext.Provider value={{ isNoiseVisible, hideNoise, showNoise, setIsNoiseVisible }}>
      {children}
    </NoiseContext.Provider>
  )
}

