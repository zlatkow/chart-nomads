/* eslint-disable */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or API Key");
}

export const supabase = createClient(supabaseUrl, supabaseKey);



// Type definitions based on your database schema
export type Blog = {
  id: number
  created_at: string
  name: string
  slug: string
  summary: string
  blog_post_body: string
  read_time: number
  featured: boolean
  category: string
  author: string
  image_url: string
}

// Helper functions for blog data
export async function getAllBlogs() {
  const { data, error } = await supabase.from("blogs").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching blogs:", error)
    return []
  }

  return (data || []) as Array<Blog>
}

export async function getFeaturedBlogs() {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching featured blogs:", error)
    return []
  }

  return (data || []) as Array<Blog>
}

export async function getBlogsByCategory(category: string) {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching blogs by category:", error)
    return []
  }

  return (data || []) as Array<Blog>
}

export async function getBlogBySlug(slug: string) {
  const { data, error } = await supabase.from("blogs").select("*").eq("slug", slug).single()

  if (error) {
    console.error("Error fetching blog by slug:", error)
    return null
  }

  return data as Blog
}

