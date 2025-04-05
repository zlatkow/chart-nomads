/* eslint-disable */
"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs_blog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination_blog"
import { BlogsCard } from "@/components/blog-page/blogs-card"
import { FeaturedBlogsSlider } from "@/components/blog-page/featured-blogs"
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

// Define Blogs type based on database schema
interface Blogs {
  id: number
  created_at: string
  name: string
  slug: string
  summary: string
  blogs_post_body: string
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

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blogs[]>([])
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

  // Fetch blogs from Supabase
  useEffect(() => {
    async function fetchBlogs() {
      try {
        if (!supabaseUrl || !supabaseAnonKey) {
          setError("Supabase credentials are missing")
          setLoading(false)
          return
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        const { data, error: supabaseError } = await supabase.from("blogs").select("*")

        if (supabaseError) {
          setError("Failed to fetch blog posts")
          setLoading(false)
          return
        }

        if (data) {
          setBlogs(data as Blogs[])

          // Get unique author IDs
          const authorIds = Array.from(new Set(data.map((item) => item.author)))

          // Fetch all authors in one query
          if (authorIds.length > 0) {
            const { data: authorsData, error: authorsError } = await supabase
              .from("authors")
              .select("*")
              .in("id", authorIds)

            if (authorsError) {
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
        setError("An unexpected error occurred")
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  // Get featured blogs articles (up to 5)
  const featuredArticles = blogs
    .filter((item) => item && (item.featured || item.category === "featured"))
    .slice(0, 5)
    .map((item) => ({
      id: item.id.toString(),
      title: item.name,
      excerpt: item.summary,
      category: item.category,
      slug: item.slug,
      date: new Date(item.created_at).toLocaleDateString(),
      author: authors[item.author] || "Unknown Author",
      authorImage: authors[item.author]?.profile_pic || "/placeholder.svg?height=40&width=40",
      image: item.image_url || "/placeholder.svg?height=600&width=1200",
      readTime: `${item.read_time} min read`,
    }))

  // If we don't have enough featured articles, add some regular ones to make at least 2
  if (featuredArticles.length < 2) {
    const regularArticles = blogs
      .filter((item) => item && !featuredArticles.some((featured) => featured.id === item.id.toString()))
      .slice(0, 5 - featuredArticles.length)
      .map((item) => ({
        id: item.id.toString(),
        title: item.name,
        excerpt: item.summary,
        category: item.category,
        slug: item.slug,
        date: new Date(item.created_at).toLocaleDateString(),
        author: authors[item.author] || "Unknown Author",
        authorImage: authors[item.author]?.profile_pic || "/placeholder.svg?height=40&width=40",
        image: item.image_url || "/placeholder.svg?height=600&width=1200",
        readTime: `${item.read_time} min read`,
      }))

    featuredArticles.push(...regularArticles)
  }

  // Get unique categories from fetched blogs
  const categories = [
    "All",
    ...Array.from(new Set(blogs.filter((item) => item && item.category).map((item) => item.category))),
  ]

  // Filter blogs by category and search query
  const getFilteredBlogs = () => {
    let filtered = blogs

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

  const filteredBlogs = getFilteredBlogs()

  // Shimmer loading component
  const BlogsPageSkeleton = () => (
    <>
      {/* Header skeleton */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="h-10 bg-[#1a1a1a] rounded-md w-48 overflow-hidden relative shimmer-effect"></div>
        <div className="h-5 bg-[#1a1a1a] rounded-md w-96 overflow-hidden relative shimmer-effect"></div>
      </div>

      {/* Featured blogs slider skeleton */}
      <div className="w-full h-[400px] bg-[#1a1a1a] rounded-xl overflow-hidden relative shimmer-effect mb-12"></div>

      {/* Tabs and search skeleton */}
      <div className="my-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="w-[300px] h-10 bg-[#1a1a1a] rounded-md overflow-hidden relative shimmer-effect"></div>
          <div className="flex gap-2 overflow-x-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 w-24 bg-[#1a1a1a] rounded-md overflow-hidden relative shimmer-effect"></div>
            ))}
          </div>
        </div>

        {/* Blogs grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="w-full h-48 bg-[#1a1a1a] rounded-lg overflow-hidden relative shimmer-effect"></div>
                <div className="h-5 bg-[#1a1a1a] rounded-md w-3/4 overflow-hidden relative shimmer-effect"></div>
                <div className="h-4 bg-[#1a1a1a] rounded-md w-1/2 overflow-hidden relative shimmer-effect"></div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-8 w-8 bg-[#1a1a1a] rounded-full overflow-hidden relative shimmer-effect"></div>
                  <div className="h-4 bg-[#1a1a1a] rounded-md w-24 overflow-hidden relative shimmer-effect"></div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-center my-8">
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-[#1a1a1a] rounded-md overflow-hidden relative shimmer-effect"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-9 bg-[#1a1a1a] rounded-md overflow-hidden relative shimmer-effect"></div>
          ))}
          <div className="h-9 w-24 bg-[#1a1a1a] rounded-md overflow-hidden relative shimmer-effect"></div>
        </div>
      </div>
    </>
  )

  return (
    <div>
      <Navbar />
      <Noise />
      <div className="relative z-50 container mx-auto px-4 py-8 text-white mt-[200px] max-w-[1280px] mb-[100px]">
        {/* Loading State with Shimmer Effect */}
        {loading ? (
          <BlogsPageSkeleton />
        ) : (
          <>
            <div className="flex flex-col gap-2 mb-8">
              <h1 className="text-4xl tracking-tight text-white">Blog</h1>
              <p className="text-gray-400">All valuable resources in one place</p>
            </div>

            {/* Error State */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-[#0f0f0f] p-8 text-center text-red-500 mb-16">
                <p>{error}</p>
              </div>
            )}

            {/* Featured Blogs Slider */}
            {!error && featuredArticles.length > 0 && (
              <FeaturedBlogsSlider articles={featuredArticles} autoPlayInterval={5000} />
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
                    {!error && filteredBlogs.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredBlogs
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((item) => (
                            <BlogsCard
                              key={item.id}
                              article={{
                                id: item.id.toString(),
                                title: item.name,
                                excerpt: item.summary,
                                slug: item.slug,
                                category: item.category,
                                date: new Date(item.created_at).toLocaleDateString(),
                                author: authors[item.author]?.name || "Unknown Author",
                                authorImage: authors[item.author]?.profile_pic || "/placeholder.svg?height=40&width=40",
                                image: item.image_url || "/placeholder.svg?height=400&width=600",
                                readTime: `${item.read_time} min read`,
                              }}
                            />
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-white/70">
                        {error ? "Error loading blogs" : "No blogs articles found"}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Dynamic Pagination */}
            {filteredBlogs.length > itemsPerPage && (
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
                    const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage)
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
                        if (currentPage < Math.ceil(filteredBlogs.length / itemsPerPage)) setCurrentPage(currentPage + 1)
                      }}
                      className={`bg-[#0f0f0f] border border-[#222] text-white hover:bg-[#1a1a1a] hover:text-white w-24 justify-center ${
                        currentPage === Math.ceil(filteredBlogs.length / itemsPerPage)
                          ? "opacity-50 pointer-events-none"
                          : ""
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}

        {/* Shimmer effect styles */}
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
      <Community />
      <Newsletter />
      <Footer />
    </div>
  )
}

