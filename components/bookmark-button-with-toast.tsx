"use client"

import { useState } from "react"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

interface BookmarkButtonProps {
  userId: string | null
  postId: number
  postType: string
  isBookmarked: boolean
  onLoginRequired: () => void
  onBookmarkChange?: (isBookmarked: boolean) => void
  className?: string
}

export function BookmarkButtonWithToast({
  userId,
  postId,
  postType,
  isBookmarked: initialIsBookmarked,
  onLoginRequired,
  onBookmarkChange,
  className = "",
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleBookmarkToggle = async () => {
    if (!userId) {
      onLoginRequired()
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", userId)
          .eq("post_id", postId)
          .eq("post_type", postType)

        if (error) {
          console.error("Error removing bookmark:", error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to remove bookmark. Please try again.",
          })
          return
        }

        // Show success message
        toast({
          title: "Bookmark removed",
          description: `${postType === "news" ? "Article" : "Item"} has been removed from your bookmarks.`,
        })
      } else {
        // Add bookmark
        const { error } = await supabase.from("bookmarks").insert([
          {
            user_id: userId,
            post_id: postId,
            post_type: postType,
            created_at: new Date().toISOString(),
          },
        ])

        if (error) {
          console.error("Error adding bookmark:", error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to bookmark item. Please try again.",
          })
          return
        }

        // Show success message
        toast({
          title: "Bookmark added",
          description: `${postType === "news" ? "Article" : "Item"} has been added to your bookmarks.`,
        })
      }

      // Update local state
      setIsBookmarked(!isBookmarked)
      if (onBookmarkChange) {
        onBookmarkChange(!isBookmarked)
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={`border-[#222] transition-all duration-200 ${
        isBookmarked
          ? "bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90"
          : "bg-[#1a1a1a] text-gray-300 hover:text-white hover:bg-[#222]"
      } ${className}`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleBookmarkToggle()
      }}
      disabled={isLoading}
    >
      <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
      <span className="sr-only">{isBookmarked ? "Remove bookmark" : "Save item"}</span>
    </Button>
  )
}

