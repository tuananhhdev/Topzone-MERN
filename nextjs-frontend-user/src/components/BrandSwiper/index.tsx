"use client";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import axios from "axios";
import { SETTINGS } from "@/config/settings";
import { Navigation, Pagination } from "swiper/modules";
import Link from "next/link";

interface Brand {
  _id: string;
  brand_name: string;
  slug: string;
}

const BrandSwiper: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(`${SETTINGS.URL_API}/v1/brands`);
        setBrands(response.data.data.brands_list);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return <p>Loading brands...</p>;
  }

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      spaceBetween={50}
      slidesPerView={3}
      navigation
      pagination={{ clickable: true }}
    >
      {brands.map((brand) => (
        <SwiperSlide key={brand._id}>
          <div className="flex flex-col items-center">
            <Link href={`/brands/${brand.slug}`}>
              <p className="mt-2 text-[#6B7280] font-semibold cursor-pointer">
                {brand.brand_name}
              </p>
            </Link>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default BrandSwiper;
