import type { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"
import formidable from "formidable"

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
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
    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Validate credentials
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({
        error: "Missing Supabase credentials. Please check your environment variables.",
      })
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse form data with formidable - but don't handle file uploads yet
    const form = formidable({
      multiples: true,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB max file size
    })

    // Parse the form
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err)
        }
        resolve([fields, files])
      })
    })

    // Extract form data
    const formData = {
      companyId: fields.companyId?.[0] || fields.companyId || "",
      accountSize: fields.accountSize?.[0] || fields.accountSize || "",
      accountType: fields.accountType?.[0] || fields.accountType || "",
      tradingDuration: fields.tradingDuration?.[0] || fields.tradingDuration || "",
      fundedStatus: fields.fundedStatus?.[0] || fields.fundedStatus || "",
      payoutStatus: fields.payoutStatus?.[0] || fields.payoutStatus || "",
      ratings: JSON.parse(fields.ratings?.[0] || fields.ratings?.toString() || "{}"),
      reviewText: fields.reviewText?.[0] || fields.reviewText || "",
      likedMost: fields.likedMost?.[0] || fields.likedMost || "",
      dislikedMost: fields.dislikedMost?.[0] || fields.dislikedMost || "",
      reportIssue: String(fields.reportIssue?.[0] || fields.reportIssue || "") === "true",
      reportReason: fields.reportReason?.[0] || fields.reportReason || "",
      reportDescription: fields.reportDescription?.[0] || fields.reportDescription || "",
      breachedAccountSize: fields.breachedAccountSize?.[0] || fields.breachedAccountSize || "",
      breachReason: fields.breachReason?.[0] || fields.breachReason || "",
      breachDetails: fields.breachDetails?.[0] || fields.breachDetails || "",
      receivedLastPayout: fields.receivedLastPayout?.[0] || fields.receivedLastPayout || "",
      deniedAmount: fields.deniedAmount?.[0] || fields.deniedAmount || "",
      payoutDenialReason: fields.payoutDenialReason?.[0] || fields.payoutDenialReason || "",
      payoutDenialDetails: fields.payoutDenialDetails?.[0] || fields.payoutDenialDetails || "",
    }

    // Validate required fields
    if (!formData.companyId) {
      return res.status(400).json({ error: "Company ID is required" })
    }

    // Create review data in database first (without file uploads)
    const { data: reviewData, error: reviewError } = await supabase
      .from("propfirm_reviews")
      .insert([
        {
          company_id: formData.companyId,
          account_size: formData.accountSize,
          account_type: formData.accountType,
          trading_duration: formData.tradingDuration,
          funded_status: formData.fundedStatus,
          payout_status: formData.payoutStatus,
          ratings: formData.ratings,
          review_text: formData.reviewText,
          liked_most: formData.likedMost,
          disliked_most: formData.dislikedMost,
          report_issue: formData.reportIssue,
          report_reason: formData.reportReason,
          report_description: formData.reportDescription,
          breached_account_size: formData.breachedAccountSize,
          breach_reason: formData.breachReason,
          breach_details: formData.breachDetails,
          received_last_payout: formData.receivedLastPayout,
          denied_amount: formData.deniedAmount,
          payout_denial_reason: formData.payoutDenialReason,
          payout_denial_details: formData.payoutDenialDetails,
          status: "pending",
        },
      ])
      .select()

    if (reviewError) {
      return res.status(500).json({
        error: "Database error: " + reviewError.message,
        details: reviewError,
      })
    }

    if (!reviewData || reviewData.length === 0) {
      return res.status(500).json({ error: "Failed to create review: No data returned" })
    }

    const reviewId = reviewData[0].id

    // Return success response without handling files
    return res.status(200).json({
      success: true,
      reviewId,
      message: "Review submitted successfully",
      note: "Note: Due to size limitations, file uploads are not processed in this version. The review data has been saved.",
    })
  } catch (error: any) {
    console.error("Error processing review submission:", error)
    return res.status(500).json({
      success: false,
      error: error.message || "An error occurred while processing your review",
      stack: error.stack,
    })
  }
}

