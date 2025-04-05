/* eslint-disable */
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, Clock } from "lucide-react"

interface Author {
  id: number
  name: string
  profile_pic: string
  x_link?: string
  instagram_link?: string
  linkedin_link?: string
}

interface FeaturedArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  date: string
  author: string | Author // Can be either a string (name) or an Author object
  authorImage?: string // Optional now as we might use author.profile_pic
  image: string
  readTime: string
}

interface FeaturedNewsProps {
  article: FeaturedArticle
  showHeader?: boolean
}

export function FeaturedNews({ article, showHeader = true }: FeaturedNewsProps) {
  // Ensure the slug is properly formatted
  const formattedSlug = article.slug?.trim() || article.id

  // Handle author data which can be either a string or an Author object
  const authorName = typeof article.author === "string" ? article.author : article.author?.name || "Unknown Author"
  const authorImage =
    typeof article.author === "string"
      ? article.authorImage || "/placeholder.svg?height=40&width=40"
      : article.author?.profile_pic || "/placeholder.svg?height=40&width=40"

  // Get first letter for avatar fallback
  const authorInitial = authorName.charAt(0) || "A"

  return (
    <div className="w-full">
      <Link href={`/news/${formattedSlug}`} className="block">
        <Card className="overflow-hidden border-[#222] bg-[#0f0f0f] rounded-lg">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-80 lg:h-full min-h-[300px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 flex flex-col justify-end p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Image
                      src="/placeholder.svg?height=30&width=120"
                      alt="Chart Nomads"
                      width={120}
                      height={30}
                      className="h-7 w-auto"
                    />
                  </div>
                  <h3 className="text-4xl font-bold text-[#edb900] uppercase">Red Flags to Avoid</h3>
                </div>
                <Image src={article.image || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
              </div>

              <div className="flex flex-col justify-between p-6 space-y-4">
                <div className="space-y-4">
                  <Badge className="bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90 hover:text-[#0f0f0f] rounded-md px-3 py-1 text-sm font-medium">
                    {article.category}
                  </Badge>

                  <h2 className="text-3xl font-bold text-white leading-tight">{article.title}</h2>

                  <p className="text-gray-300 text-base">{article.excerpt}</p>
                </div>

                <div className="flex flex-col space-y-4">
                  <Link
                    href={`/news/${formattedSlug}`}
                    className="bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90 px-6 py-2 rounded-md font-medium text-center w-fit"
                  >
                    Read More
                  </Link>

                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-[#edb900]">
                      <AvatarImage src={authorImage} alt={authorName} />
                      <AvatarFallback>{authorInitial}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white">{authorName}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" /> {article.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {article.readTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}

