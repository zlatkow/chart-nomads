import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navbar from "../components/Navbar"
import Noise from "../components/Noise"
import Community from "../components/Community"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
    <Navbar />
    <Noise />
      <main className="container py-8 mt-[200px] mx-auto mb-[100px] z-50">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/70">Blog</p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              All valuable resources in one place
            </h1>
          </div>
        </section>

        {/* Featured Post */}
        <section className="mb-16">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-sm">
            <div className="relative">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-zaQvWR36TxcBW5kTQmgLprxKF4gPO8.png"
                alt="The Evolution of Prop Trading"
                width={1200}
                height={600}
                className="aspect-[2/1] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 sm:p-8">
                <Badge className="mb-3 bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90">New Trends</Badge>
                <h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                  The Evolution of Prop Trading: Trends to Watch in 2025
                </h2>
                <p className="mb-4 max-w-2xl text-white/90">
                  Prop trading is evolving rapidly. Learn about AI in trading, retail prop trends, regulations, and
                  predictions for 2025. Stay ahead with these insights.
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="border-2 border-white">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Author" />
                    <AvatarFallback>MJ</AvatarFallback>
                  </Avatar>
                  <div className="text-sm text-white">
                    <p className="font-medium">Myles Jordan</p>
                    <p>January 25, 2025 • 4 min read</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Post Filters */}
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-white">Categories:</h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="cursor-pointer bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90">
                  All Posts
                </Badge>
                <Badge variant="outline" className="cursor-pointer text-white hover:bg-white/10">
                  Prop Trading
                </Badge>
                <Badge variant="outline" className="cursor-pointer text-white hover:bg-white/10">
                  Guides
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white">Sort by:</span>
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px] border-white/20 bg-black/20 text-white">
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

        {/* Blog Posts Grid */}
        <section className="mb-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Post 1 */}
            <BlogPostCard
              image="/placeholder.svg?height=400&width=600"
              badge="Prop Trading"
              title="5 Red Flags in Prop Trading Firms to Avoid"
              description="Discover 6 warning signs in prop trading firms: from hidden rules to unrealistic targets. Stay informed and protect your investment."
              author="Myles Jordan"
              date="January 23, 2025"
              readTime="4 min read"
              className="bg-black/20"
            />

            {/* Post 2 */}
            <BlogPostCard
              image="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-zaQvWR36TxcBW5kTQmgLprxKF4gPO8.png"
              badge="New Trends"
              title="The Evolution of Prop Trading: Trends to Watch in 2025"
              description="Prop trading is evolving rapidly. Learn about AI in trading, retail prop trends, regulations, and predictions for 2025. Stay ahead with these insights."
              author="Myles Jordan"
              date="January 25, 2025"
              readTime="4 min read"
              className="bg-black/20"
            />

            {/* Post 3 */}
            <BlogPostCard
              image="/placeholder.svg?height=400&width=600"
              badge="Tips"
              title="What Are Prop Trading Challenges? Tips to Pass Your First Challenge"
              description="Learn about prop trading challenges, their rules, and how to pass them. Boost your trading career with practical strategies for beginners."
              author="Sarah Taylor"
              date="January 21, 2025"
              readTime="6 min read"
              className="bg-black/20"
            />

            {/* Post 4 */}
            <BlogPostCard
              image="/placeholder.svg?height=400&width=600"
              badge="Guide"
              title="How to Become a Day Trader - A Step-by-Step Guide"
              description="Learn how to become a day trader with this ultimate guide: from equipment and strategy to mindset. We cover everything you need to know about day trading."
              author="Myles Jordan"
              date="January 17, 2025"
              readTime="8 min read"
              className="bg-black/20"
            />

            {/* Post 5 */}
            <BlogPostCard
              image="/placeholder.svg?height=400&width=600"
              badge="Basics"
              title="What is Prop Trading? A Comprehensive Guide for Aspiring Traders"
              description="Learn everything about prop trading, from how it works to the top firms. Master the basics and take your trading career the right way with our guide."
              author="Myles Jordan"
              date="January 15, 2025"
              readTime="5 min read"
              className="bg-black/20"
            />

            {/* Post 6 */}
            <BlogPostCard
              image="/placeholder.svg?height=400&width=600"
              badge="Strategy"
              title="7 Proven Prop Trading Strategies for Consistent Profits"
              description="Discover battle-tested prop trading strategies that deliver consistent results. From scalping to swing trading, find what works for your style."
              author="Sarah Taylor"
              date="January 10, 2025"
              readTime="7 min read"
              className="bg-black/20"
            />
          </div>
        </section>
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
  className?: string
}

function BlogPostCard({ image, badge, title, description, author, date, readTime, className }: BlogPostCardProps) {
  return (
    <Card className={`overflow-hidden border-0 border-white/10 shadow-md transition-all hover:shadow-lg ${className}`}>
      <div className="relative aspect-[4/3]">
        <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <Badge className="bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90">{badge}</Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="mb-2 line-clamp-2 text-xl font-bold text-white">{title}</h3>
        <p className="line-clamp-3 text-sm text-white/70">{description}</p>
      </CardContent>
      <CardFooter className="flex items-center gap-3 border-t border-white/10 p-4">
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
  )
}

