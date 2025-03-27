import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { userId } = req.query

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "User ID is required" })
  }

  try {
    // Make sure we're using the full Clerk user ID with the prefix
    const clerkUserId = userId.startsWith("user_") ? userId : `user_${userId}`

    // Get the Clerk API key from environment variables
    const clerkApiKey = process.env.CLERK_SECRET_KEY

    if (!clerkApiKey) {
      throw new Error("CLERK_SECRET_KEY is not defined in environment variables")
    }

    // Use the Clerk REST API directly
    const response = await fetch(`https://api.clerk.dev/v1/users/${clerkUserId}`, {
      headers: {
        Authorization: `Bearer ${clerkApiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Clerk API returned ${response.status}: ${await response.text()}`)
    }

    const userData = await response.json()

    // Return the profile image URL and other relevant data
    return res.status(200).json({
      profileImageUrl: userData.image_url || userData.profile_image_url,
      firstName: userData.first_name,
      lastName: userData.last_name,
      // Add any other user data you need
    })
  } catch (error) {
    console.error("Error fetching user from Clerk:", error)
    return res
      .status(500)
      .json({ error: "Failed to fetch user profile", details: error instanceof Error ? error.message : String(error) })
  }
}

