"use client";

import { useParams } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { SETTINGS } from "@/config/settings";
import { formatToVND } from "@/helpers/formatPrice";
import "react-loading-skeleton/dist/skeleton.css";
import { useCartStore } from "@/stores/useCart";
import { motion } from "framer-motion";
import CheckIcon from "@mui/icons-material/Check";
import "@/styles/product_detail.css";
import Breadcrumb from "@/components/Breadcumb";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Thumbs } from "swiper/modules";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa6";
import { TbShoppingBagPlus } from "react-icons/tb";
interface TProduct {
  _id: string;
  product_name: string;
  price: number;
  discount: number;
  photos: string[];
  description: string;
  slug: string;
  category: {
    _id: string;
    category_name: string;
    slug: string;
  };
}

const ProductDetailsPage = () => {
  const params = useParams();
  const { slug } = params;
  const [productData, setProductData] = useState<TProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);
  const [clickedProductId, setClickedProductId] = useState<string | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slug) {
      const fetchProduct = async () => {
        try {
          const response = await axios.get(
            `${SETTINGS.URL_API}/v1/products/slug/${slug}`
          );
          setProductData(response.data?.data);
          setLoading(false);
        } catch (error) {
          console.error("Failed to fetch product:", error);
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [slug]);

  const handleAddToCart = (product: TProduct) => {
    addToCart({ ...product, quantity: 1, thumbnail: product.photos[0] });
    setClickedProductId(product._id);
    setTimeout(() => {
      setClickedProductId(null);
    }, 500);
  };

  if (!productData) return <p>Loading product...</p>;

  return (
    <div className="product-details font-sans mt-10 p-8 mx-auto max-w-7xl">
      <Breadcrumb
        categoryName={productData.category.category_name}
        categorySlug={productData.category.slug}
        productName={productData.product_name}
      />
      <div className="flex flex-col lg:flex-row gap-8 p-8">
        <div className="flex flex-col items-center w-full lg:w-2/5 p-8">
          {/* Swiper cho hình ảnh chính */}
          <div className="relative w-full flex justify-center p-4">
            <Swiper
              spaceBetween={10}
              navigation={{
                nextEl: ".custom-swiper-button-next-large",
                prevEl: ".custom-swiper-button-prev-large",
              }}
              thumbs={{ swiper: thumbsSwiper }}
              modules={[Navigation, Thumbs]}
              className="w-[70%] max-w-[500px]"
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            >
              {productData.photos.map((img, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={`${SETTINGS.URL_IMAGE}/${img}`}
                    alt={`Product Image ${index}`}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Hiển thị số lượng hình ảnh đã click */}
            <div className="absolute top-[18rem] left-4   bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
              {activeIndex + 1} / {productData.photos.length}
            </div>

            {/* Nút Prev */}
            {/* Nút Prev */}
            <div className="custom-swiper-button-prev-large absolute bg-[#090d1466] text-white left-[-60px] top-1/2 transform -translate-y-1/2 p-3 rounded-full shadow-lg cursor-pointer z-10">
              <FaChevronLeft />
            </div>

            {/* Nút Next */}
            <div className="custom-swiper-button-next-large absolute bg-[#090d1466] text-white right-[-60px] top-1/2 transform -translate-y-1/2  p-3 rounded-full shadow-lg cursor-pointer z-10">
              <FaChevronRight />
            </div>
          </div>

          {/* Swiper cho hình ảnh thu nhỏ với button next/prev */}
          <div className="relative w-full mt-12">
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView={5}
              watchSlidesProgress
              modules={[Thumbs, Navigation]}
              navigation={{
                nextEl: ".custom-swiper-button-next-small",
                prevEl: ".custom-swiper-button-prev-small",
              }}
              className="w-full"
            >
              {productData.photos.map((img, index) => (
                <SwiperSlide key={index} onClick={() => setActiveIndex(index)}>
                  <img
                    src={`${SETTINGS.URL_IMAGE}/${img}`}
                    alt={`Thumbnail ${index}`}
                    className={`w-[80px] h-[80px] object-contain rounded-md cursor-pointer transition-all border-2 ${
                      activeIndex === index
                        ? "border-black"
                        : "border-transparent hover:border-gray-400"
                    }`}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Nút prev/next cho Swiper nhỏ */}
            {/* Nút prev/next cho Swiper nhỏ */}
            <div className="custom-swiper-button-prev-small absolute left-[-60px] top-1/2 transform -translate-y-1/2 p-3 rounded-full shadow-lg cursor-pointer z-10">
              <FaChevronLeft />
            </div>
            <div className="custom-swiper-button-next-small absolute right-[-60px] top-1/2 transform -translate-y-1/2  p-3 rounded-full shadow-lg cursor-pointer z-10">
              <FaChevronRight />
            </div>
          </div>
        </div>
        {/* Thông tin sản phẩm */}
        <div className=" w-full lg:w-3/5 p-4 ml-20">
          <h2 className="text-[30px] font-semibold text-gray-800">
            {productData.product_name}
          </h2>
          <p className="text-2xl font-semibold mt-2">
            {formatToVND(productData.price * (1 - productData.discount / 100))}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="line-through text-gray-500 text-sm ">
              {formatToVND(productData.price)}
            </span>
            <span className="text-red-600 text-sm font-semibold">
              {productData.discount}%
            </span>
          </div>
          <p className="mt-4 text-gray-600">{productData.description}</p>

          <div className="flex gap-3 mt-8">
            <motion.button
              type="button"
              className="p-3 border border-red-600 text-rose-600 text-2xl rounded-md flex items-center justify-center hover:bg-red-100 transition"
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddToCart(productData)}
            >
              {/* {clickedProductId === productData._id ? (
                <div className="flex items-center justify-center">
                  <CheckIcon className="mr-2" />
                  Đã thêm
                </div>
              ) : (
                "Thêm vào giỏ hàng"
              )} */}
              <TbShoppingBagPlus />
            </motion.button>

            <button className="px-5 py-3 bg-red-500 text-white font-semibold  rounded-md hover:bg-red-700 transition">
              Mua ngay
            </button>

            {/* Nút Trả Góp */}
            <button className="px-5 py-3 bg-black text-white font-semibold rounded-md hover:bg-gray-900 transition">
              Trả góp
              <p className="text-xs text-gray-300">(Chỉ từ 2.011.167 đ)</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
