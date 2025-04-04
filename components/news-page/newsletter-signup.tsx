import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function NewsletterSignup() {
  return (
    <Card className="bg-[#0f0f0f] border-[#222] hover:bg-[#1a1a1a] transition-colors duration-200">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">Subscribe to Our Newsletter</CardTitle>
        <CardDescription className="text-gray-300">
          Get the latest news and updates delivered directly to your inbox
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            className="flex-1 bg-[#0f0f0f] border-[#222] text-white"
            required
          />
          <Button type="submit" className="bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90">
            Subscribe
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

