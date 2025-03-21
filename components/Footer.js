import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn, FaYoutube, FaTiktok, FaDiscord } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="text-white pt-12 pb-2">
      <div className="container flex justify-between mx-auto px-6 max-w-[1200px]">
        
        {/* Left - Logo & Contact */}
        <div>
          <Image src="/logo.webp" alt="Chart Nomads" width={160} height={40} />
          <p className="mt-4 text-sm text-400">Address:</p>
          <p className="text-sm">5800 str. Rila 8, Pleven, Bulgaria</p>
          <p className="mt-4 text-sm text-400">Contact:</p>
          <p className="text-sm">+359 / 878930197</p>
          <p className="text-sm">office@chartnomads.com</p>

          {/* Social Media Icons */}
          <div className="flex gap-4 mt-4">
            <a href="https://www.facebook.com/chartnomads/" target="_blank" rel="noopener noreferrer">
                <FaFacebookF className="text-lg text-white hover:text-[#EDB900] transition-colors duration-200 cursor-pointer" />
            </a>
            <a href="https://www.instagram.com/chartnomads" target="_blank" rel="noopener noreferrer">
                <FaInstagram className="text-lg text-white hover:text-[#EDB900] transition-colors duration-200 cursor-pointer" />
            </a>
            <a href="https://x.com/chartnomads" target="_blank" rel="noopener noreferrer">
                <FaXTwitter className="text-lg text-white hover:text-[#EDB900] transition-colors duration-200 cursor-pointer" />
            </a>
            <a href="https://www.linkedin.com/company/chartnomads/" target="_blank" rel="noopener noreferrer">
                <FaLinkedinIn className="text-lg text-white hover:text-[#EDB900] transition-colors duration-200 cursor-pointer" />
            </a>
            <a href="https://www.youtube.com/@chartnomads" target="_blank" rel="noopener noreferrer">
                <FaYoutube className="text-lg text-white hover:text-[#EDB900] transition-colors duration-200 cursor-pointer" />
            </a>
            <a href="https://www.tiktok.com/@chartnomads" target="_blank" rel="noopener noreferrer">
                <FaTiktok className="text-lg text-white hover:text-[#EDB900] transition-colors duration-200 cursor-pointer" />
            </a>
            <a href="https://discord.com/invite/BhyJvGqphQ" target="_blank" rel="noopener noreferrer">
                <FaDiscord className="text-lg text-white hover:text-[#EDB900] transition-colors duration-200 cursor-pointer" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Navigation Links */}
                <div>
                <h3 className="text-xl mb-1">RESOURCES</h3>
                <div className="w-[80px] h-[1px] bg-gradient-to-r from-[#0f0f0f] to-[#EDB900] mb-3"></div>
                <ul className="space-y-2 text-sm text-400">
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">News</Link></li>
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">Blog</Link></li>
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">Prop Firm Lists</Link></li>
                </ul>
                </div>

                <div>
                <h3 className="text-xl mb-1">ASSETS</h3>
                <div className="w-[50px] h-[1px] bg-gradient-to-r from-[#0f0f0f] to-[#EDB900] mb-3"></div>
                <ul className="space-y-2 text-sm text-400">
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">Forex Prop Firms</Link></li>
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">Crypto Prop Firms</Link></li>
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">Darwinex</Link></li>
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">TradingView</Link></li>
                </ul>
                </div>

                <div>
                <h3 className="text-xl mb-1">PROP FIRMS</h3>
                <div className="w-[90px] h-[1px] bg-gradient-to-r from-[#0f0f0f] to-[#EDB900] mb-3"></div>
                <ul className="space-y-2 text-sm text-400">
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">All Prop Firms</Link></li>
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">Prop Firm Comparison</Link></li>
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">Offers & Discounts</Link></li>
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">Prop Firm Rules</Link></li>
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">Banned Countries</Link></li>
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">Unlisted Prop Firms</Link></li>
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">Industry Stats</Link></li>
                </ul>
                </div>

                <div>
                <h3 className="text-xl mb-1">ABOUT</h3>
                <div className="w-[50px] h-[1px] bg-gradient-to-r from-[#0f0f0f] to-[#EDB900] mb-3"></div>
                <ul className="space-y-2 text-sm text-400">
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">Evaluation Process</Link></li>
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">How it Works</Link></li>
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">Loyalty Program</Link></li>
                    <li className= "py-1 hover:text-[#EDB900]"><Link href="#">Contact Us</Link></li>
                </ul>
                </div>
            </div>
        </div>

      {/* Bottom Section (Fixed) */}
    <div className="border-t border-[rgba(109,109,109,0.15)] mt-8 pt-6">
        <div className="container mx-auto max-w-[1200px] px-6 text-400 text-xs">
        <p className="mb-2 text-center">Disclaimer:</p>
        <p className="text-justify mb-2">
        The information provided is intended for general use and informational purposes only. Users are advised to proceed at their own risk and exercise due diligence before making any decisions based on the information provided. It is crucial to understand that our business offers information and does not endorse or recommend any specific proprietary trading firms. Users should independently evaluate and verify the suitability of any such entities before engaging with them. We do not assume responsibility for any consequences or losses arising from the use of the information provided. Thank you for your understanding and discretion.
        </p>
        <div className="mt-5 flex justify-between gap-4">
            <p>© 2024 Chart Nomads. All Rights Reserved.</p>
            <div className="flex justify-center gap-4">
            <Link href="#" className="hover:text-[#EDB900]">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#EDB900]">Terms of Service</Link>
            </div>
        </div>    
      </div>
    </div>

    </footer>
  );
};

export default Footer;
