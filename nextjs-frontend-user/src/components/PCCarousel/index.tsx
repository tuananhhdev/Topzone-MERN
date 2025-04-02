"use client";

import { SETTINGS } from "@/config/settings";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Link from "next/link";
import { TypewriterEffect } from "../ui/typewriter-effect";
import { GiRose } from "react-icons/gi";
// import "../../styles/ear-phone.css";

interface IProduct {
  _id: string;
  product_name: string;
  price: number;
  price_end: number;
  discount: number;
  photos: string[];
  slug: string;
}

const PCCarousel = () => {
  const [products, setProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${SETTINGS.URL_API}/v1/products/category/tai-nghe`
        );
        setProducts(response.data.data.products_list);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const words = [
    {
      text: "Bên",
    },
    {
      text: "nàng",
    },
    {
      text: "mỗi",
    },
    {
      text: "ngày",
    },
    {
      text: <GiRose className="mr-2 text-rose-600" size={32} />,
    },
  ];

  return (
    <>
      <h2 className="mt-2 min-h-[40px] pb-8 text-[28px] font-semibold text-white">
        <TypewriterEffect words={words} showCursor={false} />
      </h2>
      <div className="mb-8 flex gap-2">
        {/* Swiper bên trái (Giảm kích thước) */}
        <div className="relative w-[38.8%] rounded-2xl bg-[#101010] p-4 shadow-lg">
          {/* Pagination Custom */}
          <div className="absolute left-1/2 top-0 mt-3 -translate-x-1/2 transform py-2">
            <div className="swiper-pagination-custom flex justify-center gap-2"></div>
          </div>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            autoplay={{ delay: 3000 }}
            navigation={{
              nextEl: ".ear-phone-next",
              prevEl: ".ear-phone-prev",
            }}
            pagination={{
              el: ".swiper-pagination-custom",
              clickable: true,
              renderBullet: (index, className) => {
                return `<span class="${className}" 
                style="
                  width: 50px; 
                  height: 3px; 
                  background-color: #ff0042; 
                  border-radius: 4px; 
                  transition: background-color 0.3s ease-in-out;
                "></span>`;
              },
            }}
            spaceBetween={10}
            slidesPerView={1}
            className="relative"
          >
            {products.length > 0 &&
              products.map((product: IProduct) => (
                <SwiperSlide key={product._id}>
                  <div className="ear-phone-slide-container mt-16 flex flex-col items-center text-white">
                    {/* Tên sản phẩm */}
                    <h3 className="text-md mb-1 text-center font-medium">
                      {product.product_name}
                    </h3>
                    {/* Giá sản phẩm */}
                    <p className="text-lg font-bold text-white">
                      {product.price.toLocaleString()} ₫
                    </p>
                    {/* Nút xem chi tiết */}
                    <Link href={`/products/${product.slug}`}>
                      <button className="mb-10 mt-4 rounded-full bg-white px-5 py-2 font-semibold text-black">
                        Xem chi tiết
                      </button>
                    </Link>
                    {/* Hình ảnh sản phẩm */}
                    <Image
                      src={`${SETTINGS.URL_IMAGE}/${product.photos[0]}`}
                      alt={product.product_name}
                      width={180} // Điều chỉnh kích thước ảnh
                      height={180}
                      quality={80}
                      priority
                      className="my-2 h-auto w-auto object-contain"
                    />
                  </div>
                </SwiperSlide>
              ))}
          </Swiper>
        </div>
        <div className="ear-phone-prev"></div> {/* Nút prev */}
        <div className="ear-phone-next"></div> {/* Nút next */}
        {/* Swiper bên phải */}
        <div className="w-3/5">
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={17}
            slidesPerView={2.5}
            className="w-full overflow-visible"
          >
            {[
              "https://cdn2.fptshop.com.vn/unsafe/750x0/filters:quality(100)/MH_7_168_300_1_new_2284e2acfd.png",
              "https://cdn2.fptshop.com.vn/unsafe/750x0/filters:quality(100)/MH_7_168_300_1_6358a33828.png",
              "https://cdn2.fptshop.com.vn/unsafe/750x0/filters:quality(100)/MH_7_168_300_new_3c35555999.png",
              "https://cdn2.fptshop.com.vn/unsafe/750x0/filters:quality(100)/MH_7_168x300_f570585ee5.png",
            ].map((src, index) => (
              <SwiperSlide key={index} className="w-full">
                <div className="w-full overflow-hidden">
                  <Image
                    src={src.trim()}
                    alt={`Banner ${index + 1}`}
                    width={360}
                    height={640}
                    quality={80}
                    priority
                    className="h-[455px] rounded-xl object-fill"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default PCCarousel;
