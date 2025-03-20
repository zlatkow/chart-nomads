import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

const Newsletter = () => {
  return (
    <section className="py-16 relative bg-radial-custom">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between max-w-[1200px] px-6 gap-12">
        
        {/* Left - Email Graphic */}
        <div className="relative w-[500px] lg:w-[700px] opacity-20">
          <Image 
            src="/assets/newsletter_pic.webp" 
            alt="Newsletter Subscription"
            width={500} 
            height={300} 
            className="w-full object-contain"
          />
        </div>

        {/* Right - Subscription Form */}
        <div className="max-w-lg text-center lg:text-left">
          <h2 className="text-right text-white uppercase text-3xl tracking-wide mb-2">SUBSCRIBE TO OUR NEWSLETTER</h2>
          <h2 className="text-right text-[#EDB900] text-6xl font-bold">TODAY!</h2>

          {/* Input Field & Button */}
          <div className="text-sm mt-6 flex bg-white rounded-lg overflow-hidden w-full max-w-md">
            <input 
              id="footerNewsletter"
              type="email" 
              placeholder="No spam, just value" 
              className="w-full px-4 py-3 text-black outline-none"
            />
            <button className="bg-[#EDB900] px-5 flex items-center justify-center hover:bg-[#b38b00] transition">
                <FontAwesomeIcon icon={faArrowRight} className="text-black text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Gradient Separator */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#0f0f0f] to-[#EDB900]"></div>
    </section>
  );
};

export default Newsletter;
