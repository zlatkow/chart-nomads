import { createClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";

export function useSupabaseClient() {
  const { session } = useSession(); // Get the Clerk session

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        fetch: async (url, options = {}) => {
          const clerkToken = await session?.getToken({ template: "supabase" });

          const headers = new Headers(options?.headers);
          if (clerkToken) {
            headers.set("Authorization", `Bearer ${clerkToken}`);
          }

          return fetch(url, { ...options, headers });
        },
      },
    }
  );
}
