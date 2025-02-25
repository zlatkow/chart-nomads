import { supabase } from "@/lib/supabase";  // ✅ Absolute Path (Best)

export default async function handler(req, res) {
  const { data, error } = await supabase.from("blogs").select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
}
