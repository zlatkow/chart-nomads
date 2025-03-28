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
    console.log("Received request body:", JSON.stringify(jsonData, null, 2))

    // Extract the company ID
    const companyId = jsonData?.companyId
    console.log("Extracted companyId:", companyId, "type:", typeof companyId)

    // Validate company ID
    if (!companyId) {
      console.log("Missing company ID")
      return res.status(400).json({ error: "Company ID is required" })
    }

    // Create a review record matching the database schema
    console.log("Creating review record")

    try {
      // First, get the current max ID to determine the next ID
      const { data: maxIdData, error: maxIdError } = await supabase
        .from("propfirm_reviews")
        .select("id")
        .order("id", { ascending: false })
        .limit(1)
        .single()

      if (maxIdError && maxIdError.code !== "PGRST116") {
        console.log("Error fetching max ID:", maxIdError)
        return res.status(500).json({
          error: "Failed to determine next ID: " + maxIdError.message,
          details: maxIdError,
        })
      }

      // Calculate next ID (current max + 1, or 1 if no records exist)
      const nextId = maxIdData ? maxIdData.id + 1 : 1
      console.log("Next ID will be:", nextId)

      // Extract individual ratings from the ratings object
      const ratings = jsonData.ratings || {}

      // Get the user ID from the request
      const userId = jsonData.userId || null
      if (!userId) {
        console.log("Missing user ID")
        return res.status(400).json({ error: "User ID is required" })
      }

      // Prepare review data with fallbacks for all fields
      const reviewData = {
        id: nextId, // Explicitly set the ID
        prop_firm: Number.parseInt(companyId, 10), // Convert to integer as per schema
        reviewer: userId, // Use the user ID from Clerk instead of "Anonymous"
        trading_conditions_rating: ratings.tradingConditions || 0,
        customer_support_rating: ratings.customerSupport || 0,
        inner_processes_rating: ratings.innerProcesses || 0,
        dashboard_ux_rating: ratings.dashboard || 0,
        education_community_rating: ratings.education || 0,
        // overall_rating is calculated in the database
        detailed_review: jsonData.reviewText || "",
        most_liked_aspect: jsonData.likedMost || "",
        most_disliked_aspect: jsonData.dislikedMost || "",
        account_type: jsonData.accountType || "",
        account_size: jsonData.accountSize || "",
        trading_period: jsonData.tradingDuration || "",
        funded_status: jsonData.fundedStatus || "",
        received_payout: jsonData.payoutStatus || "",
        proofs: {}, // Empty JSON object for proofs
        reported_issues: !!jsonData.reportIssue,
        review_status: "pending",
      }

      // If there's a report issue, add the report details to the proofs JSON
      if (jsonData.reportIssue) {
        reviewData.proofs = {
          reportReason: jsonData.reportReason || "",
          reportDescription: jsonData.reportDescription || "",
          // Add other report-specific fields if needed
          breachedAccountSize: jsonData.breachedAccountSize || "",
          breachReason: jsonData.breachReason || "",
          breachDetails: jsonData.breachDetails || "",
          receivedLastPayout: jsonData.receivedLastPayout || "",
          deniedAmount: jsonData.deniedAmount || "",
          payoutDenialReason: jsonData.payoutDenialReason || "",
          payoutDenialDetails: jsonData.payoutDenialDetails || "",
        }
      }

      console.log("Review data prepared:", JSON.stringify(reviewData, null, 2))

      // Insert the review with the explicit ID
      const { data, error } = await supabase.from("propfirm_reviews").insert([reviewData]).select()

      if (error) {
        console.log("Database error:", error)
        return res.status(500).json({
          error: "Database error: " + error.message,
          details: error,
          code: error.code,
          hint: error.hint,
        })
      }

      console.log("Review created successfully:", data)

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
        stack: dbError.stack,
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

