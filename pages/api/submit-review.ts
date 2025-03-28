/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log("Starting review submission process");
    
    // Parse form data with formidable
    const form = formidable({ 
      multiples: true,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB max file size
    });

    console.log("Parsing form data...");
    
    // Parse the form
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Form parsing error:", err);
          reject(err);
        }
        console.log("Form fields received:", Object.keys(fields));
        console.log("Files received:", Object.keys(files));
        resolve([fields, files]);
      });
    });

    console.log("Form data parsed successfully");

    // Extract form data - Fix type issues by using proper type checking
    const formData = {
      companyId: fields.companyId?.[0] || fields.companyId || '',
      accountSize: fields.accountSize?.[0] || fields.accountSize || '',
      accountType: fields.accountType?.[0] || fields.accountType || '',
      tradingDuration: fields.tradingDuration?.[0] || fields.tradingDuration || '',
      fundedStatus: fields.fundedStatus?.[0] || fields.fundedStatus || '',
      payoutStatus: fields.payoutStatus?.[0] || fields.payoutStatus || '',
      ratings: JSON.parse(fields.ratings?.[0] || fields.ratings?.toString() || '{}'),
      reviewText: fields.reviewText?.[0] || fields.reviewText || '',
      likedMost: fields.likedMost?.[0] || fields.likedMost || '',
      dislikedMost: fields.dislikedMost?.[0] || fields.dislikedMost || '',
      // Fix for the reportIssue field - convert to string before comparison
      reportIssue: String(fields.reportIssue?.[0] || fields.reportIssue || '') === 'true',
      reportReason: fields.reportReason?.[0] || fields.reportReason || '',
      reportDescription: fields.reportDescription?.[0] || fields.reportDescription || '',
      breachedAccountSize: fields.breachedAccountSize?.[0] || fields.breachedAccountSize || '',
      breachReason: fields.breachReason?.[0] || fields.breachReason || '',
      breachDetails: fields.breachDetails?.[0] || fields.breachDetails || '',
      receivedLastPayout: fields.receivedLastPayout?.[0] || fields.receivedLastPayout || '',
      deniedAmount: fields.deniedAmount?.[0] || fields.deniedAmount || '',
      payoutDenialReason: fields.payoutDenialReason?.[0] || fields.payoutDenialReason || '',
      payoutDenialDetails: fields.payoutDenialDetails?.[0] || fields.payoutDenialDetails || '',
    };

    console.log("Form data extracted:", { companyId: formData.companyId });

    // Validate required fields
    if (!formData.companyId) {
      console.error("Missing required field: companyId");
      return res.status(400).json({ error: 'Company ID is required' });
    }

    try {
      console.log("Checking if storage bucket exists...");
      
      // Check if the bucket exists
      const { data: buckets, error: bucketError } = await supabase
        .storage
        .listBuckets();
        
      if (bucketError) {
        console.error("Error listing buckets:", bucketError);
        return res.status(500).json({ error: 'Failed to access storage buckets' });
      }
      
      const reviewsBucketExists = buckets.some(bucket => bucket.name === 'reviews');
      if (!reviewsBucketExists) {
        console.error("Reviews bucket does not exist");
        return res.status(500).json({ error: 'Reviews storage bucket does not exist' });
      }
      
      console.log("Reviews bucket exists, proceeding...");
    } catch (bucketError) {
      console.error("Error checking buckets:", bucketError);
      return res.status(500).json({ error: 'Failed to check storage buckets' });
    }

    // 1. Get the next review number
    console.log(`Listing folders for company-${formData.companyId}...`);
    
    let existingFolders;
    try {
      const { data, error } = await supabase
        .storage
        .from('reviews')
        .list(`company-${formData.companyId}`);
        
      if (error) {
        console.error('Error listing folders:', error);
        
        // If the folder doesn't exist yet, create it
        if (error.message.includes('not found')) {
          console.log("Company folder doesn't exist yet, will create it");
          existingFolders = [];
        } else {
          return res.status(500).json({ error: 'Failed to access storage: ' + error.message });
        }
      } else {
        existingFolders = data;
        console.log(`Found ${existingFolders.length} existing review folders`);
      }
    } catch (storageError) {
      console.error('Unexpected storage error:', storageError);
      return res.status(500).json({ error: 'Unexpected storage error' });
    }

    // Create a new review folder with incremented number
    let reviewNumber = 1;
    if (existingFolders && existingFolders.length > 0) {
      // Extract numbers from existing review folders and find the max
      const folderNumbers = existingFolders
        .map(folder => {
          const match = folder.name.match(/review-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => !isNaN(num));

      if (folderNumbers.length > 0) {
        reviewNumber = Math.max(...folderNumbers) + 1;
      }
    }
    
    console.log(`Using review number: ${reviewNumber}`);

    // 2. Create review data in database
    console.log("Creating review in database...");
    
    try {
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
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
            status: 'pending',
          }
        ])
        .select();

      if (reviewError) {
        console.error('Error creating review:', reviewError);
        return res.status(500).json({ error: 'Failed to create review: ' + reviewError.message });
      }
      
      if (!reviewData || reviewData.length === 0) {
        console.error('No review data returned after insert');
        return res.status(500).json({ error: 'Failed to create review: No data returned' });
      }
      
      console.log(`Review created with ID: ${reviewData[0].id}`);
      
      // 3. Upload files to Supabase Storage
      const reviewId = reviewData[0].id;
      const reviewFolderPath = `company-${formData.companyId}/review-${reviewNumber}`;
      
      console.log(`Using folder path: ${reviewFolderPath}`);
      
      // Helper function to upload a file
      const uploadFile = async (file: formidable.File, subfolder: string): Promise<string | null> => {
        if (!file) return null;
        
        try {
          console.log(`Reading file: ${file.originalFilename || 'unnamed file'}`);
          const fileContent = await fs.promises.readFile(file.filepath);
          const fileName = path.basename(file.originalFilename || 'file');
          
          const uploadPath = `${reviewFolderPath}/${subfolder}/${fileName}`;
          console.log(`Uploading to: ${uploadPath}`);
          
          const { data, error } = await supabase
            .storage
            .from('reviews')
            .upload(uploadPath, fileContent, {
              contentType: file.mimetype || 'application/octet-stream',
              upsert: true,
            });
            
          if (error) {
            console.error(`Error uploading ${subfolder} file:`, error);
            return null;
          }
          
          console.log(`File uploaded successfully to: ${data?.path}`);
          return data?.path || null;
        } catch (fileError) {
          console.error(`Error processing ${subfolder} file:`, fileError);
          return null;
        }
      };

      // Initialize file paths
      let proofFilePath = null;
      let fundedProofFilePath = null;
      let payoutProofFilePath = null;
      const proofFilePaths: string[] = [];
      
      // Upload main proof file if it exists
      if (files.proofFile) {
        console.log("Uploading main proof file...");
        const proofFile = files.proofFile;
        const fileToUpload = Array.isArray(proofFile) ? proofFile[0] : proofFile;
        if (fileToUpload) {
          proofFilePath = await uploadFile(fileToUpload, 'proof');
        }
      }

      // Upload funded proof file if it exists
      if (files.fundedProofFile) {
        console.log("Uploading funded proof file...");
        const fundedProofFile = files.fundedProofFile;
        const fileToUpload = Array.isArray(fundedProofFile) ? fundedProofFile[0] : fundedProofFile;
        if (fileToUpload) {
          fundedProofFilePath = await uploadFile(fileToUpload, 'funded-proof');
        }
      }

      // Upload payout proof file if it exists
      if (files.payoutProofFile) {
        console.log("Uploading payout proof file...");
        const payoutProofFile = files.payoutProofFile;
        const fileToUpload = Array.isArray(payoutProofFile) ? payoutProofFile[0] : payoutProofFile;
        if (fileToUpload) {
          payoutProofFilePath = await uploadFile(fileToUpload, 'payout-proof');
        }
      }

      // Upload report proof files if they exist
      if (files.proofFiles) {
        console.log("Uploading report proof files...");
        const proofFiles = files.proofFiles;
        const proofFilesArray = Array.isArray(proofFiles) ? proofFiles : [proofFiles];
        
        for (let i = 0; i < proofFilesArray.length; i++) {
          if (proofFilesArray[i]) {
            try {
              const filePath = await uploadFile(proofFilesArray[i], `report-proof-${i + 1}`);
              if (filePath) proofFilePaths.push(filePath);
            } catch (error) {
              console.error(`Error uploading report proof file ${i + 1}:`, error);
            }
          }
        }
      }

      // 4. Update review record with file paths
      console.log("Updating review with file paths...");
      
      try {
        const { error: updateError } = await supabase
          .from('reviews')
          .update({
            proof_file_path: proofFilePath,
            funded_proof_file_path: fundedProofFilePath,
            payout_proof_file_path: payoutProofFilePath,
            report_proof_file_paths: proofFilePaths.length > 0 ? proofFilePaths : null,
          })
          .eq('id', reviewId);

        if (updateError) {
          console.error('Error updating review with file paths:', updateError);
          // Continue anyway since the review was created
          console.log('Continuing despite file path update error');
        } else {
          console.log('Review updated with file paths successfully');
        }
      } catch (updateError) {
        console.error('Unexpected error updating review:', updateError);
        // Continue anyway since the review was created
        console.log('Continuing despite file path update error');
      }

      // Return success response
      console.log("Review submission completed successfully");
      return res.status(200).json({ 
        success: true, 
        reviewId,
        reviewNumber,
        message: 'Review submitted successfully' 
      });
      
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return res.status(500).json({ error: 'Database operation failed' });
    }

  } catch (error: any) {
    console.error('Error processing review submission:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'An error occurred while processing your review'
    });
  }
}