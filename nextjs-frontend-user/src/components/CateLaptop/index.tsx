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
import { useCartLogic } from "@/hooks/useCartLogic";

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
  const { addToCart } = useCartLogic();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${SETTINGS.URL_API}/v1/products/category/laptop`
        );
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
    { text: "Laptop" },
    { text: "gaming" },
    { text: "bán" },
    { text: "chạy" },
    { text: "|", className: "mx-2" },
    { text: <FaTruckFast className="mr-2 text-rose-600" size={30} /> },
    { text: "Miễn" },
    { text: "phí" },
    { text: "giao" },
    { text: "hàng" },
  ];

  return (
    <div className="cate-laptop-container rounded-2xl bg-[#101010] p-4">
      <div className="mb-10 flex items-center justify-between">
        <h2 className="mt-2 flex items-center text-[28px] font-semibold text-white">
          <TypewriterEffect words={words} showCursor={false} />
        </h2>
        <Link
          href="/category/laptop"
          as={"/category/laptop"}
          prefetch={false}
          className="flex items-center"
        >
          <motion.button
            whileTap={{ scale: 0.85 }}
            className="mt-5 flex items-center rounded-full bg-white px-6 py-2 text-xl font-semibold"
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
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <div className="cate-lap-slide-container mb-2 rounded-xl p-4 pb-6 pt-6">
              <Link href={`/products/${product.slug}`}>
                <div className="cate-lap-image-wrapper">
                  <Image
                    src={`${SETTINGS.URL_IMAGE}/${product.photos[0]}`}
                    alt={product.product_name}
                    width={150}
                    height={150}
                    quality={80}
                    className={`m-auto mb-8 block transition-all duration-500`}
                  />
                </div>
              </Link>
              <span className="rounded-full bg-[#a6aaaa] px-3 py-1 text-sm font-semibold text-gray-800">
                Trả góp 0%
              </span>
              <Link href={`/products/${product.slug}`}>
                <h3 className="mt-4 h-16 overflow-hidden text-lg font-semibold text-[#fff]">
                  {product.product_name}
                </h3>
              </Link>
              <div className="mt-auto w-full">
                <div className="flex items-center space-x-2">
                  <p className="text-gray-500 line-through">
                    {product.price_end.toLocaleString()} đ
                  </p>
                  <p className="font-bold text-red-500">
                    -{product.discount}%
                  </p>
                </div>
                <p className="mb-1 text-lg font-bold text-[#fff]">
                  {product.price.toLocaleString()} đ
                </p>
                <p className="text-green-500">
                  Giảm {formatPrice(product.price - product.price_end)}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                onClick={() =>
                  addToCart({
                    _id: product._id,
                    product_name: product.product_name,
                    price: product.price,
                    discount: product.discount,
                    photos: product.photos,
                    slug: product.slug,
                    price_end: product.price_end,
                    // Không truyền selectedVariant vì CateLaptop không có UI chọn biến thể
                  })
                }
                className="mt-5 flex w-full items-center justify-center gap-4 rounded-full bg-[#434040] py-2.5 text-white transition-all duration-300 hover:bg-[#fff] hover:font-medium hover:text-black"
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
      <div className="cate-lap-prev"></div>
      <div className="cate-lap-next"></div>
    </div>
  );
};

export default CateLaptop;