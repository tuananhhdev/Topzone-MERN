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

// Component con để hiển thị từng sản phẩm
const ProductItem = ({ product }: { product: IProduct }) => {
  const [imgSrc, setImgSrc] = useState(
    product.photos && product.photos[0]
      ? `${SETTINGS.URL_IMAGE}/${product.photos[0]}`
      : "/fallback-image.jpg"
  );

  return (
    <div className="rounded-lg bg-white p-4">
      <div className="group relative mb-4 h-40 w-full">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={imgSrc}
            alt={product.product_name}
            fill
            className="rounded-lg object-contain transition-transform duration-500 group-hover:scale-110"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPgZf9JQAAAABJRU5ErkJggg=="
            onError={() => setImgSrc("/fallback-image.jpg")}
          />
        </Link>
      </div>
      <div className="text-center">
        <div className="flex h-24 flex-col justify-between">
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold">
            <Link href={`/products/${product.slug}`}>{product.product_name}</Link>
          </h3>
          <p className="text-xl font-bold text-red-600">
            {product.price.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </p>
        </div>
        <div className="mt-2 flex justify-center space-x-2">
          {/* Thêm các tùy chọn màu sắc và dung lượng ở đây */}
        </div>
        <div className="mt-4 flex justify-center space-x-2">
          {/* Thêm các logo thanh toán ở đây */}
        </div>
        <div className="mt-4 flex justify-center">
          <button className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
            + So sánh
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductSkeleton = () => (
  <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="h-40 w-full rounded-md bg-gray-200 dark:bg-gray-700"></div>
    <div className="pt-4">
      <div className="mb-2 h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mb-2 h-6 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-8 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
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
              <ProductItem product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ProductCarousel;
