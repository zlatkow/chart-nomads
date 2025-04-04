/* eslint-disable */
"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, Clock, ArrowLeft, Share2, Bookmark, Tag } from "lucide-react"
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

export default function NewsArticlePage() {
  const router = useRouter()
  const { slug } = router.query

  const [article, setArticle] = useState<News | null>(null)
  const [authorData, setAuthorData] = useState<Author | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<News[]>([])
  const [relatedAuthors, setRelatedAuthors] = useState<Record<number, Author>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

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
      <div className="relative z-20 container mt-[200px] mb-[100px] mx-auto px-4 py-8 text-white">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4 text-gray-300 hover:text-white hover:bg-[#1a1a1a]">
            <Link href="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Link>
          </Button>

          <h1 className="text-4xl md:text-5xl tracking-tight mb-4 text-white">{article.name}</h1>

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

          <div className="flex items-center justify-between">
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

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="border-[#222] bg-[#1a1a1a] text-gray-300 hover:text-white hover:bg-[#222]"
              >
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Share article</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-[#222] bg-[#1a1a1a] text-gray-300 hover:text-white hover:bg-[#222]"
              >
                <Bookmark className="h-4 w-4" />
                <span className="sr-only">Save article</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative w-full h-[400px] md:h-[500px] mb-8 rounded-lg overflow-hidden">
          <Image
            src={article.image_url || "/placeholder.svg?height=600&width=1200"}
            alt={article.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          <div>
            <article className="article prose prose-lg prose-invert max-w-none" id={`article-${article.id}`}>
              <div dangerouslySetInnerHTML={{ __html: article.news_post_body }} />
            </article>

            {articleTags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[#222]">
                <div className="flex">
                    <Tag className="text-white mt-3 mr-1 h-3 w-3" />
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
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={authorData?.profile_pic || "/placeholder.svg?height=80&width=80"}
                    alt={authorData?.name || "Author"}
                  />
                  <AvatarFallback>{authorData?.name?.charAt(0) || "A"}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-lg text-white">{authorData?.name || "Unknown Author"}</h4>
                  <p className="text-gray-300">
                    {authorData?.author_bio || `Author of articles about ${article.category}.`}
                  </p>
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
              </div>
            </div>

            {/* Comment Section */}
            <div className="mt-12 pt-8 border-t border-[#222]">
              <CommentSection
                type="news"
                itemId={article.id.toString()}
                onLoginModalOpen={() => setIsLoginModalOpen(true)}
              />
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
  )
}

