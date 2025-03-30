import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const { reviewId } = await req.json();

  if (!reviewId) {
    return new Response(JSON.stringify({ error: "Missing reviewId" }), { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const bucketName = "proofs";

  // 👇 Zero-pad the reviewId to 2 digits (e.g. 1 → 01)
  const folderPath = `review${String(reviewId).padStart(2, "0")}`;

  const { data: files, error: listError } = await supabase
    .storage
    .from(bucketName)
    .list(folderPath, { recursive: true });

  if (listError) {
    return new Response(JSON.stringify({ error: listError.message }), { status: 500 });
  }

  if (!files || files.length === 0) {
    return new Response(JSON.stringify({ message: "No files to delete" }), { status: 200 });
  }

  const paths = files.map((file) => `${folderPath}/${file.name}`);

  const { error: deleteError } = await supabase
    .storage
    .from(bucketName)
    .remove(paths);

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: `Deleted ${paths.length} files in ${folderPath}` }), { status: 200 });
});
