/* eslint-disable */
import type { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"

// Enable the default body parser for JSON
export const config = {
  api: {
    bodyParser: true, // Enable JSON body parsing
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
    console.log("API route started")

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Validate credentials
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log("Missing Supabase credentials")
      return res.status(500).json({
        error: "Missing Supabase credentials. Please check your environment variables.",
      })
    }

    console.log("Supabase credentials validated")

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get JSON data from request body
    const jsonData = req.body
    console.log("Received JSON data:", JSON.stringify(jsonData))

    // Extract the company ID
    const companyId = jsonData.companyId

    // Log the company ID for debugging
    console.log("Company ID:", companyId)

    // Validate company ID
    if (!companyId) {
      console.log("Missing company ID")
      return res.status(400).json({ error: "Company ID is required" })
    }

    // Create a minimal review record
    console.log("Creating review record")

    try {
      // Extract ratings with fallback
      const ratingsData = jsonData.ratings || {}

      // Prepare review data with fallbacks for all fields
      const reviewData = {
        company_id: companyId,
        account_size: jsonData.accountSize || "",
        account_type: jsonData.accountType || "",
        trading_duration: jsonData.tradingDuration || "",
        funded_status: jsonData.fundedStatus || "",
        payout_status: jsonData.payoutStatus || "",
        ratings: ratingsData,
        review_text: jsonData.reviewText || "",
        liked_most: jsonData.likedMost || "",
        disliked_most: jsonData.dislikedMost || "",
        report_issue: !!jsonData.reportIssue,
        report_reason: jsonData.reportReason || "",
        report_description: jsonData.reportDescription || "",
        status: "pending",
        created_at: new Date().toISOString(),
      }

      console.log("Review data prepared:", JSON.stringify(reviewData))

      // Insert the review
      const { data, error } = await supabase.from("propfirm_reviews").insert([reviewData]).select()

      if (error) {
        console.log("Database error:", error)
        return res.status(500).json({
          error: "Database error: " + error.message,
          details: error,
        })
      }

      console.log("Review created successfully")

      // Return success response
      return res.status(200).json({
        success: true,
        reviewId: data?.[0]?.id,
        message: "Review submitted successfully",
      })
    } catch (dbError: any) {
      console.log("Database operation error:", dbError)
      return res.status(500).json({
        error: "Database operation failed: " + dbError.message,
      })
    }
  } catch (error: any) {
    console.error("Error processing review submission:", error)
    return res.status(500).json({
      success: false,
      error: error.message || "An unknown error occurred",
      stack: error.stack,
    })
  }
}

