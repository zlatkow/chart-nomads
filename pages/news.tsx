import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { NewsCard } from "@/components/news-page/news-card"
import { FeaturedNews } from "@/components/news-page/featured-news"
import Navbar from "../components/Navbar"
import Noise from "../components/Noise"
import Community from "../components/Community"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"

export default function NewsPage() {
  // Updated categories for financial/trading focus
  const categories = ["All", "Prop Firms", "Brokers", "Economic", "Macro", "Forex", "Stocks", "Crypto"]

  const featuredArticle = {
    id: "1",
    title: "The Future of Algorithmic Trading in Prop Firms",
    excerpt:
      "Exploring how AI and machine learning are transforming proprietary trading firms and creating new opportunities for traders.",
    category: "Prop Firms",
    date: "March 10, 2025",
    author: "Jane Smith",
    authorImage: "/placeholder.svg?height=40&width=40",
    image: "/placeholder.svg?height=600&width=1200",
    readTime: "8 min read",
  }

  const articles = [
    {
      id: "2",
      title: "Top 5 Forex Brokers for Algorithmic Trading in 2025",
      excerpt:
        "A comprehensive review of the best brokers offering advanced API access and low-latency execution for algo traders.",
      category: "Brokers",
      date: "March 8, 2025",
      author: "Michael Johnson",
      authorImage: "/placeholder.svg?height=40&width=40",
      image: "/placeholder.svg?height=400&width=600",
      readTime: "5 min read",
    },
    {
      id: "3",
      title: "Federal Reserve Policy Shift: Impact on Global Markets",
      excerpt:
        "Analysis of the latest Fed decisions and their implications for interest rates, inflation, and investment strategies.",
      category: "Economic",
      date: "March 7, 2025",
      author: "Sarah Williams",
      authorImage: "/placeholder.svg?height=40&width=40",
      image: "/placeholder.svg?height=400&width=600",
      readTime: "6 min read",
    },
    {
      id: "4",
      title: "Macro Trends Reshaping Global Financial Markets",
      excerpt:
        "From geopolitical tensions to technological disruption, these macro factors are driving market movements in unexpected ways.",
      category: "Macro",
      date: "March 5, 2025",
      author: "Robert Chen",
      authorImage: "/placeholder.svg?height=40&width=40",
      image: "/placeholder.svg?height=400&width=600",
      readTime: "4 min read",
    },
    {
      id: "5",
      title: "EUR/USD Technical Analysis: Key Levels to Watch",
      excerpt:
        "A detailed breakdown of support and resistance zones for the world's most traded currency pair in the coming weeks.",
      category: "Forex",
      date: "March 3, 2025",
      author: "Emily Rodriguez",
      authorImage: "/placeholder.svg?height=40&width=40",
      image: "/placeholder.svg?height=400&width=600",
      readTime: "7 min read",
    },
    {
      id: "6",
      title: "Emerging Tech Stocks Poised for Growth in Q2",
      excerpt:
        "These innovative companies are showing strong fundamentals and technical setups as we enter the second quarter.",
      category: "Stocks",
      date: "March 1, 2025",
      author: "David Kim",
      authorImage: "/placeholder.svg?height=40&width=40",
      image: "/placeholder.svg?height=400&width=600",
      readTime: "5 min read",
    },
    {
      id: "7",
      title: "Bitcoin Halving: Historical Impact and 2025 Predictions",
      excerpt:
        "Analyzing previous halving events and what they might tell us about the upcoming cycle in the cryptocurrency market.",
      category: "Crypto",
      date: "February 28, 2025",
      author: "Alex Thompson",
      authorImage: "/placeholder.svg?height=40&width=40",
      image: "/placeholder.svg?height=400&width=600",
      readTime: "9 min read",
    },
  ]

  return (
    <div>
        <Navbar />
        <Noise />
            <div className="container mx-auto px-4 py-8 bg-[#0f0f0f] text-white">
            <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-4xl tracking-tight text-white">Latest News</h1>
                <p className="text-gray-400">Stay updated with the latest developments in financial markets</p>
            </div>
        <FeaturedNews article={featuredArticle} />
        <div className="my-12">
            <Tabs defaultValue="All" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-2xl text-white">Recent Articles</h2>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles
                    .filter((article) => category === "All" || article.category === category)
                    .map((article) => (
                        <NewsCard key={article.id} article={article} />
                    ))}
                </div>
                </TabsContent>
            ))}
            </Tabs>
        </div>

        <Pagination className="my-8">
            <PaginationContent>
            <PaginationItem>
                <PaginationPrevious
                href="#"
                className="bg-[#0f0f0f] border border-[#222] text-white hover:bg-[#1a1a1a] hover:text-white w-24 justify-center"
                />
            </PaginationItem>
            <PaginationItem>
                <PaginationLink
                href="#"
                isActive
                className="bg-[#edb900] text-[#0f0f0f] border-[#edb900] hover:bg-[#edb900]/90"
                >
                1
                </PaginationLink>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink href="#" className="bg-[#0f0f0f] border border-[#222] text-white hover:bg-[#1a1a1a]">
                2
                </PaginationLink>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink href="#" className="bg-[#0f0f0f] border border-[#222] text-white hover:bg-[#1a1a1a]">
                3
                </PaginationLink>
            </PaginationItem>
            <PaginationItem>
                <PaginationEllipsis className="bg-[#0f0f0f] border border-[#222] text-white rounded-md h-9 w-9 flex items-center justify-center" />
            </PaginationItem>
            <PaginationItem>
                <PaginationNext
                href="#"
                className="bg-[#0f0f0f] border border-[#222] text-white hover:bg-[#1a1a1a] hover:text-white w-24 justify-center"
                />
            </PaginationItem>
            </PaginationContent>
        </Pagination>
        </div>
        <Community />
        <Newsletter />
        <Footer />
    </div>
  )
}

