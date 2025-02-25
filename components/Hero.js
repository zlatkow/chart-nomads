import { ReactTyped } from "react-typed";
import Noise from "./Noise"; // ✅ Import the Noise component

const Hero = () => {
  return (
    <section className="flex items-center justify-center px-6" style={{ height: "calc(100vh - 92px)" }}>
            {/* ✅ Noise Overlay Component */}
            <Noise />
      <div className="max-w-[1920px] w-full text-white flex flex-col items-start justify-center">
        {/* ✅ Apply correct size & color to H1 */}
        <h1 className="text-10xl font-bold text-[#EDB900] font-[var(--font-balboa)] leading-[1.1]">
          CHART NOMADS
        </h1>

        <h2 id="hero-typed" className="text-5xl font-semibold mt-4">
          <span>
            <ReactTyped
              strings={[
                "Research.",
                "Review.",
                "Collect rewards.",
                "Own Your Freedom.",
              ]}
              typeSpeed={50}
              backSpeed={30}
              backDelay={1600}
              loop
            />
          </span>
        </h2>
      </div>
    </section>
  );
};

export default Hero;
