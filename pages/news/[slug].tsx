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

interface ArticlePageProps {
  params: {
    id: string
  }
}

// Predefined mock article data that will be used for any ID
const mockArticle = {
  id: "default-article",
  title: "The Future of Algorithmic Trading in Prop Firms",
  content: `
    <p>Algorithmic trading is rapidly transforming the landscape of proprietary trading firms, offering unprecedented opportunities for efficiency, speed, and profitability. As we move further into the digital age, understanding the implications of algorithmic trading adoption has become crucial for traders and prop firms alike.</p>
    
    <h2 id="current-state">The Current State of Algorithmic Trading</h2>
    
    <p>Today's algorithmic trading applications range from simple automated execution strategies to complex machine learning systems. Proprietary trading firms are increasingly leveraging these algorithms to analyze vast amounts of market data, identify patterns, and execute trades with greater accuracy and speed than ever before.</p>
    
    <p>According to recent industry reports, over 70% of trading volume in major markets now comes from algorithmic trading systems. This shift has led to increased investment in trading technology across prop firms of all sizes, from boutique operations to large institutional players.</p>
    
    <h2 id="transforming-operations">Transforming Trading Operations</h2>
    
    <p>One of the most significant impacts of algorithmic trading is on operational efficiency. Automated systems can monitor multiple markets simultaneously and execute trades in milliseconds, allowing traders to capitalize on opportunities that would be impossible to capture manually.</p>
    
    <p>In risk management, algorithmic systems are revolutionizing how prop firms control exposure. Advanced risk models can continuously evaluate positions, adjust hedges, and implement stop-loss mechanisms with precision and consistency that human traders cannot match.</p>
    
    <h2 id="challenges">Challenges and Considerations</h2>
    
    <p>Despite its benefits, algorithmic trading implementation comes with challenges. Technical infrastructure requirements, data quality concerns, and regulatory compliance are significant hurdles for many prop firms. Additionally, there's the ongoing challenge of developing algorithms that can adapt to changing market conditions.</p>
    
    <p>Successful algorithmic trading requires a strategic approach that considers these factors alongside the potential benefits. Firms must invest not only in technology but also in talent, research, and creating a culture that balances innovation with risk management.</p>
    
    <h2 id="future">Looking Ahead: The Future of Algorithmic Trading</h2>
    
    <p>As technology continues to evolve, algorithmic trading will become even more sophisticated. We can expect to see increased adoption of machine learning and artificial intelligence, enabling systems that can learn from market behavior and adapt strategies in real-time.</p>
    
    <p>The prop firms that will thrive in this new landscape are those that view algorithmic trading not just as a tool but as a transformative force that can reshape their entire business model. By embracing technology's potential while addressing its challenges thoughtfully, proprietary trading firms can position themselves for success in an increasingly algorithm-driven market.</p>
  `,
  category: "Prop Firms",
  date: "March 10, 2025",
  author: "Jane Smith",
  authorBio:
    "Jane Smith is a quantitative analyst specializing in algorithmic trading systems. She has over 15 years of experience in the financial industry, working with both institutional and proprietary trading firms.",
  authorImage: "/placeholder.svg?height=80&width=80",
  image: "/placeholder.svg?height=600&width=1200",
  readTime: "8 min read",
  tags: ["Algorithmic Trading", "Prop Firms", "Machine Learning", "Trading Technology", "Risk Management"],
}

// Predefined related articles
const relatedArticles = [
  {
    id: "article-1",
    title: "How Machine Learning is Revolutionizing Prop Trading Strategies",
    date: "March 5, 2025",
    category: "Prop Firms",
    image: "/placeholder.svg?height=64&width=64",
  },
  {
    id: "article-2",
    title: "Risk Management Systems for Modern Proprietary Trading",
    date: "March 2, 2025",
    category: "Prop Firms",
    image: "/placeholder.svg?height=64&width=64",
  },
  {
    id: "article-3",
    title: "Top Prop Firms Hiring Quant Developers in 2025",
    date: "February 28, 2025",
    category: "Prop Firms",
    image: "/placeholder.svg?height=64&width=64",
  },
]

export default function ArticlePage({ params }: ArticlePageProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Simulate loading for a brief moment
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Show loading state while article is being "fetched"
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-[#0f0f0f] text-white">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#edb900]"></div>
        </div>
      </div>
    )
  }

  // Always use the predefined article data
  // Update the ID to match the requested ID for consistency
  const article = {
    ...mockArticle,
    id: params.id,
  }

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

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">{article.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-6">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{article.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{article.readTime}</span>
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
              <AvatarImage src={article.authorImage} alt={article.author} />
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
        <Image src={article.image || "/placeholder.svg"} alt={article.title} fill className="object-cover" priority />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
        <div>
          <article className="prose prose-lg prose-invert max-w-none" id={`article-${article.id}`}>
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </article>

          <div className="mt-8 pt-6 border-t border-[#222]">
            <h3 className="text-lg font-semibold mb-2 text-white">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="border-[#222] text-gray-300 hover:text-white">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#222]">
            <h3 className="text-lg font-semibold mb-4 text-white">About the Author</h3>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={article.authorImage} alt={article.author} />
                <AvatarFallback>{article.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-lg text-white">{article.author}</h4>
                <p className="text-gray-300">{article.authorBio}</p>
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <div className="mt-12 pt-8 border-t border-[#222]">
            <CommentSection type="news" itemId={params.id} onLoginModalOpen={() => setIsLoginModalOpen(true)} />
          </div>
        </div>

        <aside className="space-y-8">
          <div className="sticky top-8">
            <div className="bg-[#0f0f0f] p-4 rounded-lg border border-[#222] mb-8 hover:bg-[#1a1a1a] transition-colors duration-200">
              <TableOfContents articleId={article.id} />
            </div>

            <div className="pt-6 border-t border-[#222]">
              <h3 className="text-lg font-semibold mb-4 text-white">Related Articles</h3>
              <div className="space-y-4">
                {relatedArticles.map((relatedArticle, i) => (
                  <Link href={`/news/${relatedArticle.id}`} key={i} className="block group">
                    <div className="flex gap-3 p-3 rounded-lg bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-colors duration-200">
                      <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                        <Image
                          src={relatedArticle.image || "/placeholder.svg"}
                          alt={relatedArticle.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="font-medium line-clamp-2 text-sm text-gray-200 group-hover:text-[#edb900] transition-colors">
                          {relatedArticle.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">{relatedArticle.date}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* In a real app, you would implement a login modal here */}
      {/* <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} /> */}
    </div>
  )
}

