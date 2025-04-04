"use client"

import { useEffect, useState } from "react"

export function ReadingProgress() {
  const [readingProgress, setReadingProgress] = useState(0)

  useEffect(() => {
    const updateReadingProgress = () => {
      const currentPosition = window.scrollY
      const scrollHeight = document.body.scrollHeight - window.innerHeight

      if (scrollHeight) {
        const rawProgress = Number((currentPosition / scrollHeight).toFixed(2)) * 100

        // Clamp progress between 10% and 80%
        const clampedProgress = Math.min(Math.max(rawProgress, 10), 80)

        // Normalize it to 0–100% range for visual width (between 20–60% scroll = 0–100% width)
        const normalized = ((clampedProgress - 10) / (10 - 80)) * 100

        setReadingProgress(normalized)
      }
    }

    window.addEventListener("scroll", updateReadingProgress)

    updateReadingProgress() // initialize

    return () => window.removeEventListener("scroll", updateReadingProgress)
  }, [])

  return (
    <div className="fixed top-[90px] left-0 z-50 w-full h-1 bg-[#1a1a1a]">
      <div
        className="h-full bg-[#edb900] transition-all duration-150 ease-out"
        style={{ width: `${readingProgress}%` }}
        role="progressbar"
        aria-valuenow={readingProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}
