"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { SETTINGS } from "@/config/settings";
import "../../styles/carousel_home.css";

interface IBanner {
  _id: string;
  imageUrl: string;
  altText: string;
}

interface CarouselHomeProps {
  banners: IBanner[];
}

const CarouselHome: React.FC<CarouselHomeProps> = ({ banners }) => {
  return (
    <div className="relative w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={1}
        centeredSlides
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner._id}>
            <div className="relative h-96 w-full">
              <Image
                src={
                  banner.imageUrl.startsWith("http")
                    ? banner.imageUrl
                    : `${SETTINGS.URL_IMAGE}${banner.imageUrl}`
                }
                alt={banner.altText}
                layout="fill"
                priority
                quality={100}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CarouselHome;
