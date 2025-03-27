"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";
import { TypewriterEffect } from "../ui/typewriter-effect";

interface IPaymentData {
  id: string;
  image: string;
  altImg: string;
}

const PaymentIncentivesCarousel = () => {
  const paymentData = [
    {
      id: "1",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/828x0/filters:quality(100)/H3_405x175_B1_2_620e606804.png",
      altImg: "Slide1_png",
    },
    {
      id: "2",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/828x0/filters:quality(100)/H3_405x175_cf8c780f99.png",
      altImg: "Slide2_png",
    },
    {
      id: "3",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/828x0/filters:quality(100)/H3_405x175_B1_b4efb4cd22.png",
      altImg: "Slide3_png",
    },
    {
      id: "4",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/828x0/filters:quality(100)/H3_405x175_A1_9f35d00a82.png",
      altImg: "Slide4_png",
    },
    {
      id: "5",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/828x0/filters:quality(100)/H3_405x175_B1_1_873a140f97.png",
      altImg: "Slide5_png",
    },
    {
      id: "6",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/828x0/filters:quality(100)/H3_405x175_19c46cc7a5.jpg",
      altImg: "Slide6_png",
    },
    {
      id: "7",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/828x0/filters:quality(100)/H3_405x175_c7546a90f6.png",
      altImg: "Slide7_png",
    },
    {
      id: "8",
      image: "https://cdn2.fptshop.com.vn/unsafe/H3_405x175_C1_04e9013117.png",
      altImg: "Slide8_png",
    },
  ];

  const words = [
    {
      text: "Ưu",
    },
    {
      text: "đãi",
    },
    {
      text: "thanh",
    },
    {
      text: "toán",
    },
  ];

  return (
    <div className="payment-incentives-container my-8 rounded-2xl bg-[#101010] p-4">
      <div>
        <h2 className="mt-2 min-h-[40px] text-[28px] font-semibold text-white">
          <TypewriterEffect words={words} showCursor={false} />
        </h2>
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
          className="payment-incentives-swiper"
        >
          {paymentData.map((item: IPaymentData) => {
            return (
              <SwiperSlide key={item.id} className="payment-incentives-item">
                <div className="payment-incentives-slide-container pb-2 pt-10">
                  <Image
                    src={item.image}
                    alt={"payment-incentive__img"}
                    width={500}
                    height={500}
                    layout="responsive"
                    quality={100}
                    priority
                    className="rounded-[15px]"
                  />
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default PaymentIncentivesCarousel;
