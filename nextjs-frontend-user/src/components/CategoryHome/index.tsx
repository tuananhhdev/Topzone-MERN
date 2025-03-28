"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { SETTINGS } from "@/config/settings";
import { Navigation } from "swiper/modules";
import axios from "axios";
import Link from "next/link";
import "../../styles/category-home.css";
import Image from "next/image";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface ICategory {
  _id: string;
  category_name: string;
  photo: string;
  slug: string;
}

const CategoryHome: React.FC = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${SETTINGS.URL_API}/v1/categories?page=1&limit=200`);
        const reversedCategories = [...response.data?.data.categories_list].reverse();
        setCategories(reversedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="category-grid mt-8">
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={4}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="category-swiper"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <SwiperSlide key={index}>
              <div className="category-item">
                <div className="category__card" style={{ padding: "10px" }}>
                  {" "}
                  {/* Thêm padding để tạo khoảng cách như trong hình */}
                  <Skeleton width={120} height={120} style={{ borderRadius: "8px" }} />{" "}
                  {/* Thay circle bằng hình vuông */}
                  <p className="mt-2 text-center">
                    <Skeleton width={80} />
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="category-prev"></div>
        <div className="category-next"></div>
      </div>
    );
  }

  return (
    <div className="category-grid mt-8">
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        navigation={{
          nextEl: ".category-next",
          prevEl: ".category-prev",
        }}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="category-swiper"
      >
        {categories.map((category) => (
          <SwiperSlide key={category._id} className="category-item">
            <Link href={`/category/${category.slug}`}>
              <div className="category__card">
                <Image
                  src={`${SETTINGS.URL_IMAGE}/${category.photo}`}
                  alt={category.category_name}
                  width={120}
                  height={120}
                  quality={100}
                  priority
                  className="h-auto w-full object-contain"
                />
                <p className="mt-2 text-center font-medium text-white">{category.category_name}</p>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="category-prev"></div> {/* Nút prev */}
      <div className="category-next"></div> {/* Nút next */}
    </div>
  );
};

export default CategoryHome;
