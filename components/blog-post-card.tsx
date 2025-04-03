/* eslint-disable */
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Blog } from "@/lib/supabase"

interface BlogPostCardProps {
  blog: Blog
  className?: string
}

export default function BlogPostCard({ blog, className }: BlogPostCardProps) {
  // Add null checks to prevent "Cannot read properties of undefined" errors
  if (!blog) return null

  return (
    <Link href={`/blog/${blog.slug}`}>
      <Card
        className={`overflow-hidden border-0 shadow-md transition-all hover:shadow-lg hover:translate-y-[-4px] ${className}`}
      >
        <div className="relative aspect-[4/3]">
          <Image
            src={blog.image_url || "/placeholder.svg?height=400&width=600"}
            alt={blog.name || "Blog post"}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <Badge className="bg-primary text-primary-foreground">{blog.category || "Uncategorized"}</Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2 text-xl font-bold">{blog.name || "Untitled Post"}</h3>
          <p className="line-clamp-3 text-sm text-muted-foreground">{blog.summary || "No summary available"}</p>
        </CardContent>
        <CardFooter className="flex items-center gap-3 border-t p-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt={blog.author || "Author"} />
            <AvatarFallback>
              {blog.author
                ? blog.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : "AU"}
            </AvatarFallback>
          </Avatar>
          <div className="text-xs">
            <p className="font-medium">{blog.author || "Unknown Author"}</p>
            <p className="text-muted-foreground">
              {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : "No date"} • {blog.read_time || 0} min
              read
            </p>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}