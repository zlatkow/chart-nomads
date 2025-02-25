import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules"; // ✅ Import Autoplay
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const LatestBlogs = ({ blogs }) => {
  const paginationRef = useRef(null);
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    if (swiperInstance && paginationRef.current) {
      swiperInstance.params.pagination.el = paginationRef.current;
      swiperInstance.pagination.init();
      swiperInstance.pagination.update();
    }
  }, [swiperInstance]);

  return (
    <section className="bg-[#EDB900] py-20">
      <div className="container mx-auto text-center">
        <p className="text-black uppercase font-semibold tracking-wide text-sm">
          Daily Value
        </p>
        <h2 className="text-black text-5xl font-bold font-[var(--font-balboa)]">
          Our Latest Blogs
        </h2>
      </div>

      {/* Blog Carousel */}
      <div className="mt-10 w-full max-w-[1400px] h-[500px] mx-auto relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]} // ✅ Include Autoplay module
          spaceBetween={50}
          slidesPerView={1}
          navigation={{
            nextEl: ".custom-swiper-button-next",
            prevEl: ".custom-swiper-button-prev",
          }}
          pagination={{
            el: paginationRef.current,
            clickable: true,
            dynamicBullets: true,
          }}
          autoplay={{
            delay: 4000, // ⏳ 4 seconds between slides
            disableOnInteraction: false, // 👆 Keeps autoplay running after manual interaction
          }}
          loop
          onSwiper={setSwiperInstance}
          className="w-full"
        >
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <SwiperSlide key={blog.id}>
                <div className="flex bg-[#0f0f0f] text-white rounded-xl overflow-hidden shadow-lg w-full h-[450px]">
                  {/* Blog Image */}
                  <div className="w-1/2 h-full">
                    <Image
                      src={blog.image_url}
                      alt={blog.name}
                      width={700}
                      height={450}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Blog Content */}
                  <div className="w-1/2 p-10 flex flex-col justify-center">
                    <span className="bg-[#EDB900] text-black px-[9px] py-1 text-xs font-semibold rounded-md inline-flex w-fit">
                      {blog.category || "General"}
                    </span>
                    <h3 className="text-4xl font-semibold mt-2">{blog.name}</h3>
                    <p className="text-300 text-md mt-2 min-h-[200px]">
                      {blog.summary || "No summary available."}
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center mt-4">
                      <Image
                        src={blog.author_image || "/avatars/delyan_zlatkov.webp"}
                        alt={blog.author || "Unknown Author"}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div className="ml-3 text-md">
                        <p>{blog.author || "Unknown Author"}</p>
                        <p className="text-400 text-sm">
                          {new Date(blog.created_at).toLocaleDateString()} • {blog.read_time || "5 min read"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))
          ) : (
            <p className="text-black text-lg text-center mt-4">No blogs available.</p>
          )}
        </Swiper>

        {/* Custom Navigation Arrows */}
        <button className="custom-swiper-button-prev absolute top-1/2 left-[-50px] transform -translate-y-1/2 z-10 text-black text-4xl hover:opacity-80">
          ❮
        </button>
        <button className="custom-swiper-button-next absolute top-1/2 right-[-50px] transform -translate-y-1/2 z-10 text-black text-4xl hover:opacity-80">
          ❯
        </button>

        {/* Fixed Pagination */}
        <div
          ref={paginationRef}
          className="absolute bottom-[-50px] left-1/2 transform -translate-x-1/2 flex justify-center space-x-2"
        ></div>
      </div>
    </section>
  );
};

export default LatestBlogs;
