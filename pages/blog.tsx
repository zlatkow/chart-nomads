/* eslint-disable */
import Image from "next/image"
import Link from "next/link"
import { Search, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/placeholder.svg?height=32&width=32"
                alt="Smart Nomads Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="hidden font-bold text-primary sm:inline-block">SMART NOMADS</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link href="/news" className="text-sm font-medium hover:text-primary">
              News
            </Link>
            <Link href="/blog" className="text-sm font-medium text-primary">
              Blog
            </Link>
            <Link href="/prop-firms" className="text-sm font-medium hover:text-primary">
              Prop Firms
            </Link>
            <Link href="/assets" className="text-sm font-medium hover:text-primary">
              Assets
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Blog</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              All valuable resources in one place
            </h1>
          </div>
        </section>

        {/* Featured Post */}
        <section className="mb-16">
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
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
                <Badge className="mb-3 bg-primary text-primary-foreground">New Trends</Badge>
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
              <h2 className="text-sm font-medium">Categories:</h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  All Posts
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary/80">
                  Prop Trading
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary/80">
                  Guides
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Sort by:</span>
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
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
              className="bg-gradient-to-br from-red-900/20 to-black"
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
              className="bg-gradient-to-br from-yellow-900/20 to-black"
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
              className="bg-gradient-to-br from-blue-900/20 to-black"
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
              className="bg-gradient-to-br from-green-900/20 to-black"
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
              className="bg-gradient-to-br from-purple-900/20 to-black"
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
              className="bg-gradient-to-br from-orange-900/20 to-black"
            />
          </div>
        </section>

        {/* Newsletter */}
        <section className="rounded-xl bg-gradient-to-r from-black to-yellow-950 p-8 md:p-10">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="max-w-md">
              <h2 className="mb-2 text-2xl font-bold text-white md:text-3xl">SUBSCRIBE TO OUR NEWSLETTER</h2>
              <p className="text-4xl font-bold text-primary">TODAY!</p>
            </div>
            <div className="w-full max-w-md">
              <div className="flex gap-2">
                <Input type="email" placeholder="Your email address" className="bg-background/80 backdrop-blur" />
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Mail className="mr-2 h-4 w-4" />
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-black text-white">
        <div className="container py-12">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/placeholder.svg?height=32&width=32"
                  alt="Smart Nomads Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <span className="font-bold text-primary">SMART NOMADS</span>
              </Link>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Address:</p>
                <p>9000 str. Rita P. Pleven, Bulgaria</p>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Contact:</p>
                <p>+359 / 87884197</p>
                <p>office@smartnomads.com</p>
              </div>
              <div className="flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <span className="sr-only">Facebook</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <span className="sr-only">Twitter</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <span className="sr-only">Instagram</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <span className="sr-only">YouTube</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                    <path d="m10 15 5-3-5-3z" />
                  </svg>
                </Link>
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">RESOURCES</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    News
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Prop Firm Lists
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Timeframes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">ASSETS</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Forex Prop Firms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Crypto Prop Firms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Indices
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">PROP FIRMS</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    All Prop Firms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Prop Firm Comparison
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Offers & Discounts
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Prop Firm Rules
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">ABOUT</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Evaluation process
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Loyalty Program
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Contact us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Banned Countries
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Included Prop Firms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Industry Stats
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 text-center text-xs text-muted-foreground">
            <p className="mb-4">
              The information provided is intended for general use and informational purposes only. Users are advised to
              consult an expert before making any decisions based on the information found on our website. In no event
              shall Smart Nomads be liable for any special, direct, indirect, consequential, or incidental damages or
              any damages whatsoever, whether in an action of contract, negligence or other tort, arising out of or in
              connection with the use of the Service or the contents of the Service. Smart Nomads reserves the right to
              make additions, deletions, or modification to the contents on the Service at any time without prior
              notice.
            </p>
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p>© 2025 Smart Nomads. All Rights Reserved.</p>
              <div className="flex gap-4">
                <Link href="#" className="hover:text-primary">
                  Privacy Policy
                </Link>
                <Link href="#" className="hover:text-primary">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
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
    <Card className={`overflow-hidden border-0 shadow-md transition-all hover:shadow-lg ${className}`}>
      <div className="relative aspect-[4/3]">
        <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <Badge className="bg-primary text-primary-foreground">{badge}</Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="mb-2 line-clamp-2 text-xl font-bold">{title}</h3>
        <p className="line-clamp-3 text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="flex items-center gap-3 border-t p-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt={author} />
          <AvatarFallback>
            {author
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="text-xs">
          <p className="font-medium">{author}</p>
          <p className="text-muted-foreground">
            {date} • {readTime}
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

