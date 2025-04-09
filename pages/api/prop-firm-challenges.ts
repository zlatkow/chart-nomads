/* eslint-disable */
import type { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "@/lib/supabase"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    console.log("Fetching prop firm challenges...")

    // First, get all prop firms to have their details
    const { data: firms, error: firmsError } = await supabase
      .from("prop_firms")
      .select("*")
      .eq("listing_status", "listed")

    if (firmsError) {
      console.error("Error fetching prop firms:", firmsError)
      return res.status(500).json({ error: "Failed to fetch prop firms" })
    }

    // Then get all challenges
    const { data: challenges, error: challengesError } = await supabase.from("propfirm_challenges").select("*")

    if (challengesError) {
      console.error("Error fetching challenges:", challengesError)
      return res.status(500).json({ error: "Failed to fetch challenges" })
    }

    // Log success for debugging
    console.log(`Successfully fetched ${firms.length} firms and ${challenges.length} challenges`)

    return res.status(200).json({ firms, challenges })
  } catch (error) {
    console.error("Unexpected error in prop-firm-challenges API:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
