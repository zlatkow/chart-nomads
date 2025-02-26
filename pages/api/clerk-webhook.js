// app/api/clerk-webhook/route.js
import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  const payload = await req.text();
  const headers = req.headers;
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  try {
    // Verify the webhook signature
    const wh = new Webhook(webhookSecret);
    const event = wh.verify(payload, headers);

    console.log("🔹 Clerk Webhook Event:", event);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // Use Service Role for writes
    );

    if (event.type === "user.created") {
      const { id, primary_email_address, first_name, last_name } = event.data;

      const { data, error } = await supabase.from("users").insert([
        {
          id,
          email: primary_email_address,
          first_name,
          last_name,
        },
      ]);

      if (error) throw error;
      console.log("✅ User added to Supabase:", data);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("❌ Webhook verification failed:", err);
    return new Response(JSON.stringify({ error: "Invalid webhook" }), {
      status: 400,
    });
  }
}
