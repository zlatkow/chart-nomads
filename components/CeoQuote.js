import Image from "next/image";

const CeoQuote = () => {
  return (
    <section className="bg-[#EDB900] py-20 min-h-[600px]">
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12 max-w-[1200px] px-6">
        
        {/* CEO Image */}
        <div className="relative flex-shrink-0" style={{ width: "400px", height: "350px" }}>
        <div className="absolute inset-0 bg-black rounded-xl blur-xl opacity-50"></div>
            <Image 
                src="/ceo_picture.webp" 
                alt="Delyan Zlatkow - CEO & Founder" 
                width={500} 
                height={452} 
                className="relative z-10 rounded-xl object-cover"
            />
        </div>
        {/* Quote Section */}
        <blockquote className="text-black text-lg max-w-2xl relative mt-12">
          {/* Quote Image */}
          <Image 
            src="/quotes.webp" 
            alt="Quote Icon" 
            width={100} 
            height={82} 
            className="absolute -top-8 left-0"
          />
          <p id="ceo_quote" className="text-4xl font-bold mb-4 mt-20 font-[var(--font-balboa)]">
            Chart Nomads isn&apos;t just a platform; it&apos;s a movement. It&apos;s a vision for a better and more transparent trading industry that I believe we can all achieve together!
          </p>
          <footer className="mt-10 text-900 font-semibold">
            <span className="block text-xl">Delyan Zlatkow</span>
            <span className="text-sm font-medium">CEO & Founder</span>
          </footer>
        </blockquote>
        
      </div>
    </section>
  );
};

export default CeoQuote;
