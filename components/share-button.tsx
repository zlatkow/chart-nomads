"use client"

import { useState, useEffect, useRef } from "react"
import { Share2, Facebook, Twitter, Linkedin, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ShareButtonProps {
  url: string
  title: string
  summary?: string
}

export function ShareButton({ url, title, summary = "" }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleShare = (platform: string) => {
    const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "")
    const articleTitle = title || ""
    const articleSummary = summary || ""

    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(currentUrl)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
        break
      case "copy":
        navigator.clipboard
          .writeText(currentUrl)
          .then(() => {
            setIsCopied(true)
            toast({
              title: "Link copied!",
              description: "The article link has been copied to your clipboard.",
            })
            setTimeout(() => setIsCopied(false), 2000)
          })
          .catch((err) => {
            console.error("Failed to copy: ", err)
            toast({
              title: "Copy failed",
              description: "Failed to copy the link. Please try again.",
              variant: "destructive",
            })
          })
        return
      default:
        return
    }

    // Open share URL in a new window
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="outline"
        size="icon"
        className={`border-[#222] ${isOpen ? "bg-[#222]" : "bg-[#1a1a1a]"} text-gray-300 hover:text-white hover:bg-[#222] z-10 relative`}
        onClick={toggleMenu}
      >
        <Share2 className="h-4 w-4" />
        <span className="sr-only">Share article</span>
      </Button>

      <div
        ref={menuRef}
        className={`absolute right-0 top-0 flex items-center h-9 bg-[#1a1a1a] border border-[#222] rounded-l-lg px-2 transition-all duration-200 ease-in-out ${
          isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
        }`}
        style={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          paddingRight: "40px",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <button className="p-2 hover:bg-[#222] rounded-md" onClick={() => handleShare("facebook")}>
          <Facebook className="h-4 w-4 text-[#1877F2]" />
          <span className="sr-only">Share on Facebook</span>
        </button>
        <button className="p-2 hover:bg-[#222] rounded-md" onClick={() => handleShare("twitter")}>
          <Twitter className="h-4 w-4 text-[#1DA1F2]" />
          <span className="sr-only">Share on Twitter</span>
        </button>
        <button className="p-2 hover:bg-[#222] rounded-md" onClick={() => handleShare("linkedin")}>
          <Linkedin className="h-4 w-4 text-[#0A66C2]" />
          <span className="sr-only">Share on LinkedIn</span>
        </button>
        <button className="p-2 hover:bg-[#222] rounded-md" onClick={() => handleShare("copy")}>
          {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">{isCopied ? "Copied!" : "Copy Link"}</span>
        </button>
      </div>
    </div>
  )
}

