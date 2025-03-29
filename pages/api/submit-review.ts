/* eslint-disable */
import type { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"
import formidable from "formidable"
import fs from "fs"
import path from "path"

// Disable body parser to handle FormData with files
export const config = {
  api: {
    bodyParser: false,
  },
}

// Define types for our problem report
interface ProblemReport {
  reportReason?: string
  reportDescription?: string
  breachedAccountSize?: string
  breachReason?: string
  breachDetails?: string
  receivedLastPayout?: string
  deniedAmount?: string
  payoutDenialReason?: string
  payoutDenialDetails?: string
  proofs?: Record<string, string>
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

    // Parse the incoming form data
    const form = formidable({
      multiples: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB max file size
    })

    const parseForm = async (): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
      return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err)
          else resolve({ fields, files })
        })
      })
    }

    const { fields, files } = await parseForm()

    // Get JSON data from the parsed form
    const jsonData = JSON.parse(fields.data?.[0] as string)
    console.log("Received JSON data:", JSON.stringify(jsonData, null, 2))

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

      // Create folder name for this review
      const folderName = `review${nextId}`

      // Extract individual ratings from the ratings object
      const ratings = jsonData.ratings || {}

      // Get the user ID from the request
      const userId = jsonData.userId || null
      if (!userId) {
        console.log("Missing user ID")
        return res.status(400).json({ error: "User ID is required" })
      }

      // Object to store main proof file URLs
      const proofs: Record<string, string> = {}

      // Object to store problem report proof file URLs
      const problemReportProofs: Record<string, string> = {}

      // Upload files to Supabase Storage
      const fileUploadPromises = []

      // Helper function to upload a file
      const uploadFile = async (file: formidable.File, key: string) => {
        try {
          const fileContent = await fs.promises.readFile(file.filepath)
          const fileName = `${folderName}/${key}_${Date.now()}${path.extname(file.originalFilename || "")}`

          const { data, error } = await supabase.storage.from("proofs").upload(fileName, fileContent, {
            contentType: file.mimetype || "application/octet-stream",
            upsert: false,
          })

          if (error) {
            console.error(`Error uploading ${key}:`, error)
            return null
          }

          // Get public URL for the file
          const { data: urlData } = supabase.storage.from("proofs").getPublicUrl(fileName)

          return { key, url: urlData.publicUrl }
        } catch (error) {
          console.error(`Error processing ${key}:`, error)
          return null
        } finally {
          // Clean up temp file
          try {
            await fs.promises.unlink(file.filepath)
          } catch (unlinkError) {
            console.error("Error deleting temp file:", unlinkError)
          }
        }
      }

      // Process main proof files
      if (files.proof_of_purchase) {
        const file = Array.isArray(files.proof_of_purchase) ? files.proof_of_purchase[0] : files.proof_of_purchase
        fileUploadPromises.push(uploadFile(file, "proof_of_purchase"))
      }

      if (files.proof_of_funding) {
        const file = Array.isArray(files.proof_of_funding) ? files.proof_of_funding[0] : files.proof_of_funding
        fileUploadPromises.push(uploadFile(file, "proof_of_funding"))
      }

      if (files.proof_of_payout) {
        const file = Array.isArray(files.proof_of_payout) ? files.proof_of_payout[0] : files.proof_of_payout
        fileUploadPromises.push(uploadFile(file, "proof_of_payout"))
      }

      // Process problem report proofs
      for (let i = 1; i <= 6; i++) {
        const key = `problem_report_proof_${i}`
        if (files[key]) {
          const file = Array.isArray(files[key]) ? files[key][0] : files[key]
          fileUploadPromises.push(uploadFile(file, key))
        }
      }

      // Wait for all file uploads to complete
      const uploadResults = await Promise.all(fileUploadPromises)

      // Separate the file URLs into the appropriate objects
      uploadResults.forEach((result) => {
        if (result) {
          if (result.key.startsWith("problem_report_proof_")) {
            // Store problem report proofs in the problemReportProofs object
            problemReportProofs[result.key] = result.url
          } else {
            // Store main proofs in the proofs object
            proofs[result.key] = result.url
          }
        }
      })

      // Initialize problem report with proper typing
      const problemReport: ProblemReport = {}

      // If there's a report issue, add the report details to the problem_report
      if (jsonData.reportIssue && jsonData.problem_report) {
        // Copy all properties from jsonData.problem_report to problemReport
        Object.assign(problemReport, jsonData.problem_report)

        // Add the problem report proof URLs to the problem_report object
        if (Object.keys(problemReportProofs).length > 0) {
          problemReport.proofs = problemReportProofs
        }
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
        proofs: proofs, // Add the main proof file URLs
        reported_issues: !!jsonData.reportIssue,
        review_status: "pending",
        problem_report: problemReport, // Use the properly typed problem report object
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
        proofs: proofs,
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

