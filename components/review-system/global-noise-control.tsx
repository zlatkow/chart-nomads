"use client"

import { useEffect } from "react"

/**
 * This component provides a global way to control noise visibility
 * It can be placed anywhere in the app and will use direct DOM manipulation
 * instead of relying on the NoiseProvider context
 */
export function GlobalNoiseControl() {
  useEffect(() => {
    // Direct DOM manipulation functions that don't rely on context
    const forceHideNoise = () => {
      const noiseElements = document.querySelectorAll(".noise-overlay")
      noiseElements.forEach((el) => {
        ;(el as HTMLElement).style.display = "none"
      })
      console.log("Force hiding noise elements:", noiseElements.length)
    }

    const forceShowNoise = () => {
      const noiseElements = document.querySelectorAll(".noise-overlay")
      noiseElements.forEach((el) => {
        ;(el as HTMLElement).style.display = ""
      })
      console.log("Force showing noise elements:", noiseElements.length)
    }

    // Create a MutationObserver to watch for modal elements being added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          // Check if any modals or overlays were added - using more reliable selectors
          const modalElements = document.querySelectorAll(".fixed.inset-0")

          // Additional check to filter only modal-like elements (those with high z-index)
          const modalLikeElements = Array.from(modalElements).filter((el) => {
            const style = window.getComputedStyle(el)
            const zIndex = Number.parseInt(style.zIndex, 10)
            // Consider elements with z-index >= 50 as modals
            return !isNaN(zIndex) && zIndex >= 50
          })

          if (modalLikeElements.length > 0) {
            console.log("Modal elements detected in DOM:", modalLikeElements.length)
            forceHideNoise()
            // Also dispatch the global event for components using the context
            window.dispatchEvent(new CustomEvent("noise:hide"))
          } else {
            // If no modals are present, show the noise
            forceShowNoise()
            // Also dispatch the global event for components using the context
            window.dispatchEvent(new CustomEvent("noise:show"))
          }
        }
      })
    })

    // Start observing the body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Listen for global noise control events
    const handleNoiseHide = () => forceHideNoise()
    const handleNoiseShow = () => forceShowNoise()

    window.addEventListener("noise:hide", handleNoiseHide)
    window.addEventListener("noise:show", handleNoiseShow)

    return () => {
      // Clean up
      observer.disconnect()
      window.removeEventListener("noise:hide", handleNoiseHide)
      window.removeEventListener("noise:show", handleNoiseShow)
    }
  }, [])

  // This component doesn't render anything
  return null
}

