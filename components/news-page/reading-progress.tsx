"use client"

import { useEffect, useState } from "react"

export function ReadingProgress() {
  const [readingProgress, setReadingProgress] = useState(0)

  useEffect(() => {
    const updateReadingProgress = () => {
      const currentPosition = window.scrollY
      const totalScrollHeight = document.body.scrollHeight - window.innerHeight
      
      // Calculate the target scroll height (80% of total)
      const targetScrollHeight = totalScrollHeight * 0.8
      
      if (targetScrollHeight) {
        // Calculate progress based on the target height
        const progress = Math.min(100, (currentPosition / targetScrollHeight) * 100)
        setReadingProgress(Number(progress.toFixed(2)))
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
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}