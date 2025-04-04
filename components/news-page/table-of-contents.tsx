"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Heading {
  id: string
  text: string
  level: number
  parentId?: string // To track parent-child relationships
}

interface TableOfContentsProps {
  articleId: string
}

export function TableOfContents({ articleId }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Find all headings in the article content
    const article = document.getElementById(`article-${articleId}`)
    if (!article) return

    const headingElements = article.querySelectorAll("h2, h3, h4")
    
    let currentH2Id = ""
    
    const extractedHeadings: Heading[] = Array.from(headingElements).map((element, index) => {
      // Add IDs to headings if they don't have one
      if (!element.id) {
        element.id = `heading-${index}`
      }
      
      const level = Number.parseInt(element.tagName.substring(1))
      
      // Track parent-child relationships
      if (level === 2) {
        currentH2Id = element.id
      }
      
      return {
        id: element.id,
        text: element.textContent || "",
        level: level,
        parentId: level > 2 ? currentH2Id : undefined
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
          
          // Auto-expand the section containing the active heading
          const activeHeading = headings.find(h => h.id === currentHeading.id)
          if (activeHeading && activeHeading.parentId) {
            setExpandedSections(prev => ({
              ...prev,
              [activeHeading.parentId]: true
            }))
          } else if (activeHeading && activeHeading.level === 2) {
            // If it's an h2, expand it
            setExpandedSections(prev => ({
              ...prev,
              [activeHeading.id]: true
            }))
          }
          
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initialize on mount

    return () => window.removeEventListener("scroll", handleScroll)
  }, [headings])

  const toggleSection = (headingId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [headingId]: !prev[headingId]
    }))
  }

  const scrollToHeading = (headingId: string) => {
    const element = document.getElementById(headingId)
    if (element) {
      // Calculate position to center the element in the viewport
      const elementRect = element.getBoundingClientRect()
      const absoluteElementTop = elementRect.top + window.pageYOffset
      const middle = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2)
      
      window.scrollTo({ top: middle, behavior: "smooth" })
      setActiveId(headingId)
    }
  }

  if (headings.length === 0) {
    return null
  }

  // Group headings by their hierarchy
  const h2Headings = headings.filter(h => h.level === 2)

  return (
    <div className="space-y-2">
      <h3 className="text-lg text-white">Table of Contents</h3>
      <nav className="space-y-1">
        {h2Headings.map((h2) => {
          const childHeadings = headings.filter(h => h.parentId === h2.id)
          const isExpanded = expandedSections[h2.id]
          const isActive = activeId === h2.id || headings.some(h => h.parentId === h2.id && h.id === activeId)
          
          return (
            <div key={h2.id} className="mb-1">
              <div 
                className={cn(
                  "flex items-center text-sm py-1 hover:text-[#edb900] transition-colors w-full cursor-pointer",
                  "font-medium text-gray-200",
                  isActive ? "text-[#edb900] font-medium" : ""
                )}
              >
                {childHeadings.length > 0 && (
                  <button 
                    onClick={() => toggleSection(h2.id)}
                    className="mr-1 p-0.5 hover:bg-[#222] rounded-sm focus:outline-none"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>
                )}
                <button
                  className="text-left flex-1"
                  onClick={() => {
                    scrollToHeading(h2.id)
                    if (childHeadings.length > 0) {
                      setExpandedSections(prev => ({
                        ...prev,
                        [h2.id]: true
                      }))
                    }
                  }}
                >
                  {h2.text}
                </button>
              </div>
              
              {isExpanded && childHeadings.length > 0 && (
                <div className="ml-4 mt-1 space-y-1 border-l border-[#222] pl-2">
                  {childHeadings.map((child) => (
                    <button
                      key={child.id}
                      className={cn(
                        "block text-sm py-1 hover:text-[#edb900] transition-colors text-left w-full",
                        child.level === 3 ? "pl-2 text-gray-400" : "pl-4 text-gray-500",
                        activeId === child.id ? "text-[#edb900] font-medium" : ""
                      )}
                      onClick={() => scrollToHeading(child.id)}
                    >
                      {child.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}