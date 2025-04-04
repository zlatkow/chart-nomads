import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export function NewsletterSignup() {
  return (
    <Card className="bg-[#0f0f0f] border-[#222] hover:bg-[#1a1a1a] transition-colors duration-200">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-[balboa] text-white">Subscribe to Our Newsletter</CardTitle>
        <CardDescription className="text-gray-300">
          Get the latest news and updates delivered directly to your inbox
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col sm:flex-row max-w-md mx-auto">
            <div className="text-sm mt-6 flex bg-white rounded-lg overflow-hidden w-full max-w-md">
                <input 
                    id="footerNewsletter"
                    type="email" 
                    placeholder="No spam, just value" 
                    className="w-full px-4 py-3 text-black outline-none"
                />
                <button className="bg-[#EDB900] px-5 flex items-center justify-center hover:bg-[#b38b00] transition">
                    <FontAwesomeIcon icon={faArrowRight} className="text-black text-lg" />
                </button>
            </div>
        </form>
      </CardContent>
    </Card>
  )
}

