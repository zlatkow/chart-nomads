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
import CommentSection from "@/components/comment-section"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/router"

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
  author: string
  author_bio?: string
  author_image?: string
  image_url: string
  tags?: string[]
}

export default function NewsArticlePage() {
  const router = useRouter()
  const { slug } = router.query

  const [article, setArticle] = useState<News | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<News[]>([])
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
    <div className="container mx-auto px-4 py-8 bg-[#0f0f0f] text-white">
      <ReadingProgress />
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4 text-gray-300 hover:text-white hover:bg-[#1a1a1a]">
          <Link href="/news">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to News
          </Link>
        </Button>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">{article.name}</h1>

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
              <Tag className="h-3 w-3" />
              {article.category}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={article.author_image || "/placeholder.svg?height=80&width=80"} alt={article.author} />
              <AvatarFallback>{article.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-white">{article.author}</p>
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
          <article className="prose prose-lg prose-invert max-w-none" id={`article-${article.id}`}>
            <div dangerouslySetInnerHTML={{ __html: article.news_post_body }} />
          </article>

          {articleTags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#222]">
              <h3 className="text-lg font-semibold mb-2 text-white">Tags:</h3>
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
            <h3 className="text-lg font-semibold mb-4 text-white">About the Author</h3>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={article.author_image || "/placeholder.svg?height=80&width=80"} alt={article.author} />
                <AvatarFallback>{article.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-lg text-white">{article.author}</h4>
                <p className="text-gray-300">{article.author_bio || `Author of articles about ${article.category}.`}</p>
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
          <div className="sticky top-8">
            <div className="bg-[#0f0f0f] p-4 rounded-lg border border-[#222] mb-8 hover:bg-[#1a1a1a] transition-colors duration-200">
              <TableOfContents articleId={article.id.toString()} />
            </div>

            <div className="pt-6 border-t border-[#222]">
              <h3 className="text-lg font-semibold mb-4 text-white">Related Articles</h3>
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
          </div>
        </aside>
      </div>
    </div>
  )
}

