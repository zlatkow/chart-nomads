"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  articleId: string
}

export function TableOfContents({ articleId }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    // Find all headings in the article content
    const article = document.getElementById(`article-${articleId}`)
    if (!article) return

    const headingElements = article.querySelectorAll("h2, h3, h4")

    const extractedHeadings: Heading[] = Array.from(headingElements).map((element, index) => {
      // Add IDs to headings if they don't have one
      if (!element.id) {
        element.id = `heading-${index}`
      }

      return {
        id: element.id,
        text: element.textContent || "",
        level: Number.parseInt(element.tagName.substring(1)), // Extract level from H2, H3, etc.
      }
    })

    setHeadings(extractedHeadings)
  }, [articleId])

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings
        .map((heading) => document.getElementById(heading.id))
        .filter(Boolean) as HTMLElement[]

      if (headingElements.length === 0) return

      // Find the heading that's currently in view
      const scrollPosition = window.scrollY + 100 // Offset for better UX

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const currentHeading = headingElements[i]
        if (currentHeading && currentHeading.offsetTop <= scrollPosition) {
          setActiveId(currentHeading.id)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initialize on mount

    return () => window.removeEventListener("scroll", handleScroll)
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  return (
    <div className="space-y-2 mt-[100px]">
      <h3 className="font-semibold text-lg text-white">Table of Contents</h3>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <button
            key={heading.id}
            className={cn(
              "block text-sm py-1 hover:text-[#edb900] transition-colors text-left w-full",
              heading.level === 2 ? "font-medium text-gray-200" : "pl-4 text-gray-400",
              activeId === heading.id ? "text-[#edb900] font-medium" : "",
            )}
            onClick={() => {
              const element = document.getElementById(heading.id)
              if (element) {
                // Add a small offset to account for the fixed progress bar
                const yOffset = -20
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
                window.scrollTo({ top: y, behavior: "smooth" })
                setActiveId(heading.id)
              }
            }}
          >
            {heading.text}
          </button>
        ))}
      </nav>
    </div>
  )
}

