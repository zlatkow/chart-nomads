/* eslint-disable */
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Fetching prop firm challenges...")

    // Fetch challenges with their related prop firm data in a single query
    const { data: challenges, error: challengesError } = await supabase
      .from("propfirm_challenges")
      .select(`
        *,
        prop_firm:prop_firm (*)
      `)

    if (challengesError) {
      console.error("Error fetching challenges:", challengesError)
      return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 })
    }

    // Log success for debugging
    console.log(`Successfully fetched ${challenges.length} challenges with their prop firm data`)

    return NextResponse.json({ challenges })
  } catch (error) {
    console.error("Unexpected error in prop-firm-challenges API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

