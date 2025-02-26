import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST be Service Role Key!
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

// Ensure environment variables are available
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !CLERK_WEBHOOK_SECRET) {
  throw new Error("❌ Missing required environment variables!");
}

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Next.js API Config - Disable automatic body parsing
export const config = {
  api: {
    bodyParser: false, // This ensures we can read raw body for signature verification
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Read raw request body for Clerk webhook verification
  let payload = "";
  await new Promise((resolve, reject) => {
    req.on("data", (chunk) => (payload += chunk));
    req.on("end", resolve);
    req.on("error", reject);
  });

  const headers = req.headers;
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(payload, headers);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return res.status(400).json({ error: "Webhook signature verification failed." });
  }

  const eventType = evt.type;
  const user = evt.data;

  console.log("📩 Received Webhook Event:", eventType, user);

  // Extract user details
  const { id, email_addresses, first_name, last_name } = user;
  const email = email_addresses?.[0]?.email_address || null; // Ensure email is available

  // ✅ Handle User Creation
  if (eventType === "user.created") {
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

  // ✅ Handle User Update
  if (eventType === "user.updated") {
    const { data, error } = await supabase
      .from("users")
      .update({ email, first_name, last_name })
      .eq("id", id);

    if (error) {
      console.error("❌ Error updating user in Supabase:", error);
      return res.status(500).json({ error: "Failed to update user in Supabase" });
    }

    console.log("✅ User updated successfully:", data);
    return res.status(200).json({ message: "User updated successfully" });
  }

  // ✅ Handle User Deletion
  if (eventType === "user.deleted") {
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      console.error("❌ Error deleting user from Supabase:", error);
      return res.status(500).json({ error: "Failed to delete user from Supabase" });
    }

    console.log("✅ User deleted successfully:", id);
    return res.status(200).json({ message: "User deleted successfully" });
  }

  console.warn("⚠️ Unhandled Webhook Event:", eventType);
  return res.status(400).json({ error: "Unhandled event type" });
}
