import Link from "next/link";
import { FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn, FaYoutube, FaTiktok, FaDiscord } from "react-icons/fa6";
import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="text-white py-4 border-b border-[rgba(109,109,109,0.2)] bg-[#0f0f0f] z-[100] fixed top-0 left-0 w-full">
      <div className="max-w-[1280px] mx-auto flex justify-between items-center px-6">
        {/* Left Side - Logo */}
        <div className="text-yellow-400 text-2xl font-bold flex items-center space-x-2">
          <Image src="/logo.webp" alt="Chart Nomads" width={140} height={39} />
        </div>

        {/* Center - Navigation Links */}
        <div className="rounded-[10px] flex space-x-6 text-m tracking-wide font-medium">
          {["Home", "News", "Blog"].map((item, index) => (
            <Link key={index} href={item === "Home" ? "/" : `/${item.toLowerCase()}`}>
              <span className="capitalize hover:text-[#EDB900] cursor-pointer transition-all h-[50px] flex items-center">
                {item}
              </span>
            </Link>
          ))}

          {/* Dropdowns */}
          {[
            { 
              name: "Prop Firms", 
              links: [
                { title: "All Prop Firms", description: "All prop firms listed on our website." },
                { title: "Compare", description: "Compare between all the prop firms." },
                { title: "Discounts", description: "Exclusive promos and discounts." },
                { title: "Prop Firm Rules", description: "Stay up to date with companies' rules." },
                { title: "Unlisted Prop Firms", description: "Browse unlisted prop firms." },
                { title: "Banned Countries", description: "Stay up to date with banned countries list." },
                { title: "Industry Stats", description: "Industry stats, historical data and trends." },
                { title: "Submit report/review", description: "Submit a review, report about payout or report a problem." },
              ] 
            },
            { name: "Assets", links: [
              { title: "Forex", description: "All forex focused prop firms listed on our website." },
              { title: "Crypto", description: "All crypto focused prop firms listed on our website." },
              { title: "Darwinex Zero", description: "Find out more information about Darwinex Zero." },
              { title: "TradingView", description: "Find more information about TradingView." },
            ]},
            { name: "About", links: [
              { title: "How it Works", description: "Learn more about our platform." },
              { title: "Evaluation process", description: "Learn more about our evaluation processes." },
              { title: "Loyalty Program", description: "Learn more about our loyalty program." },
              { title: "Contact Us", description: "Contact us via our contact form." },
            ]},
          ].map((menu, index) => (
            <div key={index} className="relative group">
              {/* ✅ Dropdown Trigger */}
              <button className="h-[50px] capitalize flex items-center hover:text-[#EDB900] transition-all group-hover:text-[#EDB900]">
                {menu.name}
                <span className="text-[#6d6d6d] ml-1 transition-transform duration-200 group-hover:rotate-180">
                  <FiChevronDown />
                </span>

              </button>
              
              {/* ✅ Dropdown Menu */}
              <div className="rounded-[10px] absolute top-[50px] left-[-525px] top-full left-0 bg-[#0f0f0f] text-white p-6 rounded-lg shadow-lg w-[800px] border border-[rgba(109,109,109,0.2)]
                  opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                <h3 className="ml-4 text-yellow-400 font-bold mb-4">{menu.name.toUpperCase()}</h3>
                <div className="grid grid-cols-3 gap-4">
                  {menu.links.map((link, idx) => (
                    <Link key={idx} href={`/${link.title.toLowerCase().replace(/ /g, "-")}`}>
                      <div className="capitalize block py-2 px-2 rounded-md hover:bg-[rgba(41,41,41,0.4)] hover:border border-[rgba(109,109,109,0.2)] hover:text-[#EDB900] cursor-pointer transition-all">
                        <p className="font-bold text-lg">{link.title}</p>
                        {link.description && <p className="text-[#9c9c9c] text-sm text-gray-400">{link.description}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
                <hr className="border-t border-[rgba(109,109,109,0.2)] my-4 mx-4" />
                  <div className="w-full flex flex-col items-end pr-6"> 
                    <div className="flex flex-col items-start pl-2"> {/* ✅ Added `pl-2` to shift "LET'S CONNECT!" slightly to the right */}
                    <span className="text-[#EDB900] font-bold mb-2">LET&apos;S CONNECT!</span>
                      <div className="flex space-x-4">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                          <FaFacebookF className="text-lg text-white hover:text-[#EDB900] transition-colors duration-200 cursor-pointer" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                          <FaInstagram className="text-lg text-white hover:text-[#EDB900] transition-colors duration-200 cursor-pointer" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                          <FaXTwitter className="text-lg text-white hover:text-[#EDB900] transition-colors duration-200 cursor-pointer" />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                          <FaLinkedinIn className="text-lg text-white hover:text-[#EDB900] transition-colors duration-200 cursor-pointer" />
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                          <FaYoutube className="text-lg text-white hover:text-[#EDB900] transition-colors duration-200 cursor-pointer" />
                        </a>
                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
                          <FaTiktok className="text-lg text-white hover:text-[#EDB900] transition-colors duration-200 cursor-pointer" />
                        </a>
                        <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
                          <FaDiscord className="text-lg text-white hover:text-[#EDB900] transition-colors duration-200 cursor-pointer" />
                        </a>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side - User Profile */}
        <div className="relative group">
          <button className="hover:text-[#EDB900] transition-all">
            <Image
              src="/profile.webp"
              alt="User"
              width={50}
              height={50}
              className="w-[50px] h-[50px] rounded-full"
            />
          </button>

          {/* Profile Dropdown */}
          <div className="absolute top-12 right-0 bg-[#0f0f0f] p-4 rounded-lg shadow-lg w-36 border border-[rgba(109,109,109,0.2)]
            opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto hover:border border-[rgba(109,109,109,0.2)]">
            {["Dashboard", "Settings", "Logout"].map((item, index) => (
              <Link key={index} href={`/${item.toLowerCase()}`}>
                <p className="capitalize block py-2 px-4 hover:bg-[rgba(41,41,41,0.4)] hover:text-[#EDB900] cursor-pointer rounded-md hover:border border-[rgba(109,109,109,0.2)]">
                  {item}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
