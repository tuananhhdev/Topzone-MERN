"use client";

import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { SETTINGS } from "@/config/settings";
import { Navigation } from "swiper/modules";
import axios from "axios";
import Link from "next/link";
import "../../styles/category-home.css";
import Image from "next/image";

interface ICategory {
  _id: string;
  category_name: string;
  photo: string;
  slug: string;
}

const CategoryHome: React.FC = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${SETTINGS.URL_API}/v1/categories?page=1&limit=200`
        );
        setCategories(response.data?.data.categories_list);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="category-grid" ref={scrollRef}>
      <Swiper
        modules={[Navigation]}
        spaceBetween={10}
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
              <div className="category__card p-4 bg-white rounded-lg cursor-pointer">
                <Image
                  src={`${SETTINGS.URL_IMAGE}/${category.photo}`}
                  alt={category.category_name}
                  width={120}
                  height={120}
                  quality={100}
                  priority
                />
                <p className="mt-2 text-center font-medium text-white">
                  {category.category_name}
                </p>
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
