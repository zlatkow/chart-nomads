import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Scrollable from "../components/Scrollable";
import Benefits from "../components/Benefits";
import CeoQuote from "../components/CeoQuote";
import Partners from "../components/Partners";
import LatestBlogs from "../components/LatestBlogs";
import Testimonials from "../components/Testimonials";
import Community from "../components/Community";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";

export async function getServerSideProps() {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("featured", true); // ✅ Only fetch featured blogs

  if (error) {
    console.error("Error fetching blogs:", error);
    return { props: { blogs: [] } };
  }

  return { props: { blogs: data } };
}


export default function Home({ blogs }) {
  return (
    <div>
      <Navbar />
      <Hero />
      <Scrollable />
      <Benefits />
      <CeoQuote />
      <Partners />
      <LatestBlogs blogs={blogs} />  {/* ✅ Pass blogs as props */}
      <Testimonials />
      <Community />
      <Newsletter />
      <Footer />
    </div>
  );
}
