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
    // Parse form data with formidable
    const form = formidable({ 
      multiples: true,
      keepExtensions: true,
    });

    // Parse the form
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

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

    // 1. Get the next review number
    const { data: existingFolders, error: folderError } = await supabase
      .storage
      .from('reviews')
      .list(`company-${formData.companyId}`);

    if (folderError) {
      console.error('Error listing folders:', folderError);
      return res.status(500).json({ error: 'Failed to access storage' });
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

    // 2. Create review data in database
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
      return res.status(500).json({ error: 'Failed to create review' });
    }

    // 3. Upload files to Supabase Storage
    const reviewId = reviewData[0].id;
    const reviewFolderPath = `company-${formData.companyId}/review-${reviewNumber}`;
    
    // Helper function to upload a file
    const uploadFile = async (file: any, subfolder: string) => {
      if (!file) return null;
      
      const fileContent = await fs.promises.readFile(file.filepath);
      const fileName = path.basename(file.originalFilename || 'file');
      
      const { data, error } = await supabase
        .storage
        .from('reviews')
        .upload(`${reviewFolderPath}/${subfolder}/${fileName}`, fileContent, {
          contentType: file.mimetype || 'application/octet-stream',
          upsert: true,
        });
        
      if (error) {
        console.error(`Error uploading ${subfolder} file:`, error);
        throw error;
      }
      
      return data?.path;
    };

    // Upload main proof file
    const proofFile = files.proofFile;
    let proofFilePath = null;
    if (proofFile) {
      // Handle both single file and array of files
      const fileToUpload = Array.isArray(proofFile) ? proofFile[0] : proofFile;
      if (fileToUpload) {
        proofFilePath = await uploadFile(fileToUpload, 'proof');
      }
    }

    // Upload funded proof file if exists
    const fundedProofFile = files.fundedProofFile;
    let fundedProofFilePath = null;
    if (fundedProofFile) {
      // Handle both single file and array of files
      const fileToUpload = Array.isArray(fundedProofFile) ? fundedProofFile[0] : fundedProofFile;
      if (fileToUpload) {
        fundedProofFilePath = await uploadFile(fileToUpload, 'funded-proof');
      }
    }

    // Upload payout proof file if exists
    const payoutProofFile = files.payoutProofFile;
    let payoutProofFilePath = null;
    if (payoutProofFile) {
      // Handle both single file and array of files
      const fileToUpload = Array.isArray(payoutProofFile) ? payoutProofFile[0] : payoutProofFile;
      if (fileToUpload) {
        payoutProofFilePath = await uploadFile(fileToUpload, 'payout-proof');
      }
    }

    // Upload report proof files if exists
    const proofFilePaths = [];
    const proofFiles = files.proofFiles;
    
    // Handle both single file and array of files
    if (proofFiles) {
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
    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        proof_file_path: proofFilePath,
        funded_proof_file_path: fundedProofFilePath,
        payout_proof_file_path: payoutProofFilePath,
        report_proof_file_paths: proofFilePaths,
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Error updating review with file paths:', updateError);
      return res.status(500).json({ error: 'Failed to update review with file paths' });
    }

    // Return success response
    return res.status(200).json({ 
      success: true, 
      reviewId,
      reviewNumber,
      message: 'Review submitted successfully' 
    });

  } catch (error) {
    console.error('Error processing review submission:', error);
    return res.status(500).json({ 
      success: false,
      error: 'An error occurred while processing your review' 
    });
  }
}