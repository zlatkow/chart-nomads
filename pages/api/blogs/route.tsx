import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const sort = searchParams.get("sort") || "newest"
  const featured = searchParams.get("featured") === "true"

  let query = supabase.from("blogs").select("*")

  // Apply filters
  if (category && category !== "all") {
    query = query.eq("category", category)
  }

  if (featured) {
    query = query.eq("featured", true)
  }

  // Get data
  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Apply sorting
  let sortedData = [...data]
  if (sort === "oldest") {
    sortedData = sortedData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  } else if (sort === "newest") {
    sortedData = sortedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else if (sort === "popular") {
    sortedData = sortedData.sort((a, b) => b.read_time - a.read_time)
  }

  return NextResponse.json(sortedData)
}

