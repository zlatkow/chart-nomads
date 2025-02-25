import { motion } from "framer-motion";
import Image from "next/image";

const partners = [
    { name: "FTMO", src: "/logos/ftmo_logo.svg", width: 300, height: 120 },
    { name: "BrightFunded", src: "/logos/brightfunded_logo.svg", width: 330, height: 120 },
    { name: "E8 Markets", src: "/logos/e8_logo.svg", width: 300, height: 120 },
    { name: "FundedNext", src: "/logos/fundednext_logo.svg", width: 360, height: 120 },
    { name: "The 5%ers", src: "/logos/logo_the5ers.png", width: 270, height: 120 },
    { name: "Funding Pips", src: "/logos/fundingpips_logo.png", width: 330, height: 120 },
    { name: "PipFarm", src: "/logos/pipfarm_logo.png", width: 360, height: 120 },
    { name: "Finotive Funding", src: "/logos/finotive_funding_logo.svg", width: 300, height: 120 },
  ];  

const Partners = () => {
  return (
    <section className="relative bg-[#0F0F0F] py-40">
      {/* Heading */}
      <div className="text-center mb-40">
        <p className="text-gray-400 uppercase tracking-wide text-md mb-5">
          B2B relations we are proud of
        </p>
        <h2 className="text-white text-5xl font-bold">
          Meet some of the companies which we trust
        </h2>
      </div>

      <div className="grid grid-cols-4 gap-x-20 gap-y-20 place-items-center max-w-6xl mx-auto">
        {partners.map((partner, index) => (
            <motion.div
            key={partner.name}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
            className="flex justify-center"
            >
            <Image
                src={partner.src}
                alt={partner.name}
                width={partner.width}
                height={partner.height}
                className="object-contain"
            />
            </motion.div>
        ))}
    </div>
    </section>
  );
};

export default Partners;
