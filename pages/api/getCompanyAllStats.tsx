// pages/api/getCompanyAllStats.js

import { createClient } from "@supabase/supabase-js";

// ✅ Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { company } = req.query;

  if (!company) {
    return res.status(400).json({ error: "Missing 'company' query parameter" });
  }

  try {
    const [stats24h, stats7d, stats30d, statsAll] = await Promise.all([
      supabase.rpc("get_transaction_stats_by_company", {
        input_propfirm_name: company,
        input_period: "24h",
      }),
      supabase.rpc("get_transaction_stats_by_company", {
        input_propfirm_name: company,
        input_period: "7d",
      }),
      supabase.rpc("get_transaction_stats_by_company", {
        input_propfirm_name: company,
        input_period: "30d",
      }),
      supabase.rpc("get_transaction_stats_by_company", {
        input_propfirm_name: company,
        input_period: "all",
      }),
    ]);

    if (stats24h.error || stats7d.error || stats30d.error || statsAll.error) {
      console.error("One or more Supabase errors:", {
        stats24h: stats24h.error,
        stats7d: stats7d.error,
        stats30d: stats30d.error,
        statsAll: statsAll.error,
      });

      return res.status(500).json({ error: "Failed to fetch one or more timeframes" });
    }

    return res.status(200).json({
      "24h": stats24h.data?.[0] || null,
      "7d": stats7d.data?.[0] || null,
      "30d": stats30d.data?.[0] || null,
      all: statsAll.data?.[0] || null,
    });
  } catch (err) {
    console.error("Unexpected Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
