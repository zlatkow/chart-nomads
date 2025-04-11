/* eslint-disable */
"use client"

import Image from "next/image"
import Link from "next/link"
import Tippy from "@tippyjs/react"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons"
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons"
import { faStar } from "@fortawesome/free-solid-svg-icons"

interface PropFirm {
  id: number
  propfirm_name: string
  category?: string
  rating: number
  reviews_count: number
  likes?: number
  logo_url: string
  brand_colour: string
  slug?: string
}

interface PropFirmCardProps {
  firm: PropFirm
  userLikedFirms: Set<number>
  handleLikeToggle: (firmId: number) => void
  handleLoginModalOpen: () => void
}

export default function PropFirmCard({
  firm,
  userLikedFirms,
  handleLikeToggle,
  handleLoginModalOpen,
}: PropFirmCardProps) {
  const isLiked = userLikedFirms.has(firm.id)

  return (
    <div
      key={firm.id}
      className="z-50 p-4 shadow-lg relative bg-[rgba(255,255,255,0.03)] rounded-[10px] 
                 hover:bg-[#0f0f0f] py-7 hover:bg-gradient-to-r 
                 hover:from-[rgba(237,185,0,0.5)] hover:to-[rgba(255,255,255,0.10)] 
                 transition-transform duration-200 hover:scale-[1.03] cursor-pointer
                 border border-[#2a2a2a] mb-6"
    >
      <div className="flex">
        <Tippy
          content={
            <span className="font-medium">
              We use AI to categorize all the companies. You can learn more on our Evaluation process page.
            </span>
          }
          placement="top"
          delay={[100, 0]}
          className="z-50"
          theme="custom"
        >
          <span
            className={`absolute top-3 left-3 px-[5px] border text-xs rounded-[10px] font-medium 
              ${firm.category === "Gold" ? "text-[#efbf04] border-[#efbf04]" : ""}
              ${firm.category === "Platinum" ? "text-[#D9D9D9] border-[#D9D9D9]" : ""}
              ${firm.category === "Diamond" ? "text-[#c8bfe7] border-[#c8bfe7]" : ""}
              ${firm.category === "Silver" ? "text-[#c4c4c4] border-[#c4c4c4]" : ""}
              ${firm.category === "Copper" ? "text-[#c68346] border-[#c68346]" : ""}`}
          >
            {firm.category}
          </span>
        </Tippy>

        <SignedOut>
          <button
            onClick={() => handleLoginModalOpen()}
            className="absolute top-3 right-3 hover:animate-[heartbeat_1.5s_infinite_ease-in-out] z-60"
            style={{ color: "rgba(237, 185, 0, 0.3)" }}
          >
            <FontAwesomeIcon icon={regularHeart} style={{ fontSize: "25px" }} />
          </button>
        </SignedOut>

        <SignedIn>
          <button
            onClick={() => handleLikeToggle(firm.id)}
            className={`absolute top-3 right-3 transition-all duration-200 ${
              isLiked
                ? "text-[#EDB900] scale-105 hover:animate-[heartbeat_1.5s_infinite_ease-in-out]"
                : "text-[rgba(237,185,0,0.3)] hover:text-[#EDB900] hover:animate-[heartbeat_1.5s_infinite_ease-in-out]"
            }`}
          >
            <FontAwesomeIcon icon={isLiked ? solidHeart : regularHeart} className="text-[25px]" />
          </button>
        </SignedIn>
      </div>

      <Link href={`/prop-firms/${firm.slug}`} passHref>
        {/* Firm Logo & Info */}
        <div className="flex justify-between">
          <div
            className="w-20 h-20 mb-2 flex items-center justify-center rounded-[10px] p-1 mt-[50px]"
            style={{ backgroundColor: firm.brand_colour }}
          >
            <Image
              src={firm.logo_url || "/placeholder.svg?height=40&width=40"}
              alt={firm.propfirm_name}
              width={48}
              height={40}
              style={{ maxHeight: "40px", width: "auto" }}
            />
          </div>

          <div className="block mt-9 min-w-[150px] justify-center">
            <h3 className="text-2xl text-center">{firm.propfirm_name}</h3>
            <p className="text-center text-2xl text-[#EDB900]">
              <FontAwesomeIcon icon={faStar} className="text-lg" />
              <span className="text-white"> {firm.rating}</span>
            </p>
            <p className="text-center text-xs text-black bg-yellow-500 px-2 py-[5px] rounded-[8px] mt-2 min-w-[80px] w-fit mx-auto">
              {firm.reviews_count} reviews
            </p>
            <p className="absolute top-4 right-[45px] text-center text-xs">{firm.likes} Likes</p>
          </div>
        </div>
      </Link>
    </div>
  )
}
