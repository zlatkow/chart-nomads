import { useEffect, useState } from "react"
import { useNoise } from "./providers/noise-provider"

const Noise = () => {
  const [loaded, setLoaded] = useState(false)
  const { isNoiseVisible } = useNoise()

  useEffect(() => {
    setLoaded(true)
  }, [])

  // Don't render the noise if it's not visible or not loaded yet
  if (!loaded || !isNoiseVisible) return null

  return <div className="absolute inset-0 noise-overlay opacity-[0.7] z-10"></div>
}

export default Noise