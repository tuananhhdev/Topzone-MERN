"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { SETTINGS } from "@/config/settings";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "../../styles/product-list.css";
import { Navigation } from "swiper/modules";
import { TbShoppingBagPlus } from "react-icons/tb";
import Link from "next/link";
import { TypewriterEffect } from "../ui/typewriter-effect";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";

interface IProduct {
  _id: string;
  product_name: string;
  price: number;
  price_end: number;
  discount: number;
  photos: string[];
  slug: string;
}

const ProductCarousel = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${SETTINGS.URL_API}/v1/products`, {
          cache: "no-store",
        });
        const data = await response.json();
        setProducts(data.data.products_list);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const words = [
    {
      text: "Mua",
    },
    {
      text: "đúng",
    },
    {
      text: "quà",
    },
    {
      text: "-",
    },
    {
      text: '"',
    },
    {
      text: "Nàng",
    },
    {
      text: "hiền",
    },
    {
      text: "hòa",
    },
    {
      text: '"',
    },
  ];

  return (

    <div className="pro-list-container bg-[#101010] p-4 rounded-xl">
      <h2 className="text-[28px] text-white font-bold mb-10 mt-2">
        {/* Mua đúng quà - &quot;Nàng hiền hòa&quot; */}
        <TypewriterEffect words={words} />
      </h2>
      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: ".pro-list-next",
          prevEl: ".pro-list-prev",
        }}
        spaceBetween={20}
        slidesPerView={4}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        className="mySwiper"
      >
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <div className="slide-container rounded-xl p-4 pb-6 pt-6">
              <Link
                href={`/products/${product.slug}`}
                className="image-container"
              >
                <div className="image-wrapper">
                  <Image
                    src={`${SETTINGS.URL_IMAGE}/${product.photos[0]}`}
                    alt={product.product_name}
                    width={150}
                    height={150}
                    quality={100}
                    className={`m-auto block mb-8 transition-all duration-500 ${
                      imageLoaded[product._id] ? "loaded" : "blurred"
                    }`}
                    onLoad={() =>
                      setImageLoaded((prev) => ({
                        ...prev,
                        [product._id]: true,
                      }))
                    }
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
              <div className="w-full  mt-auto">
                <div className="flex items-center space-x-2">
                  <p className="text-gray-500 line-through">
                    {product.price_end.toLocaleString()} đ
                  </p>
                  <p className="text-red-500 font-bold">-{product.discount}%</p>
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
        ))}
      </Swiper>
      <div className="pro-list-prev"></div> {/* Nút prev */}
      <div className="pro-list-next"></div> {/* Nút next */}
    </div>
  );
};

export default ProductCarousel;
