/* eslint-disable */
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@supabase/supabase-js"
import Navbar from "../components/Navbar"
import Noise from "../components/Noise"
import Community from "../components/Community"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function BlogPost({ params }: { params: { slug: string } }) {
  // Fetch blog post from Supabase
  const { data: blog, error } = await supabase.from("blogs").select("*").eq("slug", params.slug).single()

  if (error || !blog) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      <Noise />
      <div className="relative container max-w-4xl py-8 mt-[200px] mx-auto mb-[100px] z-50">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="pl-0 hover:bg-transparent">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to blogs
            </Button>
          </Link>
        </div>

        <article className="prose prose-invert max-w-none">
          <Badge className="mb-4 bg-[#edb900] text-[#0f0f0f]">{blog.category}</Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">{blog.name}</h1>

          <div className="mb-8 flex items-center gap-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt={blog.author} />
              <AvatarFallback>
                {blog.author
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-white">{blog.author}</p>
              <p className="text-sm text-white/70">
                {new Date(blog.created_at).toLocaleDateString()} • {blog.read_time} min read
              </p>
            </div>
          </div>

          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={blog.image_url || "/placeholder.svg?height=600&width=1200"}
              alt={blog.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="text-white" dangerouslySetInnerHTML={{ __html: blog.blog_post_body }} />
        </article>
      </div>
      <Community/>
      <Newsletter/>
      <Footer />
    </div>
  )
}

