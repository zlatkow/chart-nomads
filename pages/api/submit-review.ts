/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next"
import formidable from "formidable"
import { createClient } from "@supabase/supabase-js"
// Remove unused imports
// import fs from 'fs';
// import path from 'path';

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Remove the unused STORAGE_BUCKET constant
// const STORAGE_BUCKET = 'proofs';

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

  // Basic validation of Supabase credentials
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({
      error: "Missing Supabase credentials. Please check your environment variables.",
    })
  }

  try {
    // Parse form data with formidable
    const form = formidable({
      multiples: true,
      keepExtensions: true,
      // Limit file size to 500KB to stay under Vercel's 1MB total limit
      maxFileSize: 500 * 1024,
    })

    // Parse the form
    const [fields] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
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
    }

    // Validate required fields
    if (!formData.companyId) {
      return res.status(400).json({ error: "Company ID is required" })
    }

    // Create review data in database
    const { data: reviewData, error: reviewError } = await supabase
      .from("reviews")
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
          status: "pending",
        },
      ])
      .select()

    if (reviewError) {
      return res.status(500).json({ error: "Database error: " + reviewError.message })
    }

    if (!reviewData || reviewData.length === 0) {
      return res.status(500).json({ error: "Failed to create review: No data returned" })
    }

    const reviewId = reviewData[0].id

    // Return success response without handling files
    return res.status(200).json({
      success: true,
      reviewId,
      message: "Review submitted successfully. File uploads are disabled due to size limitations.",
      note: "To handle file uploads, you will need to implement direct client-side uploads to Supabase storage.",
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "An error occurred while processing your review",
      stack: error.stack,
    })
  }
}

