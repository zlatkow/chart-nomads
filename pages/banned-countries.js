/* eslint-disable */
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import LoginModal from "../components/Auth/LoginModal";
import Navbar from "../components/Navbar";
import Noise from "../components/Noise";
import Link from "next/link";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // Default tooltip styles
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import Community from "../components/Community";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import MissingRuleForm from "../components/IssueReportForm";
import Image from "next/image";

export async function getServerSideProps() {
  try {
    console.log("📡 Fetching Banned Countries Data...");

    const { data: bannedCountries, error } = await supabase
      .from("banned_countries") // 🔥 Change this to your banned countries table
      .select(`
        id,
        last_updated,
        banned_countries_list,
        prop_firms (
          id,
          propfirm_name,
          category,
          rating,
          logo_url,
          slug,
          brand_colour,
          reviews_count,
          likes
        )
      `);

    if (error) {
      console.error("❌ ERROR Fetching Banned Countries Data:", error);
      return { props: { bannedFirms: [] } };
    }

    console.log("✅ SUCCESS: Fetched", bannedCountries.length, "Banned Countries records.");

    return { props: { bannedFirms: bannedCountries } };
  } catch (error) {
    console.error("🔥 UNEXPECTED ERROR in getServerSideProps:", error);
    return { props: { bannedFirms: [] } };
  }
}

const BannedCountries = ({ bannedFirms }) => {
  const [searchTerm, setSearchTerm] = useState(""); 
  const [userLikedFirms, setUserLikedFirms] = useState(new Set());
  const { user } = useUser();
  const [loadingLikes, setLoadingLikes] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [likesMap, setLikesMap] = useState({});
  const [visibleCount, setVisibleCount] = useState(10); // Show first 10 items


  const searchLower = searchTerm.toLowerCase();

  const filteredFirms = bannedFirms
  .filter(firm => {
    const companyName = firm?.prop_firms?.propfirm_name || "";
    const companyCategory = firm?.prop_firms?.category || "";
    const bannedRules = firm?.banned_countries_list || "";

    return (
      companyName.toLowerCase().includes(searchLower) ||
      companyCategory.toLowerCase().includes(searchLower) ||
      bannedRules.toLowerCase().includes(searchLower)
    );
  })
  .sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated)); // 🔥 Sort by newest first

  const visibleFirms = filteredFirms.length > 0 
  ? filteredFirms.slice(0, visibleCount) 
  : []; 



  useEffect(() => {
    const initialLikes = {};
    bannedFirms.forEach((firm) => {
      initialLikes[firm.prop_firms.id] = firm.prop_firms.likes;
    });
    setLikesMap(initialLikes);
  }, [bannedFirms]);

  // ✅ Fetch liked firms from the user
