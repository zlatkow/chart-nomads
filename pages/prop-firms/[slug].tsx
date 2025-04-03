/* eslint-disable */
"use client"
import { useParams } from "next/navigation"
import PropFirmUI from "./PropFirmPageUI"

export default function PropFirmPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug || ""

  return <PropFirmUI slug={slug} isLoading={!slug} />
}

