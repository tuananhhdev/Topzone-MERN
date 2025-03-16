"use client";

import React, { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";
import { SETTINGS } from "@/config/settings";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";

interface IProduct {
  _id: string;
  product_name: string;
  price: number;
  photos: string[];
  slug: string;
}

const ProductSkeleton = () => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 animate-pulse">
    <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>
    <div className="pt-4">
      <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

const ProductCarousel = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

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
    return (
      <section className="py-8">
        <div className="mx-auto max-w-screen-xl px-4">
          {/* <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Featured Products
          </h2> */}
          <Swiper
            modules={[FreeMode]}
            freeMode={true}
            slidesPerView={4}
            spaceBetween={20}
            grid={{
              rows: 2,
              fill: "row",
            }}
            breakpoints={{
              0: { slidesPerView: 1, grid: { rows: 2 } },
              640: { slidesPerView: 2, grid: { rows: 2 } },
              1024: { slidesPerView: 3, grid: { rows: 2 } },
              1280: { slidesPerView: 4, grid: { rows: 2 } },
            }}
            className="mySwiper"
          >
            {[...Array(8)].map((_, index) => (
              <SwiperSlide key={index}>
                <ProductSkeleton />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="mx-auto max-w-screen-xl px-4">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          Featured Products
        </h2>
        <Swiper
          modules={[FreeMode]}
          freeMode={true}
          slidesPerView={4}
          spaceBetween={20}
          grid={{
            rows: 2,
            fill: "row",
          }}
          breakpoints={{
            0: { slidesPerView: 1, grid: { rows: 2 } },
            640: { slidesPerView: 2, grid: { rows: 2 } },
            1024: { slidesPerView: 3, grid: { rows: 2 } },
            1280: { slidesPerView: 4, grid: { rows: 2 } },
          }}
          className="mySwiper"
        >
          {products.map((product) => (
            <SwiperSlide key={product._id}>
              <div className="bg-white rounded-lg p-4">
                <div className="relative h-40 w-full group mb-4">
                  <Link href={`/products/${product.slug}`}>
                    <Image
                      src={
                        product.photos && product.photos[0]
                          ? `${SETTINGS.URL_IMAGE}/${product.photos[0]}`
                          : "../../../public/image/fallback-image.jpg"
                      }
                      alt={product.product_name}
                      fill
                      className="object-contain rounded-lg transition-transform duration-500 group-hover:scale-110"
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPgZf9JQAAAABJRU5ErkJggg=="
                    />
                  </Link>
                </div>
                <div className="text-center">
                  <div className="h-24 flex flex-col justify-between">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                      <Link href={`/products/${product.slug}`}>
                        {product.product_name}
                      </Link>
                    </h3>
                    <p className="text-xl font-bold text-red-600">
                      {product.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </p>
                  </div>
                  <div className="flex justify-center mt-2 space-x-2">
                    {/* Thêm các tùy chọn màu sắc và dung lượng ở đây */}
                  </div>
                  <div className="flex justify-center mt-4 space-x-2">
                    {/* Thêm các logo thanh toán ở đây */}
                  </div>
                  <div className="flex justify-center mt-4">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      + So sánh
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ProductCarousel;
