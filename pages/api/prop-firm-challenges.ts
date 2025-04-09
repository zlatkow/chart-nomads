/* eslint-disable */
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Fetching prop firm challenges...")

    // First, try a simple query to test the connection
    const { data: testData, error: testError } = await supabase.from("propfirm_challenges").select("id").limit(1)

    if (testError) {
      console.error("Database connection test failed:", testError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: testError.message,
        },
        { status: 500 },
      )
    }

    // Try to get all challenges without the nested query first
    const { data: challenges, error: challengesError } = await supabase.from("propfirm_challenges").select("*")

    if (challengesError) {
      console.error("Error fetching challenges:", challengesError)
      return NextResponse.json(
        {
          error: "Failed to fetch challenges",
          details: challengesError.message,
        },
        { status: 500 },
      )
    }

    // Then get all prop firms
    const { data: firms, error: firmsError } = await supabase.from("prop_firms").select("*")

    if (firmsError) {
      console.error("Error fetching prop firms:", firmsError)
      return NextResponse.json(
        {
          error: "Failed to fetch prop firms",
          details: firmsError.message,
          challenges: challenges, // Return challenges anyway
        },
        { status: 200 },
      ) // Return 200 since we have partial data
    }

    // Manually join the data
    const challengesWithFirms = challenges.map((challenge) => {
      const firm = firms.find((f) => f.id === challenge.prop_firm_id) || null
      return {
        ...challenge,
        prop_firm: firm,
      }
    })

    // Log success for debugging
    console.log(`Successfully fetched ${challengesWithFirms.length} challenges with their prop firm data`)

    return NextResponse.json({ challenges: challengesWithFirms })
  } catch (error) {
    console.error("Unexpected error in prop-firm-challenges API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
