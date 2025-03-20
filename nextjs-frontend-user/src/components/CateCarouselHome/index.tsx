"use client";

import Image from "next/image";
import React from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "../../styles/cate-carousel.css";

interface cateItems {
  id: string;
  image: string;
  altImg: string;
}

const CateCarouselHome = () => {
  const cateItem = [
    {
      id: "1",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:quality(100)/H2_614x2124_A_5d5d69aefb.png",
      altImg: "slide_1-png",
    },
    {
      id: "2",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:quality(100)/H2_614x212_6e61887959.png",
      altImg: "slide_2-png",
    },
    {
      id: "3",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:quality(100)/H2_614x212_e97abfb675.png",
      altImg: "slide_3-png",
    },
    {
      id: "4",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:quality(100)/H2_614x212_e97abfb675.png",
      altImg: "slide_5-png",
    },
    {
      id: "5",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:quality(100)/H2_614x212_9ac6ad68d5.png",
      altImg: "slide_5-png",
    },
  ];

  return (
    <>
      <div className="cate-carousel-container mt-8 mb-8">
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={2}
          navigation={{
            nextEl: ".cate-carousel-next",
            prevEl: ".cate-carousel-prev",
          }}
          className="cate-carousel-swiper"
        >
          {cateItem.map((cate: cateItems) => {
            return (
              <SwiperSlide key={cate.id} className="cate-carousel-item">
                  <Image
                    src={cate.image}
                    alt={cate.altImg}
                    width={500}
                    height={500}
                    layout="responsive"
                    quality={100}
                    priority
                  />
              </SwiperSlide>
            );
          })}
        </Swiper>
        <div className="cate-carousel-controls">
          <div className="cate-carousel-prev"></div>
          <div className="cate-carousel-next"></div>
        </div>
      </div>
    </>
  );
};

export default CateCarouselHome;
