import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

const Community = () => {
  return (
    <section className="bg-[#EDB900] py-20">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between max-w-[1200px] px-6 gap-12">
        
        {/* Left Column - Text */}
        <div className="max-w-lg text-center lg:text-left">
          <h2 className="text-4xl font-bold text-black mb-4">JOIN OUR COMMUNITY.</h2>
          <p className="text-black text-lg leading-relaxed">
            Connect with like-minded individuals, stay updated with exclusive content, and enjoy fun activities.
            Whether you&apos;re here to chat, collaborate, or just have fun, our vibrant community welcomes you!
          </p>
          {/* CTA Button */}
            <a 
                href="https://discord.gg/chartnomads" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center bg-black text-[#EDB900] py-3 px-6 rounded-lg hover:opacity-90 transition"
                >
                Join here 
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-[#EDB900] text-lg" />
            </a>
        </div>

        {/* Right Column - Discord Image */}
        <div className="relative w-[300px] lg:w-[400px]">
          <Image 
            src="/assets/Discord_Chart_nomads.webp" 
            alt="Join our Discord Community" 
            width={500} 
            height={500} 
            className="w-full object-contain"
          />
        </div>

      </div>
    </section>
  );
};

export default Community;
