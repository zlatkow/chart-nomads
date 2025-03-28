import type { NextApiRequest, NextApiResponse } from "next"

// Allow the API to receive form data
export const config = {
  api: {
    bodyParser: true, // Change to true for this test
  },
}

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
    // Return basic info about the request to diagnose
    return res.status(200).json({
      success: true,
      message: "Test endpoint working",
      receivedMethod: req.method,
      contentType: req.headers["content-type"],
      bodySize: JSON.stringify(req.body).length,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
    })
  } catch (error) {
    console.error("Error in test endpoint:", error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}

