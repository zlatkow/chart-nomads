import type { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Validate credentials
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({
        error: "Missing Supabase credentials",
        env: {
          supabaseUrl: !!supabaseUrl,
          supabaseServiceKey: !!supabaseServiceKey,
        },
      })
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const { message = "Test message from API" } = req.body || {}

    // Insert a record into the test table
    const { data, error } = await supabase
      .from("test_table")
      .insert([{ message, created_at: new Date().toISOString() }])
      .select()

    if (error) {
      return res.status(500).json({
        error: "Supabase error",
        details: error,
      })
    }

    // Return success response
    return res.status(200).json({
      success: true,
      data,
      message: "Test record created successfully",
    })
  } catch (error: any) {
    console.error("Error in test endpoint:", error)
    return res.status(500).json({
      success: false,
      error: error.message || "Unknown error",
      stack: error.stack,
    })
  }
}

