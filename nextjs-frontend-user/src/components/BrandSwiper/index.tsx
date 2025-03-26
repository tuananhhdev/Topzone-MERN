"use client";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/grid";
import axios from "axios";
import { SETTINGS } from "@/config/settings";
import { FreeMode, Navigation, Grid } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";
import "../../styles/brand-swiper.css";

interface Brand {
  _id: string;
  brand_name: string;
  slug: string;
  thumbnail: string;
}

const BrandSwiper: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(
          `${SETTINGS.URL_API}/v1/brands?page=1&limit=200`
        );
        setBrands(response.data.data.brands_list);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      }
    };
    fetchBrands();
  }, []);

  return (
    <div className="brand-swiper-container">
      <Swiper
        modules={[FreeMode, Navigation, Grid]}
        spaceBetween={15}
        slidesPerView={5} // Hiển thị 3 cột
        grid={{ rows: 2, fill: "row" }} // Chia thành 2 hàng
        freeMode={true}
        navigation={{
          nextEl: ".brand-swiper-next",
          prevEl: ".brand-swiper-prev",
        }}
        className="brand-grid-container"
      >
        {brands.map((brand) => (
          <SwiperSlide key={brand._id} className="brand-slide">
            <Link href={`/brands/${brand.slug}`} className="brand-box">
              <Image
                src={`${SETTINGS.URL_IMAGE}/${brand.thumbnail}`}
                alt={brand.brand_name}
                width={60}
                height={60}
                className="brand-logo"
              />
              <span className="brand-name">{brand.brand_name}</span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>   
      <div className="brand-swiper-prev"></div> {/* Nút prev */}
      <div className="brand-swiper-next"></div> {/* Nút next */}
    </div>
  );
};

export default BrandSwiper;
