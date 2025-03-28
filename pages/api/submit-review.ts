/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next"
import formidable from "formidable"
import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// IMPORTANT: Use the correct bucket name
const STORAGE_BUCKET = "proofs" // Changed from 'reviews' to 'proofs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers to prevent issues
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  // Handle OPTIONS request for CORS preflight
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
      maxFileSize: 10 * 1024 * 1024, // 10MB max file size
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

    // Extract form data - Fix type issues by using proper type checking
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
      // Fix for the reportIssue field - convert to string before comparison
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

    // 1. Get the next review number
    let existingFolders
    try {
      const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(`company-${formData.companyId}`)

      if (error) {
        // If the folder doesn't exist yet, create it
        if (error.message.includes("not found")) {
          existingFolders = []
        } else {
          return res.status(500).json({ error: "Failed to access storage: " + error.message })
        }
      } else {
        existingFolders = data
      }
    } catch (storageError: any) {
      return res.status(500).json({ error: "Storage error: " + storageError.message })
    }

    // Create a new review folder with incremented number
    let reviewNumber = 1
    if (existingFolders && existingFolders.length > 0) {
      // Extract numbers from existing review folders and find the max
      const folderNumbers = existingFolders
        .map((folder) => {
          const match = folder.name.match(/review-(\d+)/)
          return match ? Number.parseInt(match[1], 10) : 0
        })
        .filter((num) => !isNaN(num))

      if (folderNumbers.length > 0) {
        reviewNumber = Math.max(...folderNumbers) + 1
      }
    }

    // 2. Create review data in database
    try {
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
            breached_account_size: formData.breachedAccountSize,
            breach_reason: formData.breachReason,
            breach_details: formData.breachDetails,
            received_last_payout: formData.receivedLastPayout,
            denied_amount: formData.deniedAmount,
            payout_denial_reason: formData.payoutDenialReason,
            payout_denial_details: formData.payoutDenialDetails,
            review_number: reviewNumber,
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

      // 3. Upload files to Supabase Storage
      const reviewId = reviewData[0].id
      const reviewFolderPath = `company-${formData.companyId}/review-${reviewNumber}`

      // Helper function to upload a file
      const uploadFile = async (file: any, subfolder: string): Promise<string | null> => {
        if (!file) return null

        try {
          const fileContent = await fs.promises.readFile(file.filepath)
          const fileName = path.basename(file.originalFilename || "file")

          const uploadPath = `${reviewFolderPath}/${subfolder}/${fileName}`

          const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET) // Use the correct bucket name
            .upload(uploadPath, fileContent, {
              contentType: file.mimetype || "application/octet-stream",
              upsert: true,
            })

          if (error) {
            console.error(`Error uploading ${subfolder} file:`, error)
            return null
          }

          return data?.path || null
        } catch (fileError) {
          console.error(`Error processing ${subfolder} file:`, fileError)
          return null
        }
      }

      // Initialize file paths
      let proofFilePath = null
      let fundedProofFilePath = null
      let payoutProofFilePath = null
      const proofFilePaths: string[] = []

      // Upload main proof file if it exists
      if (files.proofFile) {
        const proofFile = files.proofFile
        const fileToUpload = Array.isArray(proofFile) ? proofFile[0] : proofFile
        if (fileToUpload) {
          proofFilePath = await uploadFile(fileToUpload, "proof")
        }
      }

      // Upload funded proof file if it exists
      if (files.fundedProofFile) {
        const fundedProofFile = files.fundedProofFile
        const fileToUpload = Array.isArray(fundedProofFile) ? fundedProofFile[0] : fundedProofFile
        if (fileToUpload) {
          fundedProofFilePath = await uploadFile(fileToUpload, "funded-proof")
        }
      }

      // Upload payout proof file if it exists
      if (files.payoutProofFile) {
        const payoutProofFile = files.payoutProofFile
        const fileToUpload = Array.isArray(payoutProofFile) ? payoutProofFile[0] : payoutProofFile
        if (fileToUpload) {
          payoutProofFilePath = await uploadFile(fileToUpload, "payout-proof")
        }
      }

      // Upload report proof files if they exist
      if (files.proofFiles) {
        const proofFiles = files.proofFiles
        const proofFilesArray = Array.isArray(proofFiles) ? proofFiles : [proofFiles]

        for (let i = 0; i < proofFilesArray.length; i++) {
          if (proofFilesArray[i]) {
            try {
              const filePath = await uploadFile(proofFilesArray[i], `report-proof-${i + 1}`)
              if (filePath) proofFilePaths.push(filePath)
            } catch (error) {
              console.error(`Error uploading report proof file ${i + 1}:`, error)
            }
          }
        }
      }

      // 4. Update review record with file paths
      try {
        const { error: updateError } = await supabase
          .from("reviews")
          .update({
            proof_file_path: proofFilePath,
            funded_proof_file_path: fundedProofFilePath,
            payout_proof_file_path: payoutProofFilePath,
            report_proof_file_paths: proofFilePaths.length > 0 ? proofFilePaths : null,
          })
          .eq("id", reviewId)

        if (updateError) {
          // Continue anyway since the review was created
          console.error("Error updating review with file paths:", updateError)
        }
      } catch (updateError) {
        // Continue anyway since the review was created
        console.error("Unexpected error updating review:", updateError)
      }

      // Return success response
      return res.status(200).json({
        success: true,
        reviewId,
        reviewNumber,
        message: "Review submitted successfully",
      })
    } catch (dbError: any) {
      return res.status(500).json({ error: "Database operation failed: " + dbError.message })
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "An error occurred while processing your review",
      stack: error.stack,
    })
  }
}

