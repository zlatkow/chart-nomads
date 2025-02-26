import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

// Ensure environment variables are available
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !CLERK_WEBHOOK_SECRET) {
  throw new Error("Missing required environment variables!");
}

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Extract headers & body correctly
    const headers = req.headers;
    const payload = req.body; // ✅ FIX: Use req.body instead of req.text()

    const wh = new Webhook(CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(JSON.stringify(payload), headers);

    console.log("📩 Received Webhook Event:", evt);

    const eventType = evt.type;
    const user = evt.data;

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name } = user;
      const email = email_addresses?.[0]?.email_address || null; // Ensure email is available

      // Insert new user into Supabase
      const { data, error } = await supabase
        .from("users")
        .insert([{ id, email, first_name, last_name }]);

      if (error) {
        console.error("❌ Error inserting user into Supabase:", error);
        return res.status(500).json({ error: "Failed to insert user into Supabase" });
      }

      console.log("✅ User inserted successfully:", data);
      return res.status(200).json({ message: "User created successfully" });
    }

    console.warn("⚠️ Unhandled Webhook Event:", eventType);
    return res.status(400).json({ error: "Unhandled event type" });

  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// ✅ Required for Next.js API routes to parse JSON body
export const config = {
  api: {
    bodyParser: true, // ✅ Ensures Next.js API route can parse JSON
  },
};
