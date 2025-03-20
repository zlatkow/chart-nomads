import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { timefilter } = req.query || "all";

    // 🔍 Call Supabase function
    const { data, error } = await supabase.rpc("get_top_10_payouts_across_industry", {
      timefilter: timefilter || "all",
    });

    if (error) {
      return res.status(500).json({ error: "Error fetching top payouts" });
    }

    return res.status(200).json({ topPayouts: data || [] });
  } catch (error) {
    console.error("Supabase Fetch Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

  
