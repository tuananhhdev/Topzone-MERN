"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { SETTINGS } from "@/config/settings";
import { Grid, Navigation } from "swiper/modules";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import "../../styles/category.css";
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
  // Fetch dữ liệu từ API
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
        setIsLoading(false); // Đặt isLoading thành false sau khi fetch xong
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="category-grid">
      <Swiper
        modules={[Grid, Navigation]}
        spaceBetween={10}
        grid={{
          rows: 2,
          fill: "row",
        }}
        navigation={true}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="mySwiper"
      >
        {isLoading
          ? // Hiển thị Skeleton loading
            [...Array(4)].map((_, index) => (
              <SwiperSlide key={index} className="category-item">
                <div className="category__card p-4 bg-white rounded-lg cursor-pointer">
                  <Skeleton height={100} width={100} className="mx-auto" />{" "}
                  {/* Skeleton cho ảnh */}
                  <Skeleton
                    height={10}
                    width={100}
                    className="mt-2 mx-auto"
                  />{" "}
                  {/* Skeleton cho tên danh mục */}
                </div>
              </SwiperSlide>
            ))
          : // Hiển thị danh sách categories khi đã fetch xong
            categories.map((category, index) => (
              <SwiperSlide key={index} className="category-item">
                <SwiperSlide key={index} className="category-item">
                  <Link href={`/category/${category.slug}`}>
                    <div className="category__card p-4 bg-white rounded-lg cursor-pointer">
                      <Image
                        src={`${SETTINGS.URL_IMAGE}/${category.photo}`}
                        alt={category.category_name}
                        width={100}
                        height={100}
                        quality={100}
                        priority
                      />
                      <p className="mt-2 text-center font-medium">
                        {category.category_name}
                      </p>
                    </div>
                  </Link>
                </SwiperSlide>
              </SwiperSlide>
            ))}
      </Swiper>
    </div>
  );
};

export default CategoryHome;
