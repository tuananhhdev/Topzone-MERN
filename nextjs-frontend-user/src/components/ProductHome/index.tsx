"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay, FreeMode, Grid } from "swiper/modules";
// import "../../styles/ProductHome.css";
import axios from "axios";
import { SETTINGS } from "@/config/settings";
import Image from "next/image";
import { TProduct } from "@/types/modes";
import ProductItem from "@/components/ProductItem";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
const ProductHome = () => {
  const [products, setProducts] = useState<TProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${SETTINGS.URL_API}/v1/products?sort=order&order=ASC`
        );
        const data = await res.json();
        const productsPublic = data.data.products_list.filter(
          (item: { isShowHome: boolean; isBest: boolean }) =>
            item.isShowHome == true && item.isBest == true
        );
        setProducts(productsPublic);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  // const slides = [
  //   {
  //     left: {
  //       image:
  //         "https://fptshop.com.vn/may-tinh-xach-tay/macbook-air-m2-2022-13-inch",
  //       title: "MacBook Air M2",
  //       subtitle: "Chỉ từ 139.000đ/Ngày",
  //       description: "0%/Đ Trả góp",
  //     },
  //   },
  //   {
  //     right: {
  //       image: "https://fptshop.com.vn/tu-lanh",
  //       title: "Tủ lạnh Inverter",
  //       subtitle: "Side By Side 458 lít",
  //       description: "Chỉ từ 9.490 Tr + Giảm đến 32%",
  //     },
  //     left: {
  //       image:
  //         "https://fptshop.com.vn/may-tinh-xach-tay/macbook-air-m2-2022-13-inch",
  //       title: "MacBook Air M2",
  //       subtitle: "Chỉ từ 139.000đ/Ngày",
  //       description: "0%/Đ Trả góp",
  //     },
  //   },
  //   {
  //     right: {
  //       image: "https://fptshop.com.vn/tu-lanh",
  //       title: "Tủ lạnh Inverter",
  //       subtitle: "Side By Side 458 lít",
  //       description: "Chỉ từ 9.490 Tr + Giảm đến 32%",
  //     },
  //   },
  // ];

  const gridItems = [
    { title: "Điện thoại", image: "/images/phone.png", rowSpan: 2 },
    { title: "Laptop", image: "/images/laptop.png" },
    { title: "Tủ lạnh", image: "/images/fridge.png" },
    { title: "Tivi", image: "/images/tv.png", rowSpan: 2 },
    { title: "Điện gia dụng", image: "/images/home-appliances.png" },
    { title: "Máy lọc nước", image: "/images/water-filter.png" },
    { title: "Phụ kiện", image: "/images/accessories.png" },
    { title: "SIM FPT", image: "/images/sim.png" },
  ];

  // Chia dữ liệu thành từng slide
  const chunkSize = 6; // Số lượng ô hiển thị trên mỗi slide
  const slides = Array.from(
    { length: Math.ceil(gridItems.length / chunkSize) },
    (_, i) => gridItems.slice(i * chunkSize, i * chunkSize + chunkSize)
  );

  return (
    <>
      {/* <div className="relative w-full max-w-6xl mx-auto">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          loop
          className="w-full rounded-lg overflow-hidden">
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col items-start justify-center bg-red-100 p-4 rounded-lg">
                  <img
                    src={slide.left?.image}
                    alt={slide.left?.title}
                    className="w-full max-h-48 object-contain mb-4 rounded-md"
                  />
                  <h3 className="text-xl font-bold text-gray-800">
                    {slide.left?.title}
                  </h3>
                  <p className="text-md text-gray-600">
                    {slide.left?.subtitle}
                  </p>
                  <p className="text-lg font-semibold text-red-600">
                    {slide.left?.description}
                  </p>
                </div>

                <div className="flex flex-col items-start justify-center bg-yellow-100 p-4 rounded-lg">
                  <img
                    src={slide.right?.image}
                    alt={slide.right?.title}
                    className="w-full max-h-48 object-contain mb-4 rounded-md"
                  />
                  <h3 className="text-xl font-bold text-gray-800">
                    {slide.right?.title}
                  </h3>
                  <p className="text-md text-gray-600">
                    {slide.right?.subtitle}
                  </p>
                  <p className="text-lg font-semibold text-red-600">
                    {slide.right?.description}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <style jsx>{`
          .swiper-button-next,
          .swiper-button-prev {
            color: black;
          }
          .swiper-pagination-bullet-active {
            background-color: black;
          }
        `}</style>
      </div> */}

<div className="relative w-full max-w-6xl mx-auto">
      <Swiper
        modules={[Grid, Navigation, FreeMode]}
        navigation
        freeMode={true} // Kích hoạt chế độ cuộn tự do
        slidesPerView="auto" // Cho phép điều chỉnh số lượng cột theo chiều ngang
        grid={{
          rows: 2, // Số hàng hiển thị
          fill: "row", // Lấp đầy theo hàng
        }}
        spaceBetween={16} // Khoảng cách giữa các item
        className="w-full"
      >
        {gridItems.map((item, index) => (
          <SwiperSlide
            key={index}
            className={`${
              item.rowSpan === 2 ? "row-span-2 h-[200px]" : "h-[100px]"
            }`}
            style={{ width: "200px" }} // Chiều rộng mỗi ô (cột)
          >
            <div
              className={`flex flex-col items-center justify-center bg-white rounded-lg p-4 shadow-sm hover:shadow-lg transition`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-20 h-20 object-contain mb-2"
              />
              <p className="text-sm font-medium text-gray-700">{item.title}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <style jsx>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: black;
        }
      `}</style>
    </div>
    </>
  );
};

export default ProductHome;
