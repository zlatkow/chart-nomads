/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["img.clerk.com"], // ✅ Allow Clerk profile images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ppbvfzbubzynhcgfwlgc.supabase.co", // ✅ Allow Supabase storage images
      },
    ],
  },
};

module.exports = nextConfig;
