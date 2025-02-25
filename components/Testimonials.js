import { motion, useTransform, useScroll, useSpring, useInView } from "framer-motion";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";

const testimonials = [
  { id: 1, date: "08/01/2025", text: "Chart Nomads provides an incredible service to the prop trading community. I respect the deep and unbiased analysis on the most important topics.", name: "James Glyde", role: "CEO PipFarm", avatar: "/avatars/james_glyde.webp", stars: 5 },
  { id: 2, date: "07/01/2025", text: "I definitely love the website and all the features it has and most people should definitely check it out and use it for them self. It has great information that traders always can use.", name: "Really Trades", role: "Trader/Entrepreneur", avatar: "/avatars/really_trades.webp", stars: 5 },
  { id: 3, date: "05/01/2025", text: "As a funded trader, I can vouch for ChartNomads. Their verified reviews and rule updates make them my go-to for everything in prop trading.", name: "Mohammad Sayem", role: "Trader & Front-end dev", avatar: "/avatars/mohammad_sayem.webp", stars: 5 },
  { id: 4, date: "15/01/2025", text: "Unique idea which brings the transparency to a new level, I’m fully supporting it and would love to see how they will verify payouts numbers.", name: "Khaled Ayesh", role: "CEO FundingPips", avatar: "/avatars/khaled.webp", stars: 5 },
  { id: 5, date: "01/09/2025", text: "Chart Nomads built something exceptional. I am confident the whole industry will benefit out of their platform.", name: "Banjara", role: "Trader/Influencer", avatar: "/avatars/banjara.webp", stars: 5 },
  { id: 6, date: "08/01/2025", text: "Love the effort Chart Nomads have put to bring this unique ,overall great product with unique features, setting new standards for the space! Try it out and wont be disappointed!", name: "Fondinho7", role: "Trader", avatar: "/avatars/fondinho.webp", stars: 5 },
  { id: 7, date: "06/01/2025", text: "A MUST need Tool for every Prop Trader. Beginner Friendly and packed with details to find the best fit for the clients needs. Can’t recommend this enough!", name: "SubhanFX", role: "Prop Firm Trader", avatar: "/avatars/subhan_fx.webp", stars: 5 },
];

const Testimonials = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.2 }); // Detect if at least 20% of section is in view

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });

  // Move left -20% on scroll
  const x1 = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  // Move right +20% on scroll
  const x2 = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  // ✅ Smooth scrolling effect
  const smoothX1 = useSpring(x1, { stiffness: 100, damping: 20 });
  const smoothX2 = useSpring(x2, { stiffness: 100, damping: 20 });

  return (
    <section ref={containerRef} className="relative py-20 w-full overflow-hidden">
      <h2 className="text-center text-white text-5xl font-bold mb-40">
        See what people say about us
      </h2>

      {/* ✅ First Row (Moves Left) */}
      <motion.div style={{ x: isInView ? smoothX1 : "0%" }} className="flex gap-6 w-full">
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} {...testimonial} />
        ))}
      </motion.div>

      {/* ✅ Second Row (Moves Right, Starts at +200px Offset) */}
      <motion.div style={{ x: isInView ? smoothX2 : "0%" }} className="flex gap-6 w-full mt-8 ml-[-750px]">
        {testimonials.slice().reverse().map((testimonial) => (
          <TestimonialCard key={testimonial.id + 100} {...testimonial} />
        ))}
      </motion.div>
    </section>
  );
};

const TestimonialCard = ({ date, text, name, role, avatar, stars }) => {
  return (
    <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#2a2a2a] w-[450px] h-[300px] flex-shrink-0 flex flex-col justify-between h-[250px] transition-transform duration-200 hover:scale-[1.03] hover:border-[#EDB900] hover:bg-[rgba(255,255,255,0.1)]">
      <div>
        <div className="flex justify-between mb-4">
          <p className="text-400 text-sm">{date}</p>
          <div className="flex gap-1 text-[#EDB900]">
            {Array.from({ length: stars }).map((_, i) => (
              <FontAwesomeIcon key={i} icon={faStar} className="text-lg" />
            ))}
          </div>
        </div>
        <p className="text-white text-md mb-4 min-h-[150px]">{text}</p> {/* Min height added */}
      </div>
      <div className="flex items-center gap-4 mt-auto mb-4">
        <Image src={avatar} alt={name} width={48} height={48} className="rounded-full" />
        <div>
          <p className="text-white">{name}</p>
          <p className="text-400 text-xs">{role}</p>
        </div>
      </div>
    </div>
  );
};


export default Testimonials;