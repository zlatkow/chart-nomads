import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Blog } from "@/lib/supabase"

interface FeaturedPostProps {
  blog: Blog
}

export default function FeaturedPost({ blog }: FeaturedPostProps) {
  return (
    <Link href={`/blog/${blog.slug}`}>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-lg transition-all">
        <div className="relative">
          <Image
            src={blog.image_url || "/placeholder.svg?height=600&width=1200"}
            alt={blog.name}
            width={1200}
            height={600}
            className="aspect-[2/1] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 sm:p-8">
            <Badge className="mb-3 bg-primary text-primary-foreground">{blog.category}</Badge>
            <h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">{blog.name}</h2>
            <p className="mb-4 max-w-2xl text-white/90">{blog.summary}</p>
            <div className="flex items-center gap-3">
              <Avatar className="border-2 border-white">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt={blog.author} />
                <AvatarFallback>
                  {blog.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm text-white">
                <p className="font-medium">{blog.author}</p>
                <p>
                  {new Date(blog.created_at).toLocaleDateString()} • {blog.read_time} min read
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

