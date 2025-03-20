import { createClient } from "@supabase/supabase-js";

// ✅ Initialize Supabase (Backend)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // ✅ Extract query parameters
    const { timeFilter = "all", limitRows = 10, offsetRows = 0, searchQuery = "" } = req.query;

    // ✅ Ensure correct data is sent to Supabase
    const rpcPayload = {
      timefilter: timeFilter,
      limitrows: Number(limitRows),
      offsetrows: Number(offsetRows),
      companyfilter: searchQuery.trim() ? `%${searchQuery.trim()}%` : null // ✅ Fuzzy search handling
    };

    // ✅ Fetch transactions including total_count and total_pages
    const { data, error } = await supabase.rpc("print_all_transactions", rpcPayload);

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return res.status(200).json({ transactions: [], total_count: 0, total_pages: 0 });
    }

    // ✅ Extract total count and total pages from first row
    const total_count = data[0]?.total_count || 0;
    const total_pages = data[0]?.page_count || 0;

    return res.status(200).json({ transactions: data, total_count, total_pages });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
}
