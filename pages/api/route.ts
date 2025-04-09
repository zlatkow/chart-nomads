import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Fetching prop firm challenges...")

    // First, get all prop firms to have their details
    const { data: firms, error: firmsError } = await supabase
      .from("prop_firms")
      .select("*")
      .eq("listing_status", "listed")

    if (firmsError) {
      console.error("Error fetching prop firms:", firmsError)
      return NextResponse.json({ error: "Failed to fetch prop firms" }, { status: 500 })
    }

    // Then get all challenges
    const { data: challenges, error: challengesError } = await supabase.from("propfirm_challenges").select("*")

    if (challengesError) {
      console.error("Error fetching challenges:", challengesError)
      return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 })
    }

    console.log(`Successfully fetched ${challenges.length} challenges`)
    return NextResponse.json({ firms, challenges })
  } catch (error) {
    console.error("Unexpected error in prop-firm-challenges API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
