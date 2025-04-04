"use client"

import { useEffect, useState } from "react"

export function ReadingProgress() {
  const [readingProgress, setReadingProgress] = useState(0)

  useEffect(() => {
    const updateReadingProgress = () => {
      const currentPosition = window.scrollY
      const scrollHeight = document.body.scrollHeight - window.innerHeight

      if (scrollHeight) {
        setReadingProgress(Number((currentPosition / scrollHeight).toFixed(2)) * 100)
      }
    }

    window.addEventListener("scroll", updateReadingProgress)

    // Initialize on mount
    updateReadingProgress()

    return () => window.removeEventListener("scroll", updateReadingProgress)
  }, [])

  return (
    <div className="fixed top-[90px] left-0 z-50 w-full h-1 bg-[#1a1a1a]">
      <div
        className="h-full bg-[#edb900] transition-all duration-150 ease-out"
        style={{ width: `${readingProgress}%` }}
        role="progressbar"
        aria-valuenow={readingProgress}
        aria-valuemin={20}
        aria-valuemax={60}
      />
    </div>
  )
}

