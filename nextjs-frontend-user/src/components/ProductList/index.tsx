"use client";

import React, { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";
import { SETTINGS } from "@/config/settings";
import Link from "next/link";

interface IProduct {
  _id: string;
  product_name: string;
  price: number;
  photos: string[];
  slug: string;
}

const ProductSkeleton = () => (
  <div className="bg-white rounded-lg p-4 shadow-lg animate-pulse">
    <div className="h-40 w-full bg-gray-300 rounded-md"></div>
    <div className="mt-4 h-5 w-3/4 bg-gray-300 rounded"></div>
    <div className="mt-2 h-6 w-1/2 bg-gray-300 rounded"></div>
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

  return (
    <section className="py-8 bg-gray-100">
      <div className="max-w-screen-xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 text-center">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {loading
            ? [...Array(4)].map((_, index) => <ProductSkeleton key={index} />)
            : products.slice(0, 4).map((product) => (
                <div key={product._id} className="bg-white p-4 rounded-lg shadow-lg">
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="relative h-40 w-full group">
                      <Image
                        src={
                          product.photos && product.photos[0]
                            ? `${SETTINGS.URL_IMAGE}/${product.photos[0]}`
                            : "/image/fallback-image.jpg"
                        }
                        alt={product.product_name}
                        fill
                        className="object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                  <h3 className="mt-4 text-lg font-semibold text-gray-800">
                    <Link href={`/products/${product.slug}`}>{product.product_name}</Link>
                  </h3>
                  <p className="text-xl font-bold text-red-600">
                    {product.price.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      + So sánh
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
