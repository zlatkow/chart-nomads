"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@supabase/supabase-js"
import { useUser } from "@clerk/nextjs"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface UpvoteButtonProps {
  reviewId: string
  initialUpvotes: number
  initialUserUpvoted: boolean
  className?: string
}

export default function UpvoteButton({
  reviewId,
  initialUpvotes = 0,
  initialUserUpvoted = false,
  className,
}: UpvoteButtonProps) {
  const [isUpvoted, setIsUpvoted] = useState(initialUserUpvoted)
  const [upvoteCount, setUpvoteCount] = useState(initialUpvotes)
  const [isLoading, setIsLoading] = useState(false)
  const { user, isSignedIn } = useUser()

  // Check if the user has already upvoted this review
  useEffect(() => {
    if (!isSignedIn || !user) return

    const checkUserUpvote = async () => {
      try {
        const { data, error } = await supabase
          .from("review_upvotes")
          .select("id")
          .eq("review_id", reviewId)
          .eq("user_id", user.id)
          .single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 is the error code for "no rows returned"
          console.error("Error checking upvote status:", error)
        }

        setIsUpvoted(!!data)
      } catch (error) {
        console.error("Exception when checking upvote status:", error)
      }
    }

    checkUserUpvote()
  }, [reviewId, user, isSignedIn])

  // Get the current upvote count
  useEffect(() => {
    const getUpvoteCount = async () => {
      try {
        const { data, error } = await supabase
          .from("propfirm_reviews")
          .select("upvotes_count")
          .eq("id", reviewId)
          .single()

        if (error) {
          console.error("Error fetching upvote count:", error)
          return
        }

        if (data) {
          setUpvoteCount(data.upvotes_count || 0)
        }
      } catch (error) {
        console.error("Exception when fetching upvote count:", error)
      }
    }

    getUpvoteCount()
  }, [reviewId])

  const handleUpvote = async () => {
    if (!isSignedIn || !user) {
      // Redirect to sign in or show a message
      alert("Please sign in to upvote reviews")
      return
    }

    setIsLoading(true)

    try {
      if (isUpvoted) {
        // Remove upvote
        const { error } = await supabase
          .from("review_upvotes")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", user.id)

        if (error) {
          console.error("Error removing upvote:", error)
          return
        }

        setIsUpvoted(false)
        setUpvoteCount((prev) => Math.max(0, prev - 1))
      } else {
        // Add upvote
        const { error } = await supabase.from("review_upvotes").insert({
          review_id: reviewId,
          user_id: user.id,
        })

        if (error) {
          console.error("Error adding upvote:", error)
          return
        }

        setIsUpvoted(true)
        setUpvoteCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Exception when handling upvote:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "text-gray-400 hover:text-black hover:bg-[#edb900]",
        isUpvoted && "text-black bg-[#edb900]/10",
        isLoading && "opacity-50 cursor-not-allowed",
        className,
      )}
      onClick={handleUpvote}
      disabled={isLoading}
    >
      <ThumbsUp className={cn("h-4 w-4 mr-1", isUpvoted && "fill-[#edb900]")} />
      Upvote {upvoteCount > 0 && `(${upvoteCount})`}
    </Button>
  )
}

