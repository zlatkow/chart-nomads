import { Webhook } from "svix"; // Ensure svix is installed
import { buffer } from "micro";

export const config = {
  api: {
    bodyParser: false, // Required for Clerk webhooks
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" }); // ❌ Handle wrong method
  }

  try {
    const payload = await buffer(req);
    const headers = req.headers;

    // ✅ Verify the webhook signature
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(payload.toString(), headers);

    console.log("Webhook received:", evt);

    // Handle different webhook event types
    switch (evt.type) {
      case "user.created":
        console.log("User Created Event:", evt.data);
        break;
      case "user.updated":
        console.log("User Updated Event:", evt.data);
        break;
      case "user.deleted":
        console.log("User Deleted Event:", evt.data);
        break;
      default:
        console.log("Unhandled event:", evt.type);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(400).json({ error: "Webhook signature verification failed." });
  }
}
