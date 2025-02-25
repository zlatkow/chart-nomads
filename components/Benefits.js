import React from "react";

const benefits = [
  {
    icon: "/icons/compare_icon.webp",
    title: "Compare prop firms",
    description: "Compare all the prop firms listed on our platform fast and easy.",
  },
  {
    icon: "/icons/reviews_icon.webp",
    title: "Verified reviews",
    description: "We guarantee every review on our platform is 100% verified and genuine.",
  },
  {
    icon: "/icons/news_icon.webp",
    title: "Industry news",
    description: "Stay informed with the latest industry news and beyond.",
  },
  {
    icon: "/icons/metrics_icon.webp",
    title: "Track metrics",
    description: "Effortlessly track key prop firm metrics like web traffic, payout data, and customer sentiment.",
  },
  {
    icon: "/icons/peaceofmind_icon.webp",
    title: "Peace of mind",
    description: "Buying a challenge from our site guarantees you'll interact only with the best companies in the industry.",
  },
  {
    icon: "/icons/networking_icon.webp",
    title: "Networking",
    description: "Connect with like-minded people from around the world who love trading just like you.",
  },
  {
    icon: "/icons/uptodate_icon.webp",
    title: "Stay up to date",
    description: "Stay up to date with the latest trends and insights in the prop trading world.",
  },
  {
    icon: "/icons/offer_icon.webp",
    title: "Discounts",
    description: "Enjoy exclusive offers and discounts. Collect loyalty points and earn rewards.",
  },
  {
    icon: "/icons/cause_icon.webp",
    title: "Community with a cause",
    description: "A portion of our profits supports talent development in the industry and various charities chosen regularly by the community.",
  },
];

const Benefits = () => {
  return (
    <section className="py-20 bg-[#0f0f0f] text-white">
      <div className="container mx-auto px-6 max-w-[1200px]">
        {/* Section Title */}
        <h2 className="text-4xl font-bold text-left mb-4">
          Why using our services?
        </h2>
        <div className="w-[325px] h-[3px] bg-[#EDB900] mb-10"></div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-[#131313] p-6 rounded-xl border border-[#2a2a2a] transition-transform duration-200 hover:scale-[1.03] hover:bg-[rgba(255,255,255,0.1)] hover:border-[#EDB900]"
            >
              {/* Icon */}
              <div className="mb-4">
                <img src={benefit.icon} alt={benefit.title} className="w-16 h-16 rounded-[10px]"/>
              </div>
              {/* Title */}
              <h3 className="text-xl mb-2">{benefit.title}</h3>
              {/* Description */}
              <p className="text-400 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