useEffect(() => {
    if (!user) {
      setLoadingLikes(false);
      return;
    }
  
    const fetchLikedFirms = async () => {
      const { data, error } = await supabase
        .from("user_likes")
        .select("firm_id")
        .eq("user_id", user.id);
  
      if (error) {
        console.error("Error fetching liked firms:", error);
        setLoadingLikes(false);
        return;
      }
  
      const likedFirmIds = new Set(data.map((entry) => Number(entry.firm_id)));
      setUserLikedFirms(likedFirmIds);
      
      // Log the liked companies on page load
      console.log("Liked firms on page load:", likedFirmIds);
  
      setLoadingLikes(false);
    };
  
    fetchLikedFirms();
  }, [user]);
  
  const handleLikeToggle = async (firmId) => {
    if (!user) {
      console.warn("User must be logged in to like.");
      return;
    }
  
    const numericFirmId = Number(firmId);
    console.log(`\n🔄 Like toggle triggered for Firm ID: ${numericFirmId}`);
  
    setUserLikedFirms((prevLikes) => {
      const updatedLikes = new Set(prevLikes);
      if (updatedLikes.has(numericFirmId)) {
        updatedLikes.delete(numericFirmId);
      } else {
        updatedLikes.add(numericFirmId);
      }
      return updatedLikes;
    });
  
    // ✅ Update `likesMap` instead of relying on `propFirms`
    setLikesMap((prevLikes) => {
      const newLikes = { ...prevLikes };
      const isLiked = userLikedFirms.has(numericFirmId);
      newLikes[numericFirmId] = isLiked ? newLikes[numericFirmId] - 1 : newLikes[numericFirmId] + 1;
      console.log(`🔢 Updated local likes count for Firm ID ${numericFirmId}:`, newLikes[numericFirmId]);
      return newLikes;
    });
  
    try {
      if (!userLikedFirms.has(numericFirmId)) {
        await supabase.from("user_likes").insert([{ user_id: user.id, firm_id: numericFirmId }]);
        await supabase.rpc("increment_likes", { firm_id: numericFirmId });
        console.log(`✅ Firm ID ${numericFirmId} successfully liked and database updated.`);
      } else {
        await supabase.from("user_likes").delete().eq("user_id", user.id).eq("firm_id", numericFirmId);
        await supabase.rpc("decrement_likes", { firm_id: numericFirmId });
        console.log(`✅ Firm ID ${numericFirmId} successfully unliked and database updated.`);
      }
    } catch (err) {
      console.error("❌ Unexpected error updating likes:", err);
    }
  };
  
  return (
    <div className="w-full">
        <div className="min-h-screen text-white pt-[300px] container mx-auto z-50">
        <Navbar />
        <Noise />
        <h1 className="text-7xl font-bold text-center mb-10">Banned Countries</h1>
        <p className="mb-10">Many companies have a list of countries they restrict access to, either because of regulations or their own policies. On this page, we’ve compiled a complete list of banned countries for each company, organized to help you stay informed and up to date.</p>
        <div className="block">
            <div className="flex justify-end">
            <div className="flex mb-3">
                <div className="flex justify-end mx-3 text-xs my-3">
                <span>Showing</span>
                <span className="mx-2 text-[#EDB900]">{filteredFirms.length}</span>
                <span>results.</span>
                </div>

                {/* ✅ Search Bar */}
                <div className="relative w-[250px] justify-center z-20 mb-4">
                <FontAwesomeIcon 
                    icon={faMagnifyingGlass} 
                    className="absolute left-3 max-w-[20px] top-1/2 transform -translate-y-1/2 text-gray-400" 
                />
                <input
                    type="text"
                    placeholder="Search.."
                    className="searchInput pl-10 search-input p-2 bg-[#0f0f0f] text-white placeholder-gray-400 caret-white rounded-[10px] border border-gray-600 w-full md:w-[250px] z-20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
            </div>
            </div>

            {filteredFirms.length > 0 ? (
            visibleFirms.map((entry, index) => (
                <div key={index} className="flex mb-20 bg-[#0f0f0f] border-[rgba(237,185,0,0.1)] border-[1px] p-5 rounded-[10px] z-50">
                <div className="flex w-[300px] h-[200px] shadow-lg relative bg-[rgba(255,255,255,0.03)] rounded-[10px] hover:bg-[#0f0f0f] py-7 hover:bg-gradient-to-r hover:from-[rgba(237,185,0,0.5)] hover:to-[rgba(255,255,255,0.10)] transition-transform duration-200 hover:scale-[1.03] cursor-pointer z-50">
                <Tippy
                    content={<span className="font-[balboa]">We use AI to categorize all the companies. You can learn more on our Evaluation process page.</span>}
                    placement="top"
                    delay={[100, 0]}
                    className="z-50"
                    theme="custom"
                    >
                    <span
                        className={`absolute top-3 left-3 px-[5px] border text-xs rounded-[10px] font-[balboa]
                        ${entry.prop_firms.category === "Gold" ? "text-[#efbf04] border-[#efbf04]" : ""}
                        ${entry.prop_firms.category === "Platinum" ? "text-[#D9D9D9] border-[#D9D9D9]" : ""}
                        ${entry.prop_firms.category === "Diamond" ? "text-[#c8bfe7] border-[#c8bfe7]" : ""}
                        ${entry.prop_firms.category === "Silver" ? "text-[#c4c4c4] border-[#c4c4c4]" : ""}
                        ${entry.prop_firms.category === "Copper" ? "text-[#c68346] border-[#c68346]" : ""}`
                        }
                    >
                        {entry.prop_firms.category}
                    </span>
                </Tippy>

                <SignedOut>
                    <button 
                    onClick={() => setIsLoginOpen(true)} 
                    className="absolute top-3 right-3 hover:animate-[heartbeat_1.5s_infinite_ease-in-out] z-60"
                    style={{ color: "rgba(237, 185, 0, 0.3)" }} 
                    >
                    <FontAwesomeIcon icon={regularHeart} style={{ fontSize: "25px" }} />
                    </button>
                </SignedOut>

                <SignedIn>
                    <button
                    onClick={() => handleLikeToggle(entry.prop_firms.id)}
                    className={`absolute top-3 right-3 transition-all duration-200 ${
                        userLikedFirms.has(entry.prop_firms.id) 
                        ? "text-[#EDB900] scale-105 hover:animate-[heartbeat_1.5s_infinite_ease-in-out]" 
                        : "text-[rgba(237,185,0,0.3)] hover:text-[#EDB900] hover:animate-[heartbeat_1.5s_infinite_ease-in-out]"
                    }`}
                    >
                    <FontAwesomeIcon
                        icon={userLikedFirms.has(Number(entry.prop_firms.id)) ? solidHeart : regularHeart}
                        className={`transition-all duration-200 text-[25px] ${
                        userLikedFirms.has(Number(entry.prop_firms.id))
                            ? "text-[#EDB900] scale-105" 
                            : "text-[rgba(237,185,0,0.3)] hover:text-[#EDB900]"
                        }`}
                    />
                    </button>
                </SignedIn>
                <Link href={`/prop-firms/${entry.prop_firms.slug}`} passHref>
                    <div className="flex w-[300px] h-[200px] justify-between px-7">
                    <div className="w-20 h-20 mb-2 flex items-center justify-center rounded-[10px] p-1 mt-[50px]" style={{ backgroundColor: entry.prop_firms.brand_colour }}>
                        <Image src={entry.prop_firms.logo_url || '/default-logo.png'} alt={entry.prop_firms.propfirm_name} width={40} height={40} className="object-cover" />
                    </div>

                    <div className="block mt-9 justify-center">
                        <h3 className="text-2xl text-center">{entry.prop_firms.propfirm_name}</h3>
                        <p className="text-center text-2xl text-[#EDB900]">
                        <FontAwesomeIcon icon={faStar} className="text-lg" />
                        <span className="text-white"> {entry.prop_firms.rating}</span>
                        </p>
                        <p className="text-center text-xs text-black bg-yellow-500 px-2 py-[5px] rounded-[8px] mt-2 mb-10 min-w-[80px] w-fit mx-auto">
                        {entry.prop_firms.reviews_count} reviews
                        </p>
                        <p className="absolute top-4 right-[45px] text-center text-xs">
                        {likesMap[entry.prop_firms.id] || 0} Likes
                        </p>
                    </div>
                    </div>
                </Link>
                </div>

                <div className="rules-section rules-container ml-[20px] mt-6 p-3 border-l-[1px] border-[rgba(237,185,0,0.1)] px-[100px]">
                    <div className="flex text-xs justify-end flex-grow mt-[-35px] mb-10 min-w-[1075px]">
                    <FontAwesomeIcon icon={faCalendar} className="text-md text-white-500 mr-2 max-w-[20px] mt-[1px]" />
                    <p className="font-[balboa]">Updated on: {new Date(entry.last_updated).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                    <h2 className="text-3xl">Restricted Countries List:</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4" dangerouslySetInnerHTML={{ __html: entry.banned_countries_list }} />
                </div>
                </div>
            ))
            ) : (
            <p className="text-center">No results found.</p>
            )}
            {visibleCount < filteredFirms.length && (
            <div className="flex justify-center mt-6">
                <button
                onClick={() => setVisibleCount(prev => prev + 10)}
                className="px-4 py-2 bg-[#EDB900] text-black rounded-[10px] hover:bg-opacity-80 transition"
                >
                Load More
                </button>
            </div>
            )}
        </div>
        <MissingRuleForm />
        </div>
        <Community />
        <Newsletter />
        <Footer />
     </div>
  );
};

export default BannedCountries;
