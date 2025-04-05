import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, Clock } from 'lucide-react'

interface Author {
  id: number
  name: string
  profile_pic: string
  x_link?: string
  instagram_link?: string
  linkedin_link?: string
}

interface Article {
  id: string
  title: string
  excerpt: string
  slug: string
  category: string
  date: string
  author: string | Author // Can be either a string (name) or an Author object
  authorImage?: string // Optional now as we might use author.profile_pic
  image: string
  readTime: string
}

interface NewsCardProps {
  article: Article
}

export function NewsCard({ article }: NewsCardProps) {
  // Ensure the slug is properly formatted
  const formattedSlug = article.slug?.trim() || article.id

  // Handle author data which can be either a string or an Author object
  const authorName = typeof article.author === 'string' ? article.author : article.author?.name || 'Unknown Author'
  const authorImage = typeof article.author === 'string' 
    ? article.authorImage || "/placeholder.svg?height=40&width=40" 
    : article.author?.profile_pic || "/placeholder.svg?height=40&width=40"
  
  // Get first letter for avatar fallback
  const authorInitial = authorName.charAt(0) || 'A'

  return (
    <Link href={`/news/${formattedSlug}`} className="block h-full group">
      <Card className="overflow-hidden h-full flex flex-col transition-colors duration-200 bg-[#0f0f0f] group-hover:bg-[#1a1a1a] border-[#222]">
        <div className="relative h-[300px] w-full">
          <Image src={article.image || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
        </div>
        <CardHeader className="p-4">
          <div className="flex justify-between items-start mb-2">
            <Badge className="bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90 hover:text-[#0f0f0f]">
              {article.category}
            </Badge>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" /> {article.date}
            </span>
          </div>
          <h3 className="text-xl line-clamp-2 text-white group-hover:text-[#edb900] transition-colors">
            {article.title}
          </h3>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-grow">
          <p className="text-gray-300 text-sm line-clamp-4">{article.excerpt}</p>
        </CardContent>
        <CardFooter className="p-4 pt-4 border-t border-[#222] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={authorImage} alt={authorName} />
              <AvatarFallback>{authorInitial}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-center">
              <span className="text-sm font-medium text-gray-200 leading-tight">{authorName}</span>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3 flex-shrink-0" /> {article.readTime}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

