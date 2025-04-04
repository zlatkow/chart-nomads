"use client"

import { useEffect, useState } from "react"
import { useNoise } from "@/components/providers/noise-provider"

interface NoiseProps {
  isVisible?: boolean
}

const Noise = ({ isVisible: propIsVisible }: NoiseProps) => {
  const [loaded, setLoaded] = useState(false)
  const { isNoiseVisible } = useNoise()

  // Use the prop value if provided, otherwise use the context value
  const isVisible = propIsVisible !== undefined ? propIsVisible : isNoiseVisible

  useEffect(() => {
    setLoaded(true)

    // Add debugging to help track visibility state
    console.log("Noise component visibility:", isVisible)
  }, [isVisible])

  // Don't render the noise if it's not visible or not loaded yet
  if (!loaded || !isVisible) {
    console.log("Noise component not rendering - loaded:", loaded, "visible:", isVisible)
    return null
  }

  return <div className="absolute inset-0 noise-overlay opacity-[0.7]"></div>
}

export default Noise

