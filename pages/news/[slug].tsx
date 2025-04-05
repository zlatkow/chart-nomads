/* eslint-disable */
"use client"

import Link from "next/link"
import Image from "next/image"
// Import SignedIn and SignedOut components from Clerk
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs"
import { useState, useEffect, useContext } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CalendarIcon,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
  Tag,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
} from "lucide-react"
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

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Define News type based on database schema
interface News {
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
export default function NewsArticlePage() {
  const router = useRouter()
  const { slug } = router.query
  const { user } = useUser()
  const { toast } = useToast()

  const [article, setArticle] = useState<News | null>(null)
  const [authorData, setAuthorData] = useState<Author | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<News[]>([])
  const [relatedAuthors, setRelatedAuthors] = useState<Record<number, Author>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loadingBookmarks, setLoadingBookmarks] = useState(true)
  const [isCopied, setIsCopied] = useState(false)

  // Get the modal context
  const modalContext = useContext(ModalContext)

  // Check if the context is available
  if (!modalContext) {
    console.error("ModalContext is not available in NewsArticlePage")
  }

  const { setShowLoginModal } = modalContext || {
    setShowLoginModal: () => console.error("setShowLoginModal not available"),
  }

  // Function to handle login modal opening
  const handleLoginModalOpen = () => {
    console.log("Opening login modal from NewsArticlePage")
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
          .from("user_bookmarks")
          .select("*")
          .eq("user_id", user.id)
          .eq("article_id", article.id)
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
          .from("user_bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("article_id", article.id)

        if (error) {
          console.error("Error removing bookmark:", error)
          return
        }
      } else {
        // Add bookmark
        const { error } = await supabase.from("user_bookmarks").insert([
          {
            user_id: user.id,
            article_id: article.id,
            article_title: article.name,
            article_image: article.image_url,
            bookmarked_at: new Date().toISOString(),
          },
        ])

        if (error) {
          console.error("Error adding bookmark:", error)
          return
        }
      }

      // Update local state
      setIsBookmarked(!isBookmarked)
    } catch (err) {
      console.error("Error toggling bookmark:", err)
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
            })
            setTimeout(() => setIsCopied(false), 2000)
          })
          .catch((err) => {
            console.error("Failed to copy: ", err)
            toast({
              title: "Copy failed",
              description: "Failed to copy the link. Please try again.",
              variant: "destructive",
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

        // Fetch related articles from the same category
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
          setRelatedArticles(relatedData)

          // Get unique author IDs from related articles
          const authorIds = Array.from(new Set(relatedData.map((item) => item.author)))

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
      const shareMenu = document.getElementById("share-menu")
      const shareButton = event.target as Element

      if (
        shareMenu &&
        !shareMenu.contains(shareButton) &&
        !shareButton.closest("button")?.contains(shareButton) &&
        !shareMenu.classList.contains("hidden")
      ) {
        shareMenu.classList.remove("opacity-100", "scale-100")
        setTimeout(() => {
          shareMenu.classList.add("hidden")
        }, 200)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Show loading state while article is being fetched
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-[#0f0f0f] text-white">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#edb900]"></div>
        </div>
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
            <Link href="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
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
              <Link href="/news">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to News
              </Link>
            </Button>

            <div className="flex gap-2">
              {/* Share button */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-[#222] bg-[#1a1a1a] text-gray-300 hover:text-white hover:bg-[#222]"
                  onClick={() => {
                    const shareMenu = document.getElementById("share-menu")
                    if (shareMenu) {
                      if (shareMenu.classList.contains("hidden")) {
                        shareMenu.classList.remove("hidden")
                        setTimeout(() => {
                          shareMenu.classList.add("opacity-100", "scale-100")
                        }, 10)
                      } else {
                        shareMenu.classList.remove("opacity-100", "scale-100")
                        setTimeout(() => {
                          shareMenu.classList.add("hidden")
                        }, 200)
                      }
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share article</span>
                </Button>
                <div
                  id="share-menu"
                  className="hidden absolute right-0 top-full mt-2 flex items-center h-9 bg-[#1a1a1a] border border-[#222] rounded-lg px-2 opacity-0 transform scale-95 origin-top-right transition-all duration-200 ease-in-out"
                >
                  <button className="p-2 hover:bg-[#222] rounded-md" onClick={() => handleShare("facebook")}>
                    <Facebook className="h-4 w-4 text-[#1877F2]" />
                    <span className="sr-only">Share on Facebook</span>
                  </button>
                  <button className="p-2 hover:bg-[#222] rounded-md" onClick={() => handleShare("twitter")}>
                    <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                    <span className="sr-only">Share on Twitter</span>
                  </button>
                  <button className="p-2 hover:bg-[#222] rounded-md" onClick={() => handleShare("linkedin")}>
                    <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                    <span className="sr-only">Share on LinkedIn</span>
                  </button>
                  <button className="p-2 hover:bg-[#222] rounded-md" onClick={() => handleShare("copy")}>
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    <span className="sr-only">{isCopied ? "Copied!" : "Copy Link"}</span>
                  </button>
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
                  className={`border-[#222] ${
                    isBookmarked ? "bg-[#edb900] text-[#0f0f0f]" : "bg-[#1a1a1a] text-gray-300"
                  } hover:text-white hover:bg-[#222]`}
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
              <div className="flex items-center gap-3 mt-auto">
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
            <div className="relative w-full h-[300px] md:h-full rounded-lg overflow-hidden">
              <Image
                src={article.image_url || "/placeholder.svg?height=600&width=1200"}
                alt={article.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-twitter"
                          >
                            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                          </svg>
                        </a>
                      )}
                      {authorData.linkedin_link && (
                        <a
                          href={authorData.linkedin_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-[#edb900]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-linkedin"
                          >
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                            <rect width="4" height="12" x="2" y="9" />
                            <circle cx="4" cy="4" r="2" />
                          </svg>
                        </a>
                      )}
                      {authorData.instagram_link && (
                        <a
                          href={authorData.instagram_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-[#edb900]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-instagram"
                          >
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                          </svg>
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
              <CommentSection type="news" itemId={article.id.toString()} onLoginModalOpen={handleLoginModalOpen} />
            </div>
          </div>

          <aside className="space-y-8">
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
                        <div className="flex gap-3 p-3 rounded-lg bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-colors duration-200">
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
      <Community />
      <Newsletter />
      <Footer />
    </div>
    </div>
  );
}