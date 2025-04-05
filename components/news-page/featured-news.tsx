"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, Clock } from 'lucide-react'

interface Author {
  id: number
  name: string
  profile_pic: string
  x_link?: string
  instagram_link?: string
  linkedin_link?: string
}

interface FeaturedArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  date: string
  author: string | Author // Can be either a string (name) or an Author object
  authorImage?: string // Optional now as we might use author.profile_pic
  image: string
  readTime: string
}

interface FeaturedNewsProps {
  article: FeaturedArticle
}

// Original FeaturedNews component
export function FeaturedNews({ article }: FeaturedNewsProps) {
  // Ensure the slug is properly formatted
  const formattedSlug = article.slug?.trim() || article.id

  // Handle author data which can be either a string or an Author object
  const authorName = typeof article.author === "string" ? article.author : article.author?.name || "Unknown Author"
  const authorImage =
    typeof article.author === "string"
      ? article.authorImage || "/placeholder.svg?height=40&width=40"
      : article.author?.profile_pic || "/placeholder.svg?height=40&width=40"

  // Get first letter for avatar fallback
  const authorInitial = authorName.charAt(0) || "A"

  return (
    <Link href={`/news/${formattedSlug}`} className="block group">
      <Card className="overflow-hidden border-[#222] bg-[#0f0f0f] transition-colors duration-200 group-hover:bg-[#1a1a1a]">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative h-64 lg:h-full min-h-[400px]">
              <Image src={article.image || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
            </div>
            <div className="flex flex-col justify-between p-6 py-10 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90 hover:text-[#0f0f0f]">
                    {article.category}
                  </Badge>
                </div>
                <h2 className="text-3xl tracking-tight text-white group-hover:text-[#edb900] transition-colors">
                  {article.title}
                </h2>
                <p className="text-gray-300">{article.excerpt}</p>
              </div>
              <div className="w-full flex justify-end items-end">
                <div className="bg-[#edb900] w-[125px] text-[#0f0f0f] hover:bg-[#edb900]/90 px-4 py-2 rounded-md font-medium">
                    Read More
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={authorImage} alt={authorName} />
                    <AvatarFallback>{authorInitial}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{authorName}</p>
                    <div className="flex">
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" /> {article.date}
                        </p>
                        <p className="ml-1 text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {article.readTime}
                        </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// New slider component that uses FeaturedNews
interface FeaturedNewsSliderProps {
  articles: FeaturedArticle[]
  autoPlayInterval?: number
}

export function FeaturedNewsSlider({ 
  articles, 
  autoPlayInterval = 5000 
}: FeaturedNewsSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % articles.length)
    setProgress(0) // Reset progress when changing slides
  }, [articles.length])

  // Progress animation
  useEffect(() => {
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    
    // Start a new progress interval
    const updateFrequency = 50 // Update every 50ms for smoother animation
    const progressIncrement = (updateFrequency / autoPlayInterval) * 100
    
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + progressIncrement
        return newProgress > 100 ? 100 : newProgress
      })
    }, updateFrequency)
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [currentSlide, autoPlayInterval])

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(nextSlide, autoPlayInterval)
    return () => clearInterval(interval)
  }, [nextSlide, autoPlayInterval])

  // Handle manual navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setProgress(0) // Reset progress when manually changing slides
  }

  return (
    <div className="relative">
      {/* Current slide */}
      {articles.length > 0 && (
        <FeaturedNews article={articles[currentSlide]} />
      )}
      
      {/* Indicator dots - active is pill-shaped, inactive are circular */}
      <div className="flex justify-center mt-6 gap-4">
        {articles.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative ${
              currentSlide === index 
                ? "w-6 h-1 rounded-full bg-[#333333]" 
                : "w-1 h-1 rounded-full bg-[#333333]"
            } overflow-hidden transition-all duration-300`}
            aria-label={`Go to slide ${index + 1}`}
          >
            {/* Only show progress bar for the active slide */}
            {currentSlide === index && (
              <div 
                className="absolute left-0 top-0 bottom-0 bg-[#edb900] rounded-full"
                style={{ width: `${progress}%` }}
              />
            )}
          </button>
        ))}
      </div>
    </div>   
    )
}