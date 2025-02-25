import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const ScrollableSection = () => {
  const sectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const { top, height } = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Normalize progress to ensure images transition at the right time
      let progress = Math.min(Math.max((viewportHeight - top) / height, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-[#EDB900]">
      <div className="container mx-auto px-6 max-w-[1200px]">
        <div className="grid grid-cols-2 gap-12 pt-[450px]">
          
          {/* Left Column (Scrollable Text) */}
          <div className="space-y-[60vh]">
            {/* Section 1 */}
            <motion.div className="min-h-[60vh] space-y-4">
                <p className="text-sm font-bold uppercase text-black">Feature</p>
                <h2 className="text-5xl font-bold text-black leading-tight">
                    News & Reviews
                </h2>
                <p className="text-lg text-black">
                    Read the latest news from the industry and beyond.
                </p>
                <p className="text-lg text-black">
                    We cover everything from inside the prop niche, not only reviews but also important economic news and valuable insights.
                </p>
                <button className="text-[#EDB900] mt-4 bg-black py-3 px-6 rounded-lg hover:opacity-90 transition">
                    Learn more
                </button>
            </motion.div>

            {/* Section 2 */}
            <motion.div className="min-h-[60vh] space-y-4">
                <p className="text-sm font-bold uppercase text-black">Feature</p>
                <h2 className="text-5xl font-bold text-black leading-tight">
                    Everything about prop firms in one place
                </h2>
                <p className="text-lg text-black">
                    Doesn&apos;t matter if you want to compare different firms, read genuine reviews, or just 
                    want to find the best deals.
                </p>
                <p className="text-lg text-black">
                  We&apos;ve got you covered.
                </p>
                <button className="text-[#EDB900] mt-4 bg-black py-3 px-6 rounded-lg hover:opacity-90 transition">
                    Learn more
                </button>
            </motion.div>

            {/* Section 3 */}
            <motion.div className="min-h-[60vh] space-y-4">
                <p className="text-sm font-bold uppercase text-black">Feature</p>
                <h2 className="text-5xl font-bold text-black leading-tight">
                    Discounts & Promotions
                </h2>
                <p className="text-lg text-black">
                    Unlock the best offers and discounts available around.
                </p>
                <p className="text-lg text-black">
                    Earn loyalty points on every purchase and boost your ROI in prop trading like never before.
                </p>
                <button className="text-[#EDB900] mt-4 bg-black py-3 px-6 rounded-lg hover:opacity-90 transition">
                    Learn more
                </button>
            </motion.div>
          </div>

          {/* Right Column (Sticky Image Crossfade) */}
          <div className="relative pt-[200px] pb-[140px] ">
            <div className="pb-[25px] sticky top-1/2 transform -translate-y-1/2 flex items-center justify-center">
              <motion.div className="relative w-[500px] h-[500px]">
                
                {/* Image 1: News & Reviews */}
                <motion.div 
                  initial={{ opacity: 1 }}
                  animate={{ opacity: scrollProgress < 0.5 ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image 
                    src="/news_reviews_image.webp" 
                    alt="News Reviews Image" 
                    width={500} 
                    height={500} 
                    className="rounded-lg"
                  />
                </motion.div>

                {/* Image 2: Information */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: scrollProgress >= 0.5 && scrollProgress < 0.85 ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image 
                    src="/information_image.webp" 
                    alt="Information Image" 
                    width={500} 
                    height={500} 
                    className="rounded-lg"
                  />
                </motion.div>

                {/* Image 3: Discounts */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: scrollProgress >= 0.85 ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image 
                    src="/discounts.webp" 
                    alt="Discounts Image" 
                    width={500} 
                    height={500} 
                    className="rounded-lg"
                  />
                </motion.div>

              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ScrollableSection;
