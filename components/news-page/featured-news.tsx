import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, Clock } from "lucide-react"

interface FeaturedArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  date: string
  author: string
  authorImage: string
  image: string
  readTime: string
}

interface FeaturedNewsProps {
  article: FeaturedArticle
}

export function FeaturedNews({ article }: FeaturedNewsProps) {
  // Ensure the slug is properly formatted
  const formattedSlug = article.slug?.trim() || article.id

  return (
    <Link href={`/news/${formattedSlug}`} className="block group">
      <Card className="overflow-hidden border-[#222] bg-[#0f0f0f] transition-colors duration-200 group-hover:bg-[#1a1a1a]">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative h-64 lg:h-full min-h-[300px]">
              <Image src={article.image || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
            </div>
            <div className="flex flex-col justify-center p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90 hover:text-[#0f0f0f]">
                    {article.category}
                  </Badge>
                  <span className="text-sm text-gray-400 flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" /> {article.date}
                  </span>
                </div>
                <h2 className="text-3xl tracking-tight text-white group-hover:text-[#edb900] transition-colors">
                  {article.title}
                </h2>
                <p className="text-gray-300">{article.excerpt}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={article.authorImage} alt={article.author} />
                    <AvatarFallback>{article.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{article.author}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {article.readTime}
                    </p>
                  </div>
                </div>
                <div className="bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90 px-4 py-2 rounded-md font-medium">
                  Read More
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

