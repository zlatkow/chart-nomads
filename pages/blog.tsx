/* eslint-disable */
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navbar from "../components/Navbar"
import Noise from "../components/Noise"
import Community from "../components/Community"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Define Blog type based on database schema
interface Blog {
  id: number
  created_at: string
  name: string
  slug: string
  summary: string
  blog_post_body: string
  read_time: number
  featured: boolean
  category: string
  author: string
  image_url: string
}

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("newest")

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
          console.error("Error fetching blogs:", supabaseError)
          setError("Failed to fetch blog posts")
          setLoading(false)
          return
        }

        if (data) {
          setBlogs(data as Blog[])
        }
        setLoading(false)
      } catch (err) {
        console.error("Error in blog data fetching:", err)
        setError("An unexpected error occurred")
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  // Filter and sort blogs
  const getFilteredBlogs = () => {
    let filtered = [...blogs]

    // Filter by category
    if (category !== "all") {
      filtered = filtered.filter((blog) => blog && blog.category === category)
    }

    // Sort blogs
    if (sort === "newest") {
      filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sort === "oldest") {
      filtered = filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    } else if (sort === "popular") {
      filtered = filtered.sort((a, b) => b.read_time - a.read_time)
    }

    return filtered
  }

  const filteredBlogs = getFilteredBlogs()

  // Get featured blog
  const featuredBlog = blogs.length > 0 ? filteredBlogs.find((blog) => blog && blog.featured) || filteredBlogs[0] : null

  // Get unique categories
  const categories = Array.from(new Set(blogs.filter((blog) => blog && blog.category).map((blog) => blog.category)))

  // Handle category change
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
  }

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    setSort(newSort)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      <Noise />
      <main className="relative container py-8 mt-[200px] mx-auto mb-[100px] z-50">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/70">Blog</p>
            <h1 className="text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
              All valuable resources in one place
            </h1>
          </div>
        </section>

        {/* Loading and Error States */}
        {loading && (
          <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-8 text-center text-white mb-16">
            <p>Loading blog posts...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-[#0f0f0f] p-8 text-center text-red-500 mb-16">
            <p>{error}</p>
          </div>
        )}

        {/* Featured Post */}
        {!loading && !error && (
          <section className="mb-16">
            {featuredBlog ? (
              <Link href={`/blog/${featuredBlog.slug}`}>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0f0f0f] shadow-sm">
                  <div className="relative">
                    <Image
                      src={featuredBlog.image_url || "/placeholder.svg?height=600&width=1200"}
                      alt={featuredBlog.name}
                      width={1200}
                      height={600}
                      className="aspect-[2/1] w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 sm:p-8">
                      <Badge className="mb-3 bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90">
                        {featuredBlog.category}
                      </Badge>
                      <h2 className="mb-2 text-2xl text-white sm:text-3xl">{featuredBlog.name}</h2>
                      <p className="mb-4 max-w-2xl text-white/90">{featuredBlog.summary}</p>
                      <div className="flex items-center gap-3">
                        <Avatar className="border-2 border-white">
                          <AvatarImage src="/placeholder.svg?height=40&width=40" alt={featuredBlog.author} />
                          <AvatarFallback>
                            {featuredBlog.author
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm text-white">
                          <p className="font-medium">{featuredBlog.author}</p>
                          <p>
                            {new Date(featuredBlog.created_at).toLocaleDateString()} • {featuredBlog.read_time} min read
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-8 text-center text-white">
                <p>No featured post available.</p>
              </div>
            )}
          </section>
        )}

        {/* Post Filters */}
        {!loading && !error && (
          <section className="mb-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-white">Categories:</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange("all")}
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none cursor-pointer ${
                      category === "all"
                        ? "bg-[#edb900] text-[#0f0f0f] border-transparent"
                        : "text-white hover:bg-white/10 border-white/10"
                    }`}
                  >
                    All Posts
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none cursor-pointer ${
                        category === cat
                          ? "bg-[#edb900] text-[#0f0f0f] border-transparent"
                          : "text-white hover:bg-white/10 border-white/10"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white">Sort by:</span>
                <Select value={sort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px] border-white/20 bg-[#0f0f0f] text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] text-white">
                    <SelectItem value="newest">Date (newest)</SelectItem>
                    <SelectItem value="oldest">Date (oldest)</SelectItem>
                    <SelectItem value="popular">Most popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        )}

        {/* Blog Posts Grid */}
        {!loading && !error && (
          <section className="mb-16">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBlogs.length > 0 ? (
                filteredBlogs.map((blog) => (
                  <BlogPostCard
                    key={blog.id}
                    slug={blog.slug}
                    image={blog.image_url}
                    badge={blog.category}
                    title={blog.name}
                    description={blog.summary}
                    author={blog.author}
                    date={new Date(blog.created_at).toLocaleDateString()}
                    readTime={`${blog.read_time} min read`}
                    className="bg-[#0f0f0f]"
                  />
                ))
              ) : (
                <div className="col-span-3 rounded-xl border border-white/10 bg-[#0f0f0f] p-8 text-center text-white">
                  <p>No blog posts found.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
      <Community />
      <Newsletter />
      <Footer />
    </div>
  )
}

interface BlogPostCardProps {
  image: string
  badge: string
  title: string
  description: string
  author: string
  date: string
  readTime: string
  slug: string
  className?: string
}

function BlogPostCard({
  image,
  badge,
  title,
  description,
  author,
  date,
  readTime,
  slug,
  className,
}: BlogPostCardProps) {
  return (
    <Link href={`/blog/${slug}`}>
      <Card
        className={`overflow-hidden border-0 border-white/10 bg-[#0f0f0f] shadow-md transition-all hover:shadow-lg ${className}`}
      >
        <div className="relative aspect-[4/3]">
          <Image src={image || "/placeholder.svg?height=400&width=600"} alt={title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <Badge className="bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90">{badge}</Badge>
          </div>
        </div>
        <CardContent className="p-4 bg-[#0f0f0f]">
          <h3 className="mb-2 line-clamp-2 text-xl text-white">{title}</h3>
          <p className="line-clamp-3 text-sm text-white/70">{description}</p>
        </CardContent>
        <CardFooter className="flex items-center gap-3 border-t border-white/10 p-4 bg-[#0f0f0f]">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt={author} />
            <AvatarFallback>
              {author
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="text-xs text-white">
            <p className="font-medium">{author}</p>
            <p>
              {date} • {readTime}
            </p>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

