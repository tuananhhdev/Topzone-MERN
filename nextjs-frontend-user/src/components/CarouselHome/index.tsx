"use client";

import React, { useEffect, useState } from "react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import { SETTINGS } from "@/config/settings";
import { Swiper, SwiperSlide } from "swiper/react";
import axios from "axios";
import "../../styles/carousel_home.css";
interface IBanner {
  _id: string;
  imageUrl: string;
  altText: string;
}

const CarouselHome = () => {
  const [banners, setBanners] = useState<IBanner[]>([]);

  
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(`${SETTINGS.URL_API}/v1/banners`);
        setBanners(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBanners();
  }, []);

  return (
    <div className="swiper-container w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={1}
        centeredSlides={true}
        navigation={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop={true}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 1,
            spaceBetween: 30,
          },
        }}
      >
        {banners.length > 0 &&
          banners.map((banner: IBanner) => (
            <SwiperSlide key={banner._id}>
              <div className="relative w-full h-[500px]">
                <Image
                  src={banner.imageUrl}
                  alt={banner.altText}
                  quality={100}
                  layout="fill"
                  objectFit="cover"
                  priority
                />
              </div>
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
};

export default CarouselHome;
