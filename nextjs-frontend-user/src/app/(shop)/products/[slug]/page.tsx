"use client";

import { useParams } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { SETTINGS } from "@/config/settings";
import { formatToVND } from "@/helpers/formatPrice";
import { useCartStore } from "@/stores/useCart";
import { AnimatePresence, motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Thumbs } from "swiper/modules";
import { FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";
import { TbShoppingBagPlus } from "react-icons/tb";
import Image from "next/image";
import { Swiper as SwiperType } from "swiper";
import { toast, ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { CheckOutlined } from "@ant-design/icons";

interface IColor {
  color: string;
  price: number;
  stock: number;
  variantImage: string[];
}

interface IVariant {
  storage: string;
  product_name: string;
  colors: IColor[];
}

interface IProduct {
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
  variants: IVariant[];
  product_code?: string;
  rating?: number;
  reviews_count?: number;
  comments_count?: number;
}

interface ISelectedVariant {
  storage: string;
  color: string;
  price: number;
  stock: number;
  variantImage: string[];
}

interface ICartItem extends IProduct {
  quantity: number;
  thumbnail: string;
  selectedVariant: ISelectedVariant;
}

const ProductDetailsPage = () => {
  const params = useParams();
  const { slug } = params;
  const [productData, setProductData] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const addToCart = useCartStore((state) => state.addToCart);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<IColor | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Theo dõi vị trí cuộn
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  useEffect(() => {
    if (
      productData &&
      productData.variants &&
      productData.variants.length > 0
    ) {
      const firstVariant = productData.variants[0];
      setSelectedStorage(firstVariant.storage);
      if (firstVariant.colors && firstVariant.colors.length > 0) {
        setSelectedColor(firstVariant.colors[0]);
      }
    }
  }, [productData]);

  const handleAddToCart = (product: IProduct) => {
    if (!selectedStorage || !selectedColor) {
      toast.error("Vui lòng chọn dung lượng và màu sắc!", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Zoom,
      });
      return;
    }

    addToCart({
      ...product,
      quantity: 1,
      thumbnail: product.photos[0],
      selectedVariant: {
        storage: selectedStorage,
        color: selectedColor.color,
        price: selectedColor.price,
        stock: selectedColor.stock,
        variantImage: selectedColor.variantImage,
      },
    } as ICartItem);

    toast.success("Sản phẩm đã thêm vào giỏ hàng", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Zoom,
    });
  };

  if (loading) {
    return (
      <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
        <div className="min-h-screen bg-gray-50 font-sans relative">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="relative">
                  <Skeleton height={450} className="rounded-xl shadow-lg" />
                </div>
                <div className="flex gap-2">
                  {Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <Skeleton
                        key={index}
                        width={80}
                        height={80}
                        className="rounded-lg"
                      />
                    ))}
                </div>
              </div>

              <div className="space-y-6">
                <Skeleton width={300} height={40} />
                <Skeleton width={200} height={20} />
                <Skeleton width={150} height={30} />
                <Skeleton width={100} height={20} />

                <div>
                  <Skeleton width={100} height={20} />
                  <div className="flex gap-2 mt-2">
                    {Array(3)
                      .fill(0)
                      .map((_, index) => (
                        <Skeleton
                          key={index}
                          width={80}
                          height={40}
                          className="rounded-md"
                        />
                      ))}
                  </div>
                </div>

                <div>
                  <Skeleton width={100} height={20} />
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {Array(4)
                      .fill(0)
                      .map((_, index) => (
                        <Skeleton
                          key={index}
                          width={120}
                          height={40}
                          className="rounded-md"
                        />
                      ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Skeleton width={67} height={67} className="rounded-lg" />
                  <Skeleton width={200} height={67} className="rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  if (!productData || !productData.photos || productData.photos.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        Không tìm thấy sản phẩm hoặc không có hình ảnh
      </div>
    );
  }

  const discountedPrice = productData.price * (1 - productData.discount / 100);
  const selectedVariant = productData.variants.find(
    (variant) => variant.storage === selectedStorage
  );
  const availableColors = selectedVariant ? selectedVariant.colors : [];

  // Hiệu ứng zoom khi xuất hiện, mờ dần + blur khi ẩn đi
  const headerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exit: {
      opacity: 0, // Biến mất ngay lập tức
      y: 0, // Đảm bảo không có dịch chuyển
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      {/* Header sản phẩm (cố định khi cuộn, với hiệu ứng zoom khi xuất hiện và mờ dần + blur khi ẩn đi) */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial="hidden"
            animate={isScrolled ? "visible" : "hidden"}
            exit="exit"
            variants={headerVariants}
            className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 py-3 px-[340px] flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {/* Hình ảnh sản phẩm */}
              {selectedColor?.variantImage &&
              selectedColor.variantImage.length > 0 ? (
                <Image
                  src={`${SETTINGS.URL_IMAGE}/${selectedColor.variantImage[0]}`}
                  alt={productData.product_name}
                  width={40}
                  height={40}
                  className="rounded-sm"
                />
              ) : (
                <Image
                  src={`${SETTINGS.URL_IMAGE}/${productData.photos[0]}`}
                  alt={productData.product_name}
                  width={40}
                  height={40}
                  className="rounded-sm"
                />
              )}
              {/* Tên sản phẩm và giá */}
              <div>
                <h3 className="text-base font-semibold">
                  {productData.product_name} {selectedStorage || ""}{" "}
                  {selectedColor?.color || ""}
                </h3>
                <p className="text-red-500 font-semibold">
                  {formatToVND(
                    selectedColor ? selectedColor.price : discountedPrice
                  )}
                </p>
              </div>
            </div>
            {/* Nút Mua ngay */}
            <button className="bg-red-500 text-white px-4 py-2 rounded-md">
              Mua ngay
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="relative">
              <Swiper
                spaceBetween={10}
                navigation={{
                  nextEl: ".swiper-next",
                  prevEl: ".swiper-prev",
                }}
                thumbs={{ swiper: thumbsSwiper }}
                modules={[Navigation, Thumbs]}
                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                className="rounded-xl"
              >
                {productData.photos.map((img, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative h-[360px] w-full overflow-hidden">
                      <Image
                        src={`${SETTINGS.URL_IMAGE}/${img}`}
                        alt={`${productData.product_name} - ${index}`}
                        width={400}
                        height={300}
                        className="h-full w-full object-contain"
                        quality={100}
                        priority={index === 0}
                      />
                    </div>
                  </SwiperSlide>
                ))}
                <div className="swiper-prev absolute left-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/80 p-3 shadow-md">
                  <FaChevronLeft className="text-gray-600" />
                </div>
                <div className="swiper-next absolute right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/80 p-3 shadow-md hover:bg-white">
                  <FaChevronRight className="text-gray-600" />
                </div>
                <div className="absolute bottom-4 left-4 z-10 rounded bg-black/70 px-2 py-1 text-sm text-white">
                  {activeIndex + 1} / {productData.photos.length}
                </div>
              </Swiper>
            </div>

            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={0}
              slidesPerView={5}
              watchSlidesProgress
              modules={[Thumbs]}
              className="mt-4"
            >
              {productData.photos.map((img, index) => (
                <SwiperSlide key={index}>
                  <Image
                    src={`${SETTINGS.URL_IMAGE}/${img}`}
                    alt={`Thumbnail ${index}`}
                    width={80}
                    height={80}
                    className={`h-20 w-20 cursor-pointer rounded-lg border-2 object-cover transition-all p-2
                      ${activeIndex === index ? "border-black" : "border-gray-400 hover:border-gray-500"}
                    }`}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900">
              {selectedVariant?.product_name || productData?.product_name}
            </h1>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{productData.product_code || "No.00911053"}</span>
              <span className="flex items-center gap-1">
                <FaStar className="text-yellow-400" />
                {productData.rating || 4.4}
              </span>
              <span>{productData.reviews_count || 12} đánh giá</span>
              <span>{productData.comments_count || 321} bình luận</span>
            </div>

            <div className="space-y-2">
              <p className="text-2xl font-bold text-black">
                {formatToVND(
                  selectedColor ? selectedColor.price : discountedPrice
                )}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-lg text-gray-500 line-through">
                  {formatToVND(productData.price)}
                </span>
                <span className="rounded bg-red-100 px-2 py-1 text-sm font-medium text-red-600">
                  -{productData.discount}%
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Dung lượng</h3>
              <div className="flex gap-2 mt-2">
                {productData.variants.map((variant) => (
                  <button
                    key={variant.storage}
                    className={`relative px-4 py-2 rounded-md border ${
                      selectedStorage === variant.storage
                        ? "border-[#101010] text-[#101010] border-2"
                        : "border-gray-300 text-gray-700"
                    }`}
                    onClick={() => {
                      setSelectedStorage(variant.storage);
                      setSelectedColor(variant.colors[0] || null);
                    }}
                  >
                    {variant.storage}
                    {selectedStorage === variant.storage && (
                      <span className="absolute top-0 right-0">
                        <span
                          className="relative block w-5 h-5 bg-[#101010]"
                          style={{
                            clipPath: "polygon(100% 0, 0 0, 100% 100%)",
                          }}
                        >
                          <CheckOutlined
                            style={{
                              position: "absolute",
                              color: "white",
                              fontSize: "9px",
                              bottom: "10px",
                              right: "1px",
                            }}
                          />
                        </span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Màu sắc</h3>
              <div className="flex gap-2 mt-2 flex-wrap">
                {availableColors.map((color) => (
                  <button
                    key={color.color}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-md border ${
                      selectedColor?.color === color.color
                        ? "border-[#101010] text-[#101010] border-2"
                        : "border-gray-300 text-gray-700"
                    }`}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color.variantImage && color.variantImage.length > 0 && (
                      <Image
                        src={`${SETTINGS.URL_IMAGE}/${color.variantImage[0]}`}
                        alt={color.color}
                        width={50}
                        height={50}
                        quality={100}
                        priority
                        className="rounded-sm"
                      />
                    )}
                    <span>{color.color}</span>
                    {selectedColor?.color === color.color && (
                      <span className="absolute top-0 right-0">
                        <span
                          className="relative block w-5 h-5 bg-[#101010]"
                          style={{
                            clipPath: "polygon(100% 0, 0 0, 100% 100%)",
                          }}
                        >
                          <CheckOutlined
                            style={{
                              position: "absolute",
                              color: "white",
                              fontSize: "9px",
                              bottom: "10px",
                              right: "1px",
                            }}
                          />
                        </span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-row items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddToCart(productData)}
                className="flex h-[67px] w-[67px] items-center justify-center rounded-lg border-2 border-[#101010e5] text-[#101010e5] transition-all hover:bg-[#1010101c]"
              >
                <TbShoppingBagPlus className="text-3xl" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 rounded-lg bg-[#101010] px-6 py-3 text-white transition-all hover:bg-[#101010e5]"
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg font-semibold">MUA NGAY</span>
                  <span className="text-xs text-white/80">
                    ( Giao nhanh từ 2 giờ hoặc nhận tại cửa hàng )
                  </span>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ProductDetailsPage;
