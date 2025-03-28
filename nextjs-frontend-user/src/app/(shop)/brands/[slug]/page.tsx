"use client";

import { useParams } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { SETTINGS } from "@/config/settings";
import Image from "next/image";
import Link from "next/link";
import { formatToVND } from "@/helpers/formatPrice";
import "react-loading-skeleton/dist/skeleton.css";
import { useCartStore } from "@/stores/useCart";
import { motion } from "framer-motion";
import CheckIcon from "@mui/icons-material/Check";

interface TProduct {
  _id: string;
  product_name: string;
  price: number;
  discount: number;
  photos: string[];
  slug: string;
  brand: {
    _id: string;
    brand_name: string;
    slug: string;
  };
  category: {
    _id: string;
    category_name: string;
    slug: string;
  };
}

const BrandPage = () => {
  const params = useParams();
  const slug = params.slug; // Lấy slug từ params
  const [products, setProducts] = useState<TProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);
  const [clickedProductId, setClickedProductId] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchBrand = async () => {
        try {
          const response = await axios.get(`${SETTINGS.URL_API}/v1/products/brand/${slug}`);
          console.log("API Response:", response.data); // Kiểm tra phản hồi từ API
          setProducts(response.data?.data.products_list);
          setLoading(false);
        } catch (error) {
          console.error("Failed to fetch brand:", error);
          setLoading(false);
        }
      };

      fetchBrand();
    }
  }, [slug]);

  const handleAddToCart = (product: TProduct) => {
    const productToAdd = {
      ...product,
      category: product.category || { _id: "", category_name: "", slug: "" }, // Đảm bảo rằng category tồn tại
      quantity: 1,
      thumbnail: product.photos[0]
    };
    
    addToCart(productToAdd);
    setClickedProductId(product._id);
    setTimeout(() => {
      setClickedProductId(null);
    }, 2000); // Reset after 2 seconds
  };

  // if (loading) {
  //   return (
  //     <div className="font-sans mt-10 p-4 mx-auto lg:max-w-6xl md:max-w-4xl">
  //       <Skeleton height={40} width={300} className="mb-6 sm:mb-10" />
  //       <div className="flex justify-between items-center mb-4">
  //         <Skeleton width={200} height={20} />
  //         <div className="flex items-center">
  //           <Skeleton width={100} height={20} className="mr-2" />
  //           <Skeleton width={150} height={20} />
  //         </div>
  //       </div>
  //       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
  //         {Array(8)
  //           .fill(0)
  //           .map((_, index) => (
  //             <div
  //               key={index}
  //               className="bg-white flex flex-col rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-black transition-all max-w-full mx-auto"
  //             >
  //               <div className="w-full overflow-hidden">
  //                 <Skeleton height={307} />
  //               </div>
  //               <div className="p-4 flex-1 flex flex-col">
  //                 <div className="flex-1">
  //                   <Skeleton width={`80%`} height={20} />
  //                   <div className="mt-2 flex items-center flex-wrap gap-2">
  //                     <Skeleton width={`60%`} height={20} />
  //                     <Skeleton width={`40%`} height={20} />
  //                   </div>
  //                 </div>
  //                 <Skeleton width={`100%`} height={40} />
  //               </div>
  //             </div>
  //           ))}
  //       </div>
  //     </div>
  //   );
  // }

  // if (!products.length) return <p>Brand on updating...</p>;

  return (
    <div className="mx-auto mt-10 p-4 font-sans md:max-w-4xl lg:max-w-6xl">
      <h2 className="my-5 text-3xl font-semibold text-[#090D14] sm:mb-10 sm:text-3xl">
        {products[0]?.brand?.brand_name}
      </h2>
      <div className="mb-6 ml-1 flex items-center justify-between">
        <p className="mr-2">
          Tìm thấy <span className="font-bold">{products.length}</span> kết quả
        </p>
        <div className="flex items-center">
          <label htmlFor="sort" className="mr-2 font-medium text-[#6B7280]">
            Sắp xếp theo :
          </label>
          <select
            id="sort"
            // value={sortOption}
            // onChange={handleSortChange}
            className="rounded border border-gray-300 p-1"
          >
            <option value="featured">Nổi bật</option>
            <option value="lowest">Giá thấp nhất</option>
            <option value="highest">Giá cao nhất</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="mx-auto flex cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg"
          >
            <Link href={`/products/${product.slug}`}>
              <div className="w-full overflow-hidden">
                {/* {product.photos.length > 0 ? (
                  product.photos.map((photo) => {
                    return (
                      <Image
                        key={photo}
                        src={`${SETTINGS.URL_IMAGE}/${photo[0]}`}
                        alt={product.product_name}
                        className="w-full object-contain mt-5 transform hover:scale-105 transition-transform duration-300"
                        width={200}
                        height={307}
                        priority
                      />
                    );
                  })
                ) : (
                  <Image
                    style={{
                      width: "100%",
                      height: "250px",
                      objectFit: "contain",
                    }}
                    src="/images/noimage.jpg"
                    alt="No Image"
                    width={200}
                    height={300}
                  />
                )} */}
                <Image
                  src={`${SETTINGS.URL_IMAGE}/${product.photos[0]}`}
                  alt={product.product_name}
                  className="mt-5 w-full transform object-contain transition-transform duration-300 hover:scale-105"
                  width={200}
                  height={307}
                  priority
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex-1">
                  <h5 className="line-clamp-2 text-sm font-bold text-gray-800 sm:text-base">
                    {product.product_name}
                  </h5>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <h6 className="text-sm font-bold text-gray-800 sm:text-base">
                      {formatToVND(product.price * (1 - product.discount / 100))}
                    </h6>
                    {product.discount > 0 && (
                      <p className="text-sm text-gray-400 line-through">
                        {formatToVND(product.price)}
                      </p>
                    )}
                    <div
                      className="ml-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-100"
                      title="Wishlist"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16px"
                        className="inline-block fill-gray-800"
                        viewBox="0 0 64 64"
                      >
                        <path
                          d="M45.5 4A18.53 18.53 0 0 0 32 9.86 18.5 18.5 0 0 0 0 22.5C0 40.92 29.71 59 31 59.71a2 2 0 0 0 2.06 0C34.29 59 64 40.92 64 22.5A18.52 18.52 0 0 0 45.5 4ZM32 55.64C26.83 52.34 4 36.92 4 22.5a14.5 14.5 0 0 1 26.36-8.33 2 2 0 0 0 3.27 0A14.5 14.5 0 0 1 60 22.5c0 14.41-22.83 29.83-28 33.14Z"
                          data-original="#000000"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <motion.button
                  type="button"
                  className="ml-auto mt-4 h-9 w-full rounded border-none bg-[#212121] px-2 font-semibold tracking-wide text-white outline-none transition duration-300 hover:bg-[#212121]/75"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAddToCart(product)}
                >
                  {clickedProductId === product._id ? (
                    <div className="flex items-center justify-center">
                      <CheckIcon className="mr-2" />
                      Đã thêm
                    </div>
                  ) : (
                    "Thêm vào giỏ hàng"
                  )}
                </motion.button>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandPage;
