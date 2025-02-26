import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST be Service Role Key!
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Verify webhook signature from Clerk
  const headers = req.headers;
  const payload = await req.text();
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(payload, headers);
  } catch (err) {
    console.error("Webhook signature verification failed:", err); // Log the error
    return res.status(400).json({ error: "Webhook signature verification failed." }); // Generic response
  }
  

  const eventType = evt.type;
  const user = evt.data;

  console.log("Webhook event:", eventType, user);

  if (eventType === "user.created") {
    const { id, primary_email_address, first_name, last_name } = user;

    // Insert new user into Supabase
    const { data, error } = await supabase.from("users").insert([
      {
        id,
        email: primary_email_address,
        first_name,
        last_name,
      },
    ]);

    if (error) {
      console.error("Error inserting user into Supabase:", error);
      return res.status(500).json({ error: "Failed to insert user into Supabase" });
    }

    console.log("User inserted successfully:", data);
    return res.status(200).json({ message: "User created successfully" });
  }

  return res.status(400).json({ error: "Unhandled event type" });
}
