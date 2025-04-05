/* eslint-disable */
"use client"

import Link from "next/link"
import Image from "next/image"
// Import SignedIn and SignedOut components from Clerk
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs"
import { useState, useEffect, useContext, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, Clock, ArrowLeft, Share2, Bookmark, Tag, Facebook, Copy, Check } from "lucide-react"
import { ReadingProgress } from "@/components/news-page/reading-progress"
import { TableOfContents } from "@/components/news-page/table-of-contents"
import { NewsletterSignup } from "@/components/news-page/newsletter-signup"
import CommentSection from "@/components/comment-section"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/router"
import Navbar from "../../components/Navbar"
import Noise from "../../components/Noise"
import Community from "../../components/Community"
import Newsletter from "../../components/Newsletter"
import Footer from "../../components/Footer"
import { ModalContext } from "../../pages/_app"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { FiLinkedin } from "react-icons/fi"
import { RiInstagramLine } from "react-icons/ri"
import { RiTwitterXFill } from "react-icons/ri"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Define Blogs type based on database schema
interface Blogs {
  id: number
  created_at: string
  name: string
  slug: string
  summary: string
  news_post_body: string
  read_time: number
  featured: boolean
  category: string
  author: number // Changed from string to number (ID reference to authors table)
  author_bio?: string
  author_image?: string
  image_url: string
  tags?: string[]
}

// Define Author type based on database schema
interface Author {
  id: number
  name: string
  profile_pic: string
  x_link?: string
  instagram_link?: string
  linkedin_link?: string
  author_bio?: string // Add this field
}

