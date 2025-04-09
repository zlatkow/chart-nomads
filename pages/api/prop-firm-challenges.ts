/* eslint-disable */
import type { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "@/lib/supabase"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    console.log("Fetching prop firm challenges...")

    // Use the proper foreign key reference with nested selection
    const { data: challenges, error: challengesError } = await supabase.from("propfirm_challenges").select(`
        *,
        prop_firm (
          id,
          propfirm_name,
          logo_url,
          brand_colour,
          rating,
          reviews_count
        )
      `)

    if (challengesError) {
      console.error("Error fetching challenges with prop firms:", challengesError)
      return res.status(500).json({
        error: "Failed to fetch challenges with prop firms",
        details: challengesError.message,
      })
    }

    // Log success for debugging
    console.log(`Successfully fetched ${challenges.length} challenges with their prop firm data`)

    return res.status(200).json({ challenges })
  } catch (error) {
    console.error("Unexpected error in prop-firm-challenges API:", error)
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
