/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ppbvfzbubzynhcgfwlgc.supabase.co", // ✅ Replace with your actual Supabase domain
      },
    ],
  },
};

module.exports = nextConfig;
