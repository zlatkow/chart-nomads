/* eslint-disable */
"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs_news"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination_news"
import { NewsCard } from "@/components/news-page/news-card"
import { FeaturedNews } from "@/components/news-page/featured-news"
import Navbar from "../components/Navbar"
import Noise from "../components/Noise"
import Community from "../components/Community"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"
import { createClient } from "@supabase/supabase-js"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

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
  image_url: string
}

// Define Author type based on database schema
interface Author {
  id: number
  name: string
  profile_pic: string
  x_link?: string
  instagram_link?: string
  linkedin_link?: string
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [authors, setAuthors] = useState<Record<number, Author>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12) 

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  // Fetch news from Supabase
  useEffect(() => {
    async function fetchNews() {
      try {
        if (!supabaseUrl || !supabaseAnonKey) {
          setError("Supabase credentials are missing")
          setLoading(false)
          return
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        const { data, error: supabaseError } = await supabase.from("news").select("*")

        if (supabaseError) {
          console.error("Error fetching news:", supabaseError)
          setError("Failed to fetch news posts")
          setLoading(false)
          return
        }

        if (data) {
          setNews(data as News[])

          // Get unique author IDs
          const authorIds = Array.from(new Set(data.map((item) => item.author)))

          // Fetch all authors in one query
          if (authorIds.length > 0) {
            const { data: authorsData, error: authorsError } = await supabase
              .from("authors")
              .select("*")
              .in("id", authorIds)

            if (authorsError) {
              console.error("Error fetching authors:", authorsError)
            } else if (authorsData) {
              // Create a map of author id to author data
              const authorsMap: Record<number, Author> = {}
              authorsData.forEach((author) => {
                authorsMap[author.id] = author
              })
              setAuthors(authorsMap)
            }
          }
        }
        setLoading(false)
      } catch (err) {
        console.error("Error in news data fetching:", err)
        setError("An unexpected error occurred")
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  // Get featured news
  const featuredArticle = news.length > 0 ? news.find((item) => item && item.featured) || news[0] : null

  // Get unique categories from fetched news
  const categories = [
    "All",
    ...Array.from(new Set(news.filter((item) => item && item.category).map((item) => item.category))),
  ]

  // Filter news by category and search query
  const getFilteredNews = () => {
    let filtered = news

    // Filter by category
    if (activeCategory !== "All") {
      filtered = filtered.filter((item) => item.category === activeCategory)
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.summary.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    return filtered
  }

  const filteredNews = getFilteredNews()

  return (
    <div>
      <Navbar />
      <Noise />
      <div className="relative z-50 container mx-auto px-4 py-8 text-white mt-[200px] max-w-[1280px] mb-[100px]">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-4xl tracking-tight text-white">Latest News</h1>
          <p className="text-gray-400">Stay updated with the latest developments in financial markets</p>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-8 text-center text-white mb-16">
            <p>Loading news posts...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-[#0f0f0f] p-8 text-center text-red-500 mb-16">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && featuredArticle && (
          <FeaturedNews
            article={{
              id: featuredArticle.id.toString(),
              title: featuredArticle.name,
              excerpt: featuredArticle.summary,
              category: featuredArticle.category,
              slug: featuredArticle.slug,
              date: new Date(featuredArticle.created_at).toLocaleDateString(),
              author: authors[featuredArticle.author]?.name || "Unknown Author",
              authorImage: authors[featuredArticle.author]?.profile_pic || "/placeholder.svg?height=40&width=40",
              image: featuredArticle.image_url || "/placeholder.svg?height=600&width=1200",
              readTime: `${featuredArticle.read_time} min read`,
            }}
          />
        )}

        <div className="my-12">
          <Tabs defaultValue="All" className="w-full" value={activeCategory} onValueChange={setActiveCategory}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="w-[300px]">
                <Search className="relative left-2.5 top-6 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  className="searchDark w-full pl-8 bg-[#333333] border-[#333333] focus-visible:ring-[#edb900]"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("")
                    }}
                    className="relative right-[-275px] top-[-27px] h-4 w-4 text-[#edb900] hover:text-[#edb900]/80"
                    aria-label="Clear search"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <TabsList className="bg-[#1a1a1a] overflow-x-auto flex-wrap">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="data-[state=active]:bg-[#edb900] data-[state=active]:text-[#0f0f0f] transition-colors duration-300 ease-in-out hover:text-[#edb900]"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="mt-0">
                {!loading && !error && filteredNews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                      <NewsCard
                        key={item.id}
                        article={{
                          id: item.id.toString(),
                          title: item.name,
                          excerpt: item.summary,
                          slug: item.slug,
                          category: item.category,
                          date: new Date(item.created_at).toLocaleDateString(),
                          author: authors[item.author]?.name || "Unknown Author",
                          authorImage:
                            authors[featuredArticle.author]?.profile_pic || "/placeholder.svg?height=40&width=40",
                          image: item.image_url || "/placeholder.svg?height=400&width=600",
                          readTime: `${item.read_time} min read`,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/70">
                    {loading ? "Loading..." : error ? "Error loading news" : "No news articles found"}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Dynamic Pagination */}
        {filteredNews.length > itemsPerPage && (
          <Pagination className="my-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) setCurrentPage(currentPage - 1)
                  }}
                  className={`bg-[#0f0f0f] border border-[#222] text-white hover:bg-[#1a1a1a] hover:text-white w-24 justify-center ${
                    currentPage === 1 ? "opacity-50 pointer-events-none" : ""
                  }`}
                />
              </PaginationItem>

              {/* Create an array of page numbers to display */}
              {(() => {
                const totalPages = Math.ceil(filteredNews.length / itemsPerPage)
                let pagesToShow = []

                // Always include page 1
                pagesToShow.push(1)

                // Add ellipsis after page 1 if current page is > 3
                if (currentPage > 3) {
                  pagesToShow.push("ellipsis1")
                }

                // Add page before current if it exists and isn't page 1
                if (currentPage > 2) {
                  pagesToShow.push(currentPage - 1)
                }

                // Add current page if it's not page 1
                if (currentPage > 1 && currentPage < totalPages) {
                  pagesToShow.push(currentPage)
                }

                // Add page after current if it exists and isn't the last page
                if (currentPage < totalPages - 1) {
                  pagesToShow.push(currentPage + 1)
                }

                // Add ellipsis before last page if needed
                if (currentPage < totalPages - 2) {
                  pagesToShow.push("ellipsis2")
                }

                // Always include last page if it's not page 1
                if (totalPages > 1) {
                  pagesToShow.push(totalPages)
                }

                // Remove duplicates
                pagesToShow = [...new Set(pagesToShow)]

                return pagesToShow.map((page, index) => {
                  if (page === "ellipsis1" || page === "ellipsis2") {
                    return (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis className="bg-[#0f0f0f] border border-[#222] text-white rounded-md h-9 w-9 flex items-center justify-center" />
                      </PaginationItem>
                    )
                  }

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(page)
                        }}
                        isActive={currentPage === page}
                        className={
                          currentPage === page
                            ? "bg-[#edb900] text-[#0f0f0f] border-[#edb900] hover:bg-[#edb900]/90"
                            : "bg-[#0f0f0f] border border-[#222] text-white hover:bg-[#1a1a1a]"
                        }
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })
              })()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < Math.ceil(filteredNews.length / itemsPerPage)) setCurrentPage(currentPage + 1)
                  }}
                  className={`bg-[#0f0f0f] border border-[#222] text-white hover:bg-[#1a1a1a] hover:text-white w-24 justify-center ${
                    currentPage === Math.ceil(filteredNews.length / itemsPerPage)
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
      <Community />
      <Newsletter />
      <Footer />
    </div>
  )
}

