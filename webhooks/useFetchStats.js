import { useEffect, useState } from "react";

const fetchAllStats = async () => {
  console.log("📡 Fetching all stats from API...");
  
  try {
    const response = await fetch("/api/fetchStats"); // ✅ Call our secure API route
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to fetch stats");
    }

    console.log("✅ Secure Fetch Successful:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    return null;
  }
};

// ✅ Custom Hook to fetch on page load
const useFetchStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("📡 Fetching stats securely...");
    const loadStats = async () => {
      const data = await fetchAllStats();
      setStats(data);
      setLoading(false);
    };
    loadStats();
  }, []);

  return { stats, loading };
};

export default useFetchStats;