// Add useUser hook and bookmark state
export default function BlogsArticlePage() {
  const router = useRouter()
  const { slug } = router.query
  const { user } = useUser()
  const { toast } = useToast()

  const [article, setArticle] = useState<Blogs | null>(null)
  const [authorData, setAuthorData] = useState<Author | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Blogs[]>([])
  const [relatedAuthors, setRelatedAuthors] = useState<Record<number, Author>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loadingBookmarks, setLoadingBookmarks] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)
  const shareButtonRef = useRef<HTMLButtonElement>(null)

  // Get the modal context
  const modalContext = useContext(ModalContext)

  // Check if the context is available
  if (!modalContext) {
    console.error("ModalContext is not available in BlogsArticlePage")
  }

  const { setShowLoginModal } = modalContext || {
    setShowLoginModal: () => console.error("setShowLoginModal not available"),
  }

  // Function to handle login modal opening
  const handleLoginModalOpen = () => {
    console.log("Opening login modal from BlogsArticlePage")
    if (setShowLoginModal) {
      // Use setTimeout to ensure this runs after the current event cycle
      setTimeout(() => {
        setShowLoginModal(true)
      }, 0)
    } else {
      console.error("setShowLoginModal is not available")
    }
  }

  // Check if article is bookmarked when user is available
  useEffect(() => {
    if (!user || !article) {
      setLoadingBookmarks(false)
      return
    }

    const checkBookmarkStatus = async () => {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        const { data, error } = await supabase
          .from("bookmarks")
          .select("*")
          .eq("user_id", user.id)
          .eq("post_id", article.id)
          .eq("post_type", "news")
          .single()

        if (error && error.code !== "PGRST116") {
          console.error("Error checking bookmark status:", error)
        }

        setIsBookmarked(!!data)
        setLoadingBookmarks(false)
      } catch (err) {
        console.error("Error checking bookmark status:", err)
        setLoadingBookmarks(false)
      }
    }

    checkBookmarkStatus()
  }, [user, article])

  // Handle bookmark toggle
  const handleBookmarkToggle = async () => {
    if (!user || !article) {
      handleLoginModalOpen()
      return
    }

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", article.id)
          .eq("post_type", "news")

        if (error) {
          console.error("Error removing bookmark:", error)
          // Show error toast with icon
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to remove bookmark. Please try again.",
            action: (
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <Bookmark className="h-4 w-4 text-red-500" />
              </div>
            ),
          })
          return
        }

        // Show success toast with icon
        toast({
          title: "Bookmark removed",
          description: "Article has been removed from your bookmarks.",
          action: (
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
              <Bookmark className="h-4 w-4 text-gray-500" />
            </div>
          ),
        })
      } else {
        // Add bookmark
        const { error } = await supabase.from("bookmarks").insert([
          {
            user_id: user.id,
            post_id: article.id,
            post_type: "news", // Explicitly set post_type to "news"
            created_at: new Date().toISOString(),
          },
        ])

        if (error) {
          console.error("Error adding bookmark:", error)
          // Show error toast with icon
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to bookmark article. Please try again.",
            action: (
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <Bookmark className="h-4 w-4 text-red-500" />
              </div>
            ),
          })
          return
        }

        // Show success toast with icon
        toast({
          title: "Bookmark added",
          description: "Article has been added to your bookmarks.",
          action: (
            <div className="h-8 w-8 bg-[#edb900] rounded-full flex items-center justify-center mr-3">
              <Bookmark className="h-4 w-4 fill-current text-[#0f0f0f]" />
            </div>
          ),
        })
      }

      // Update local state
      setIsBookmarked(!isBookmarked)
    } catch (err) {
      console.error("Error toggling bookmark:", err)
      // Show error toast with icon
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
        action: (
          <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <Bookmark className="h-4 w-4 text-red-500" />
          </div>
        ),
      })
    }
  }

  // Handle sharing functionality
  const handleShare = (platform: string) => {
    if (!article) return

    const currentUrl = typeof window !== "undefined" ? window.location.href : ""
    const articleTitle = article.name
    const articleSummary = article.summary || ""

    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(currentUrl)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
        break
      case "copy":
        navigator.clipboard
          .writeText(currentUrl)
          .then(() => {
            setIsCopied(true)
            toast({
              title: "Link copied!",
              description: "The article link has been copied to your clipboard.",
              action: (
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Copy className="h-4 w-4 text-green-500" />
                </div>
              ),
            })
            setTimeout(() => setIsCopied(false), 2000)
          })
          .catch((err) => {
            console.error("Failed to copy: ", err)
            toast({
              title: "Copy failed",
              description: "Failed to copy the link. Please try again.",
              variant: "destructive",
              action: (
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <Copy className="h-4 w-4 text-red-500" />
                </div>
              ),
            })
          })
        return
      default:
        return
    }

    // Open share URL in a new window
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  useEffect(() => {
    // Only fetch when slug is available from router
    if (!slug) return

    async function fetchArticle() {
      try {
        if (!supabaseUrl || !supabaseAnonKey) {
          setError("Supabase credentials are missing")
          setLoading(false)
          return
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Add debug info
        console.log(`Fetching article with slug: ${slug}`)

        // Fetch the article by slug
        const { data: articleData, error: articleError } = await supabase
          .from("news")
          .select("*")
          .eq("slug", slug)
          .single()

        if (articleError) {
          console.error("Error fetching article:", articleError)
          setError(`Failed to fetch article: ${articleError.message}`)
          setLoading(false)
          return
        }

        if (!articleData) {
          setError("Article not found")
          setLoading(false)
          return
        }

        setArticle(articleData)

        // Fetch author data
        if (articleData.author) {
          const { data: authorData, error: authorError } = await supabase
            .from("authors")
            .select("*")
            .eq("id", articleData.author)
            .single()

          if (authorError) {
            console.error("Error fetching author data:", authorError)
          } else if (authorData) {
            setAuthorData(authorData)
          }
        }

        // Fetch related articles from the same category - limit to exactly 3
        const { data: relatedData, error: relatedError } = await supabase
          .from("news")
          .select("*")
          .eq("category", articleData.category)
          .neq("slug", slug) // Exclude current article
          .order("created_at", { ascending: false })
          .limit(3)

        if (relatedError) {
          console.error("Error fetching related articles:", relatedError)
        } else if (relatedData) {
          // Ensure we only show a maximum of 3 related articles
          setRelatedArticles(relatedData.slice(0, 3))

          // Get unique author IDs from related articles
          const authorIds = Array.from(new Set(relatedData.slice(0, 3).map((item) => item.author)))

          // Fetch all related authors in one query
          if (authorIds.length > 0) {
            const { data: authorsData, error: authorsError } = await supabase
              .from("authors")
              .select("*")
              .in("id", authorIds)

            if (authorsError) {
              console.error("Error fetching related authors:", authorsError)
            } else if (authorsData) {
              // Create a map of author id to author data
              const authorsMap: Record<number, Author> = {}
              authorsData.forEach((author) => {
                authorsMap[author.id] = author
              })
              setRelatedAuthors(authorsMap)
            }
          }
        }

        setLoading(false)
      } catch (err) {
        console.error("Error in article data fetching:", err)
        setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`)
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug]) // Add slug as a dependency

  // Close share menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        shareMenuRef.current &&
        shareButtonRef.current &&
        !shareMenuRef.current.contains(event.target as Node) &&
        !shareButtonRef.current.contains(event.target as Node) &&
        isShareMenuOpen
      ) {
        setIsShareMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isShareMenuOpen])

  // Show loading state while article is being fetched
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-[#0f0f0f] text-white">
        <div className="w-full max-w-[1280px] mx-auto">
          {/* Navigation skeleton */}
          <div className="flex items-center justify-between mb-10">
            <div className="w-32 h-9 bg-[#1a1a1a] rounded-md overflow-hidden relative shimmer-effect"></div>
            <div className="flex gap-2">
              <div className="w-9 h-9 bg-[#1a1a1a] rounded-md overflow-hidden relative shimmer-effect"></div>
              <div className="w-9 h-9 bg-[#1a1a1a] rounded-md overflow-hidden relative shimmer-effect"></div>
            </div>
          </div>

          {/* Two-column layout skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Left column - Text content skeleton */}
            <div className="flex flex-col">
              {/* Title skeleton */}
              <div className="h-12 bg-[#1a1a1a] rounded-md mb-4 w-full overflow-hidden relative shimmer-effect"></div>
              <div className="h-12 bg-[#1a1a1a] rounded-md mb-6 w-3/4 overflow-hidden relative shimmer-effect"></div>

              {/* Metadata skeleton */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="h-6 w-32 bg-[#1a1a1a] rounded-full overflow-hidden relative shimmer-effect"></div>
                <div className="h-6 w-24 bg-[#1a1a1a] rounded-full overflow-hidden relative shimmer-effect"></div>
                <div className="h-6 w-20 bg-[#1a1a1a] rounded-full overflow-hidden relative shimmer-effect"></div>
              </div>

              {/* Author skeleton */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-[#1a1a1a] rounded-full overflow-hidden relative shimmer-effect"></div>
                <div className="flex flex-col gap-2">
                  <div className="h-5 w-32 bg-[#1a1a1a] rounded-md overflow-hidden relative shimmer-effect"></div>
                  <div className="h-4 w-16 bg-[#1a1a1a] rounded-md overflow-hidden relative shimmer-effect"></div>
                </div>
              </div>
            </div>

            {/* Right column - Featured image skeleton */}
            <div className="w-full h-[400px] bg-[#1a1a1a] rounded-lg overflow-hidden relative shimmer-effect"></div>
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 mt-12">
            <div className="space-y-6">
              <div className="h-4 bg-[#1a1a1a] rounded-md w-full overflow-hidden relative shimmer-effect"></div>
              <div className="h-4 bg-[#1a1a1a] rounded-md w-full overflow-hidden relative shimmer-effect"></div>
              <div className="h-4 bg-[#1a1a1a] rounded-md w-5/6 overflow-hidden relative shimmer-effect"></div>
              <div className="h-4 bg-[#1a1a1a] rounded-md w-full overflow-hidden relative shimmer-effect"></div>
              <div className="h-4 bg-[#1a1a1a] rounded-md w-4/5 overflow-hidden relative shimmer-effect"></div>
              <div className="h-4 bg-[#1a1a1a] rounded-md w-full overflow-hidden relative shimmer-effect"></div>
              <div className="h-4 bg-[#1a1a1a] rounded-md w-3/4 overflow-hidden relative shimmer-effect"></div>

              <div className="pt-6 mt-6 border-t border-[#222]">
                <div className="h-8 bg-[#1a1a1a] rounded-md w-48 mb-4 overflow-hidden relative shimmer-effect"></div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 w-20 bg-[#1a1a1a] rounded-full overflow-hidden relative shimmer-effect"></div>
                  <div className="h-6 w-24 bg-[#1a1a1a] rounded-full overflow-hidden relative shimmer-effect"></div>
                  <div className="h-6 w-16 bg-[#1a1a1a] rounded-full overflow-hidden relative shimmer-effect"></div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#222]">
                <div className="h-8 bg-[#1a1a1a] rounded-md w-48 mb-4 overflow-hidden relative shimmer-effect"></div>
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 bg-[#1a1a1a] rounded-full overflow-hidden relative shimmer-effect"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-[#1a1a1a] rounded-md w-48 mb-2 overflow-hidden relative shimmer-effect"></div>
                    <div className="h-4 bg-[#1a1a1a] rounded-md w-full overflow-hidden relative shimmer-effect"></div>
                    <div className="h-4 bg-[#1a1a1a] rounded-md w-5/6 mt-2 overflow-hidden relative shimmer-effect"></div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-8">
              <div className="bg-[#1a1a1a] p-4 rounded-lg h-64 overflow-hidden relative shimmer-effect"></div>
              <div className="pt-6 border-t border-[#222]">
                <div className="h-8 bg-[#1a1a1a] rounded-md w-48 mb-4 overflow-hidden relative shimmer-effect"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#222]">
                      <div className="h-16 w-16 bg-[#222] rounded-md overflow-hidden relative shimmer-effect"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-[#222] rounded-md w-full mb-2 overflow-hidden relative shimmer-effect"></div>
                        <div className="h-3 bg-[#222] rounded-md w-24 overflow-hidden relative shimmer-effect"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>

        <style jsx global>{`
          .shimmer-effect {
            position: relative;
            overflow: hidden;
          }

          .shimmer-effect::after {
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            transform: translateX(-100%);
            background-image: linear-gradient(
              90deg,
              rgba(34, 34, 34, 0) 0,
              rgba(34, 34, 34, 0.2) 20%,
              rgba(237, 185, 0, 0.1) 60%,
              rgba(34, 34, 34, 0)
            );
            animation: shimmer 2s infinite;
          }

          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    )
  }

  // Show error state
  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8 bg-[#0f0f0f] text-white">
        <div className="flex flex-col justify-center items-center h-64">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-300">{error || "Article not found"}</p>
          <Button variant="ghost" size="sm" asChild className="mt-4 text-gray-300 hover:text-white hover:bg-[#1a1a1a]">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Parse tags if they exist in the database as a string
  const articleTags = article.tags || []

  return (
    <div>
      <Navbar />
      <ReadingProgress />
      <Noise />
      <div className="relative z-20 max-w-[1280px] container mt-[200px] mb-[100px] mx-auto px-4 py-8 text-white">
        <div className="mb-8">
          {/* Top navigation row with back button and share/bookmark buttons */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" asChild className="text-gray-300 hover:text-white hover:bg-[#1a1a1a]">
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>

            <div className="flex gap-2">
              {/* Share button */}
              <div className="relative">
                <Button
                  ref={shareButtonRef}
                  variant="outline"
                  size="icon"
                  className={`border-[#222] ${isShareMenuOpen ? "bg-[#222]" : "bg-[#1a1a1a]"} text-gray-300 hover:text-white hover:bg-[#222] z-10 relative`}
                  onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                  aria-label="Share article"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share article</span>
                </Button>

                <div
                  ref={shareMenuRef}
                  className={`absolute right-0 top-0 flex items-center h-9 bg-[#1a1a1a] border border-[#222] rounded-l-lg px-2 transition-all duration-500 ease-in-out overflow-hidden ${
                    isShareMenuOpen ? "opacity-100 w-[170px]" : "opacity-0 w-0"
                  }`}
                  style={{
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    transform: "translateX(-8px)",
                  }}
                >
                  <div className="flex items-center whitespace-nowrap">
                    <button className="p-2 hover:bg-[#222] rounded-md" onClick={() => handleShare("facebook")}>
                      <Facebook className="h-4 w-4" />
                      <span className="sr-only">Share on Facebook</span>
                    </button>
                    <button className="p-2 hover:bg-[#222] rounded-md" onClick={() => handleShare("twitter")}>
                      <RiTwitterXFill className="h-4 w-4" />
                      <span className="sr-only">Share on Twitter</span>
                    </button>
                    <button className="p-2 hover:bg-[#222] rounded-md" onClick={() => handleShare("linkedin")}>
                      <FiLinkedin className="h-4 w-4" />
                      <span className="sr-only">Share on LinkedIn</span>
                    </button>
                    <button className="p-2 hover:bg-[#222] rounded-md" onClick={() => handleShare("copy")}>
                      {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      <span className="sr-only">{isCopied ? "Copied!" : "Copy Link"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bookmark button with conditional rendering based on auth state */}
              <SignedOut>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-[#222] bg-[#1a1a1a] text-gray-300 hover:text-white hover:bg-[#222]"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleLoginModalOpen()
                  }}
                >
                  <Bookmark className="h-4 w-4" />
                  <span className="sr-only">Save article</span>
                </Button>
              </SignedOut>

              <SignedIn>
                <Button
                  variant="outline"
                  size="icon"
                  className={`border-[#222] transition-all duration-200 ${
                    isBookmarked
                      ? "bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90"
                      : "bg-[#1a1a1a] text-gray-300 hover:text-white hover:bg-[#222]"
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleBookmarkToggle()
                  }}
                  disabled={loadingBookmarks}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                  <span className="sr-only">{isBookmarked ? "Remove bookmark" : "Save article"}</span>
                </Button>
              </SignedIn>
            </div>
          </div>

          {/* Two-column layout with text on left, image on right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left column - Text content */}
            <div className="flex flex-col">
              {/* Article title */}
              <h1 className="text-4xl md:text-5xl tracking-tight mb-4 text-white">{article.name}</h1>

              {/* Article metadata */}
              <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-6">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{new Date(article.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{article.read_time} min read</span>
                </div>
                <div className="flex items-center">
                  <Badge className="bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90 hover:text-[#0f0f0f] flex items-center gap-1">
                    {article.category}
                  </Badge>
                </div>
              </div>

              {/* Author information */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={authorData?.profile_pic || "/placeholder.svg?height=80&width=80"}
                    alt={authorData?.name || "Author"}
                  />
                  <AvatarFallback>{authorData?.name?.charAt(0) || "A"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">{authorData?.name || "Unknown Author"}</p>
                  <p className="text-sm text-gray-400">Author</p>
                </div>
              </div>
            </div>

            {/* Right column - Featured image */}
            <div className="relative w-full h-[400px] md:h-[400px] rounded-lg overflow-hidden">
              <Image
                src={article.image_url || "/placeholder.svg?height=600&width=1200"}
                alt={article.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 mt-12">
            <div>
              <article className="article prose prose-lg prose-invert max-w-none" id={`article-${article.id}`}>
                <div dangerouslySetInnerHTML={{ __html: article.news_post_body }} />
              </article>

              {articleTags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-[#222]">
                  <div className="flex">
                    <Tag className="text-white mt-2 mr-1 h-4 w-4" />
                    <h3 className="text-lg mb-2 text-white">Tags:</h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {articleTags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="border-[#222] text-gray-300 hover:text-white">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-[#222]">
                <h3 className="text-lg mb-4 text-white">About the Author</h3>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={authorData?.profile_pic || "/placeholder.svg?height=80&width=80"}
                        alt={authorData?.name || "Author"}
                      />
                      <AvatarFallback>{authorData?.name?.charAt(0) || "A"}</AvatarFallback>
                    </Avatar>
                    {authorData && (
                      <div className="flex gap-3 mt-2">
                        {authorData.x_link && (
                          <a
                            href={authorData.x_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-[#edb900]"
                          >
                            <RiTwitterXFill className="h-4 w-4" />
                          </a>
                        )}
                        {authorData.linkedin_link && (
                          <a
                            href={authorData.linkedin_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-[#edb900]"
                          >
                            <FiLinkedin className="h-4 w-4"/>
                          </a>
                        )}
                        {authorData.instagram_link && (
                          <a
                            href={authorData.instagram_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-[#edb900]"
                          >
                            <RiInstagramLine className="h-4 w-4"/>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-lg text-white">{authorData?.name || "Unknown Author"}</h4>
                    <p className="text-gray-300">
                      {authorData?.author_bio || `Author of articles about ${article.category}.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comment Section */}
              <div className="mt-12 pt-8 border-t border-[#222]">
                <CommentSection type="blogs" itemId={article.id.toString()} onLoginModalOpen={handleLoginModalOpen} />
              </div>
            </div>

            <aside className="space-y-8 lg:block">
              <div className="sticky top-[100px]">
                <div className="bg-[#0f0f0f] p-4 rounded-lg border border-[#222] mb-8 hover:bg-[#1a1a1a] transition-colors duration-200">
                  <TableOfContents articleId={article.id.toString()} />
                </div>

                <div className="pt-6 border-t border-[#222]">
                  <h3 className="text-lg mb-4 text-white">Related Articles</h3>
                  {relatedArticles.length > 0 ? (
                    <div className="space-y-4">
                      {relatedArticles.map((relatedArticle) => (
                        <Link href={`/news/${relatedArticle.slug}`} key={relatedArticle.id} className="block group">
                          <div className="flex gap-3 p-3 rounded-lg bg-[#0f0f0f] hover:bg-[#1a1a1a] border border-[#222] transition-colors duration-200">
                            <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                              <Image
                                src={relatedArticle.image_url || "/placeholder.svg?height=64&width=64"}
                                alt={relatedArticle.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col justify-center">
                              <h4 className="font-medium line-clamp-2 text-sm text-gray-200 group-hover:text-[#edb900] transition-colors">
                                {relatedArticle.name}
                              </h4>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(relatedArticle.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No related articles found.</p>
                  )}
                </div>

                {/* Newsletter Signup */}
                <div className="mt-8 pt-6 border-t border-[#222]">
                  <NewsletterSignup />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Community />
      <Newsletter />
      <Footer />
      <Toaster />
    </div>
  )
}

