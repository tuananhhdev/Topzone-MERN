"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "../../styles/product-list.css";
import { Navigation } from "swiper/modules";
import axios from "axios";
import { SETTINGS } from "@/config/settings";
import Image from "next/image";
import Link from "next/link";
import { TbShoppingBagPlus } from "react-icons/tb";
import { TypewriterEffect } from "../ui/typewriter-effect";
import { motion } from "framer-motion";
import { FaTruckFast } from "react-icons/fa6";
import "../../styles/cate-lap.css";
import { Scale } from "lucide-react";

interface IProduct {
  _id: string;
  product_name: string;
  price: number;
  price_end: number;
  discount: number;
  photos: string[];
  slug: string;
}

const CateLaptop = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${SETTINGS.URL_API}/v1/products/category/laptop`
        ); // Thay bằng URL API của bạn
        setProducts(res.data?.data.products_list);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const words = [
    {
      text: "Laptop",
    },
    {
      text: "gaming",
    },
    {
      text: "bán",
    },
    {
      text: "chạy",
    },
    {
      text: "|",
      className: "mx-2",
    },
    {
      text: (
        <motion.span
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mr-2"
        >
          <FaTruckFast className="text-rose-600" size={30} />
        </motion.span>
      ),
    },
    {
      text: "Miễn",
    },
    {
      text: "phí",
    },
    {
      text: "giao",
    },
    {
      text: "hàng",
    },
  ];

  return (
    <div className="cate-laptop-container bg-[#101010] p-4 rounded-xl">
      <div className="flex justify-between items-center mb-10">
        {" "}
        {/* Thêm div bọc ngoài và flex */}
        <h2 className="text-[28px] text-white font-bold mt-2 flex items-center">
          <TypewriterEffect words={words} />
        </h2>
        <Link
          href="/category/laptop"
          className="flex items-center" // Căn giữa button theo chiều dọc
        >
          <motion.button
            whileTap={{ scale: 0.85 }}
            className="flex items-center mt-5 bg-white text-xl font-semibold px-6 py-2 rounded-full"
          >
            Xem tất cả
          </motion.button>
        </Link>
      </div>
      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: ".cate-lap-next",
          prevEl: ".cate-lap-prev",
        }}
        spaceBetween={20}
        slidesPerView={4}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
      >
        {products.map((product) => {
          return (
            <SwiperSlide key={product._id}>
              <div className="cate-lap-slide-container rounded-xl p-4 pb-6 pt-6">
                <Link href={`/products/${product.slug}`}>
                  <div className="cate-lap-image-wrapper">
                    <Image
                      src={`${SETTINGS.URL_IMAGE}/${product.photos[0]}`}
                      alt={product.product_name}
                      width={150}
                      height={150}
                      quality={100}
                      className={`block m-auto mb-8 transition-all duration-500`}
                    />
                  </div>
                </Link>
                <span className="bg-[#a6aaaa] text-gray-800 text-sm px-3 py-1 font-semibold rounded-full ">
                  Trả góp 0%
                </span>
                <Link href={`/products/${product.slug}`}>
                  <h3 className="text-lg text-[#fff] font-semibold h-16 mt-4 overflow-hidden">
                    {product.product_name}
                  </h3>
                </Link>
                <div className="w-full mt-auto">
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-500 line-through">
                      {product.price_end.toLocaleString()} đ
                    </p>
                    <p className="text-red-500 font-bold">
                      -{product.discount}%
                    </p>
                  </div>
                  <p className="text-[#fff] font-bold text-lg mb-1">
                    {product.price.toLocaleString()} đ
                  </p>
                  <p className="text-green-500">
                    Giảm {formatPrice(product.price - product.price_end)}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }} // Khi nhấn, button thu nhỏ 10%
                  transition={{ type: "spring", stiffness: 200, damping: 10 }} // Hiệu ứng nảy
                  className="mt-5 w-full flex items-center justify-center gap-4 bg-[#434040] text-white py-2.5 rounded-full transition-all duration-300 hover:bg-[#fff] hover:text-black hover:font-medium"
                >
                  <span>
                    <TbShoppingBagPlus size={30} />
                  </span>
                  Thêm giỏ hàng
                </motion.button>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div className="cate-lap-prev"></div> {/* Nút prev */}
      <div className="cate-lap-next"></div> {/* Nút next */}
    </div>
  );
};

export default CateLaptop;
