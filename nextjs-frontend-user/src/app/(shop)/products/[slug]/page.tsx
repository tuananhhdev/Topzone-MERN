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
          const response = await axios.get(`${SETTINGS.URL_API}/v1/products/slug/${slug}`);
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
    <div className="product-details mx-auto mt-10 max-w-7xl p-8 font-sans">
      <Breadcrumb
        categoryName={productData.category.category_name}
        categorySlug={productData.category.slug}
        productName={productData.product_name}
      />
      <div className="flex flex-col gap-8 p-8 lg:flex-row">
        <div className="flex w-full flex-col items-center p-8 lg:w-2/5">
          {/* Swiper cho hình ảnh chính */}
          <div className="relative flex w-full justify-center p-4">
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
                    className="h-full w-full rounded-lg object-contain"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Hiển thị số lượng hình ảnh đã click */}
            <div className="absolute left-4 top-[18rem] rounded-lg bg-black/50 px-3 py-1 text-sm text-white">
              {activeIndex + 1} / {productData.photos.length}
            </div>

            {/* Nút Prev */}
            {/* Nút Prev */}
            <div className="custom-swiper-button-prev-large absolute left-[-60px] top-1/2 z-10 -translate-y-1/2 transform cursor-pointer rounded-full bg-[#090d1466] p-3 text-white shadow-lg">
              <FaChevronLeft />
            </div>

            {/* Nút Next */}
            <div className="custom-swiper-button-next-large absolute right-[-60px] top-1/2 z-10 -translate-y-1/2 transform cursor-pointer rounded-full bg-[#090d1466] p-3 text-white shadow-lg">
              <FaChevronRight />
            </div>
          </div>

          {/* Swiper cho hình ảnh thu nhỏ với button next/prev */}
          <div className="relative mt-12 w-full">
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
                    className={`h-[80px] w-[80px] cursor-pointer rounded-md border-2 object-contain transition-all ${
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
            <div className="custom-swiper-button-prev-small absolute left-[-60px] top-1/2 z-10 -translate-y-1/2 transform cursor-pointer rounded-full p-3 shadow-lg">
              <FaChevronLeft />
            </div>
            <div className="custom-swiper-button-next-small absolute right-[-60px] top-1/2 z-10 -translate-y-1/2 transform cursor-pointer rounded-full p-3 shadow-lg">
              <FaChevronRight />
            </div>
          </div>
        </div>
        {/* Thông tin sản phẩm */}
        <div className="ml-20 w-full p-4 lg:w-3/5">
          <h2 className="text-[30px] font-semibold text-gray-800">{productData.product_name}</h2>
          <p className="mt-2 text-2xl font-semibold">
            {formatToVND(productData.price * (1 - productData.discount / 100))}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-gray-500 line-through">
              {formatToVND(productData.price)}
            </span>
            <span className="text-sm font-semibold text-red-600">{productData.discount}%</span>
          </div>
          <p className="mt-4 text-gray-600">{productData.description}</p>

          <div className="mt-8 flex gap-3">
            <motion.button
              type="button"
              className="flex items-center justify-center rounded-md border border-red-600 p-3 text-2xl text-rose-600 transition hover:bg-red-100"
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

            <button className="rounded-md bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-700">
              Mua ngay
            </button>

            {/* Nút Trả Góp */}
            <button className="rounded-md bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-900">
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
