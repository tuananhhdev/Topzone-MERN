"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "@/styles/banner-ad.css";
interface IBannerItem {
  id: number;
  url: string;
}

const BannerAd = () => {
  const bannerItems = [
    {
      id: 1,
      url: "https://cdn2.fptshop.com.vn/unsafe/828x0/filters:quality(100)/H3_405x175_f284ee37dc.png",
      altName: "slide1-png",
    },
    {
      id: 2,
      url: "https://cdn2.fptshop.com.vn/unsafe/828x0/filters:quality(100)/H3_405x175_535db75134.png",
      altName: "slide2-png",
    },
    {
      id: 3,
      url: "https://cdn2.fptshop.com.vn/unsafe/H3_405x175_c7546a90f6.png",
      altName: "slide3-png",
    },
    {
      id: 4,
      url: "https://cdn2.fptshop.com.vn/unsafe/828x0/filters:quality(100)/Desktop_H3_12_85f9955ceb.png",
      altName: "slide4-png",
    },
    {
      id: 5,
      url: "https://cdn2.fptshop.com.vn/unsafe/828x0/filters:quality(100)/H3_405x175_3efbfd29cf.png",
      altName: "slide5-png",
    },
    {
      id: 6,
      url: "https://cdn2.fptshop.com.vn/unsafe/828x0/filters:quality(100)/H3_405x175_7fc7f9dea3.png",
      altName: "slide6-png",
    },
    {
      id: 7,
      url: "https://cdn2.fptshop.com.vn/unsafe/828x0/filters:quality(100)/H3_405x175_86e77044ee.png",
      altName: "slide7-png",
    },
  ];

  return (
    <div className="banner-ad-carousel-container py-8">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={20}
        slidesPerView={3}
        autoplay={{
          delay: 1000, // 3 giây chuyển slide
          disableOnInteraction: false, // Giữ autoplay sau khi user swipe
          pauseOnMouseEnter: true,
        }}
        speed={3000} // Tăng tốc độ di chuyển
        loop={true}
        // breakpoints={{
        //   320: { slidesPerView: 1 },
        //   640: { slidesPerView: 2 },
        //   1024: { slidesPerView: 3 },
        //   1280: { slidesPerView: 4 },
        // }}
        className="banner-ad-carousel-swiper"
      >
        {bannerItems.map((item: IBannerItem) => {
          return (
            <SwiperSlide key={item.id} className="banner-ad-carousel-item">
              <div>
                <Image
                  src={item.url}
                  alt={"banner - ad - png"}
                  width={500}
                  height={500}
                  layout="responsive"
                  quality={100}
                  priority
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default BannerAd;
