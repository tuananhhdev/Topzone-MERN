"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { SETTINGS } from "@/config/settings";
import Image from "next/image";
import Link from "next/link";
import { formatToVND } from "@/helpers/formatPrice";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useCartStore } from "@/stores/useCart";
import { motion, AnimatePresence } from "framer-motion";
import BrandSwiper from "@/components/BrandSwiper";
import Breadcrumb from "@/components/Breadcumb";
import ProductFilter, { FilterState } from "@/components/ProductFilter";

interface TProduct {
  _id: string;
  product_name: string;
  price: number;
  discount: number;
  photos: string[];
  slug: string;
  category: {
    _id: string;
    category_name: string;
    slug: string;
  };
  pagination: {
    totalRecords: number;
  };
}

interface Brand {
  _id: string;
  brand_name: string;
  slug: string;
}

const CategoryPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug;
  const productContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<number>(0);
  const [products, setProducts] = useState<TProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showBrands, setShowBrands] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandProductCount, setBrandProductCount] = useState<number>(0);
  const ITEMS_PER_PAGE = 12; // Số sản phẩm trên mỗi trang
  const addToCart = useCartStore((state) => state.addToCart);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: "all",
    priceMin: 0,
    priceMax: 0,
    os: [],
    storage: [],
    connection: [],
    battery: "all",
  });
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  // Initialize sortBy from URL
  useEffect(() => {
    const sortParam = searchParams.get("sort");
    if (sortParam) {
      setSortBy(sortParam);
    }
  }, [searchParams]);

  // Update URL when sort changes
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    router.push(`?${params.toString()}`);
  };

  const hasMoreProducts = products.length < totalRecords;

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(
          `${SETTINGS.URL_API}/v1/brands?page=1&limit=200`
        );
        setBrands(response.data?.data.brands_list || []);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      }
    };
    fetchBrands();
  }, []);

  // Fetch products count by brand
  const fetchProductCountByBrand = async (brandSlug: string) => {
    try {
      const response = await axios.get(
        `${SETTINGS.URL_API}/v1/products/brand/${brandSlug}?categories=${slug}`
      );
      setBrandProductCount(response.data?.data.pagination?.totalRecords || 0);
    } catch (error) {
      console.error("Failed to fetch product count:", error);
    }
  };

  // Update product count when brand selection changes
  useEffect(() => {
    if (selectedBrand) {
      const selectedBrandData = brands.find(
        (b) => b.brand_name === selectedBrand
      );
      if (selectedBrandData) {
        fetchProductCountByBrand(selectedBrandData.slug);
      }
    } else {
      setBrandProductCount(0);
    }
  }, [selectedBrand, brands]);

  // Function to maintain scroll position
  const maintainScroll = (callback: () => void) => {
    // Store current scroll position
    scrollRef.current = window.scrollY;

    // Execute the callback
    callback();

    // Restore scroll position after a short delay to allow for DOM updates
    requestAnimationFrame(() => {
      window.scrollTo({
        top: scrollRef.current,
        behavior: "instant",
      });
    });
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Construct base URL with pagination
      const baseUrl = new URL(
        `${SETTINGS.URL_API}/v1/products/category/${slug as string}`
      );
      baseUrl.searchParams.append("page", String(currentPage));
      baseUrl.searchParams.append("limit", String(ITEMS_PER_PAGE));

      // Add brand filter if selected
      if (filters.os.length > 0) {
        const selectedBrandData = brands.find(
          (b) => b.brand_name === filters.os[0]
        );
        if (selectedBrandData) {
          baseUrl.pathname = `/v1/products/brand/${selectedBrandData.slug}`;
          baseUrl.searchParams.append("categories", slug as string);
        }
      }

      // Add sort parameters only for price sorting
      if (sortBy === "gia-thap-den-cao") {
        baseUrl.searchParams.append("sort", "price");
        baseUrl.searchParams.append("order", "ASC");
      } else if (sortBy === "gia-cao-den-thap") {
        baseUrl.searchParams.append("sort", "price");
        baseUrl.searchParams.append("order", "DESC");
      } else if (sortBy === "noi-bat") {
        // For "Nổi bật", sort by createdAt in descending order (newest first)
        baseUrl.searchParams.append("sort", "createdAt");
        baseUrl.searchParams.append("order", "DESC");
      }

      console.log("Fetching products with URL:", baseUrl.toString());

      const response = await axios.get(baseUrl.toString());
      console.log("Response data:", response.data);

      if (currentPage === 1) {
        setProducts(response.data?.data.products_list || []);
      } else {
        setProducts((prev) => [
          ...prev,
          ...(response.data?.data.products_list || []),
        ]);
      }
      setTotalRecords(response.data?.data.pagination?.totalRecords || 0);
      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (slug) {
      setCurrentPage(1);
      fetchProducts();
    }
  }, [slug, filters.os, sortBy]);

  useEffect(() => {
    if (slug && currentPage > 1) {
      fetchProducts();
    }
  }, [currentPage]);

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleAddToCart = (product: TProduct) => {
    addToCart({
      ...product,
      quantity: 1,
      thumbnail: product.photos[0],
    });
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSort(false);
      }
      if (
        brandRef.current &&
        !brandRef.current.contains(event.target as Node)
      ) {
        setShowBrands(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="font-sans mt-10 p-4 mx-auto lg:max-w-6xl md:max-w-4xl">
        {/* Skeleton for Breadcrumb */}
        <Skeleton height={24} width={200} className="mb-4" />

        {/* Skeleton for Category Title */}
        <Skeleton height={48} width={300} className="mb-4" />

        {/* Skeleton for Brand Swiper */}
        <Skeleton height={100} className="mb-6" />

        <div className="flex gap-4">
          {/* Skeleton for Filter Sidebar */}
          <div className="hidden md:block w-[250px]">
            <div className="space-y-6">
              {/* Price Filter Skeleton */}
              <div>
                <Skeleton height={24} width={120} className="mb-3" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} height={20} />
                  ))}
                </div>
              </div>

              {/* OS Filter Skeleton */}
              <div>
                <Skeleton height={24} width={140} className="mb-3" />
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} height={20} />
                  ))}
                </div>
              </div>

              {/* Storage Filter Skeleton */}
              <div>
                <Skeleton height={24} width={130} className="mb-3" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height={20} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1">
            {/* Quick Filter Skeleton */}
            <div className="mb-4">
              <div className="flex gap-2">
                <Skeleton height={32} width={150} className="rounded-full" />
                <Skeleton height={32} width={100} className="rounded-full" />
              </div>
            </div>

            {/* Product Grid Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
              {Array(9)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="bg-white flex flex-col rounded-lg overflow-hidden shadow"
                  >
                    {/* Product Image Skeleton */}
                    <div className="relative w-full p-4">
                      <Skeleton height={200} className="rounded-lg" />
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      {/* Product Title Skeleton */}
                      <Skeleton height={24} width="80%" className="mb-3" />

                      {/* Specifications Skeleton */}
                      <div className="space-y-2 mb-3">
                        <div className="flex gap-2">
                          <Skeleton height={24} width={80} />
                          <Skeleton height={24} width={80} />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton height={24} width={90} />
                          <Skeleton height={24} width={70} />
                        </div>
                      </div>

                      {/* Price Skeleton */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          <Skeleton height={28} width={120} />
                          <Skeleton height={20} width={80} />
                        </div>
                      </div>

                      {/* Storage Options Skeleton */}
                      <div className="flex gap-2 mb-3">
                        <Skeleton height={32} width={70} />
                        <Skeleton height={32} width={70} />
                        <Skeleton height={32} width={70} />
                      </div>

                      {/* Installment Payment Skeleton */}
                      <div className="flex items-center gap-2 mb-3">
                        <Skeleton height={20} width={60} />
                        <div className="flex gap-1">
                          <Skeleton height={24} width={24} />
                          <Skeleton height={24} width={24} />
                        </div>
                      </div>

                      {/* Add to Cart Button Skeleton */}
                      <Skeleton height={40} className="w-full" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans mt-6 p-4 mx-auto lg:max-w-6xl md:max-w-4xl">
      <Breadcrumb
        categoryName={products[0]?.category?.category_name || "Danh mục"}
        categorySlug={products[0]?.category?.slug}
      />

      <h2 className="text-3xl font-semibold text-white mb-2">
        {products[0]?.category?.category_name}
      </h2>
      <BrandSwiper />

      <div className="flex gap-4 mt-4">
        {/* Filter Sidebar */}
        <div className="hidden md:block relative">
          <ProductFilter
            onFilterChange={handleFilterChange}
            currentFilters={filters}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <p className="text-white">
              Tìm thấy <span className="font-bold">{totalRecords}</span> kết quả
            </p>
            <div className="flex items-center gap-2">
              <label className="text-white font-medium">Sắp xếp theo:</label>
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="border border-gray-300 rounded-lg p-2 bg-white text-gray-700 cursor-pointer hover:border-gray-400 focus:outline-none focus:border-gray-400 transition-all duration-200 min-w-[180px] text-base flex justify-between items-center"
                >
                  <span className={!sortBy ? "text-gray-400" : ""}>
                    {sortBy === "noi-bat"
                      ? "Nổi bật"
                      : sortBy === "gia-thap-den-cao"
                      ? "Giá thấp đến cao"
                      : sortBy === "gia-cao-den-thap"
                      ? "Giá cao đến thấp"
                      : "Chọn kiểu sắp xếp"}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showSort ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>

                <AnimatePresence>
                  {showSort && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full left-0 w-[180px] mt-3.5 bg-white border border-gray-200 shadow-lg rounded-lg z-50"
                    >
                      <motion.div
                        className="py-2 px-3 hover:bg-gray-200 duration-150 cursor-pointer text-base transition-colors first:rounded-t-lg text-gray-400"
                        whileHover={{ backgroundColor: "#E5E7EB" }}
                        onClick={() => {
                          maintainScroll(() => {
                            handleSortChange("");
                            setSortBy("");
                            setCurrentPage(1);
                            setShowSort(false);
                          });
                        }}
                      >
                        Chọn kiểu sắp xếp
                      </motion.div>
                      <motion.div
                        className="py-2 px-3 hover:bg-gray-200 duration-150 cursor-pointer text-base transition-colors flex items-center"
                        whileHover={{ backgroundColor: "#E5E7EB" }}
                        onClick={() => {
                          maintainScroll(() => {
                            handleSortChange("noi-bat");
                            setSortBy("noi-bat");
                            setCurrentPage(1);
                            setShowSort(false);
                          });
                        }}
                      >
                        Nổi bật
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="#EAB308"
                          className="w-4 h-4 ml-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                          />
                        </svg>
                      </motion.div>
                      <motion.div
                        className="py-2 px-3 hover:bg-gray-200 duration-150 cursor-pointer text-base transition-colors flex items-center"
                        whileHover={{ backgroundColor: "#E5E7EB" }}
                        onClick={() => {
                          maintainScroll(() => {
                            handleSortChange("gia-thap-den-cao");
                            setSortBy("gia-thap-den-cao");
                            setCurrentPage(1);
                            setShowSort(false);
                          });
                        }}
                      >
                        Giá thấp đến cao
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="#22C55E"
                          className="w-4 h-4 ml-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18"
                          />
                        </svg>
                      </motion.div>
                      <motion.div
                        className="py-2 px-3 hover:bg-gray-200 duration-150 cursor-pointer text-base transition-colors flex items-center"
                        whileHover={{ backgroundColor: "#E5E7EB" }}
                        onClick={() => {
                          maintainScroll(() => {
                            handleSortChange("gia-cao-den-thap");
                            setSortBy("gia-cao-den-thap");
                            setCurrentPage(1);
                            setShowSort(false);
                          });
                        }}
                      >
                        Giá cao đến thấp
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="#EF4444"
                          className="w-4 h-4 ml-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3"
                          />
                        </svg>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Quick Manufacturer Filter */}
          <div className="mb-4 relative" ref={brandRef}>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowBrands(!showBrands)}
                className="px-3 py-1.5 bg-white rounded-full text-sm hover:bg-gray-100 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <span>Lọc nhanh :</span>
                <span className="font-medium">Hãng sản xuất</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showBrands ? "rotate-180" : ""
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
              {filters.os.map((brand) => (
                <button
                  key={brand}
                  onClick={() => {
                    const newOs = filters.os.filter((item) => item !== brand);
                    handleFilterChange({ ...filters, os: newOs });
                  }}
                  className="px-3 py-1.5 bg-white rounded-full text-sm hover:bg-gray-100 transition-colors flex items-center gap-1"
                >
                  {brand}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              ))}
              {filters.os.length > 0 && (
                <button
                  onClick={() => {
                    maintainScroll(() => {
                      handleFilterChange({ ...filters, os: [] });
                      setSelectedBrand("");
                      setBrandProductCount(0);
                      setShowBrands(false);
                    });
                  }}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm hover:bg-red-100 transition-colors flex items-center gap-1"
                >
                  Xóa tất cả
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Brand Selection Modal */}
            <AnimatePresence>
              {showBrands && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-0 top-full mt-4 w-[400px] bg-white rounded-lg shadow-lg z-20"
                >
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-2">
                      {brands.map((brand) => (
                        <button
                          key={brand._id}
                          onClick={() => {
                            setSelectedBrand(
                              selectedBrand === brand.brand_name
                                ? ""
                                : brand.brand_name
                            );
                          }}
                          className={`px-6 py-3 text-xs border rounded-lg whitespace-nowrap flex items-center justify-center ${
                            selectedBrand === brand.brand_name
                              ? "border-red-500 text-red-500 bg-red-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {brand.brand_name}
                        </button>
                      ))}
                    </div>
                    {selectedBrand && (
                      <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <button
                          onClick={() => {
                            maintainScroll(() => {
                              setSelectedBrand("");
                              setBrandProductCount(0);
                              setShowBrands(false);
                            });
                          }}
                          className="px-4 py-2 text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Bỏ chọn
                        </button>
                        <button
                          onClick={() => {
                            maintainScroll(() => {
                              const selectedBrandData = brands.find(
                                (b) => b.brand_name === selectedBrand
                              );
                              if (selectedBrandData) {
                                handleFilterChange({
                                  ...filters,
                                  os: [selectedBrandData.brand_name],
                                });
                                setShowBrands(false);
                                setCurrentPage(1);
                                fetchProducts();
                              }
                            });
                          }}
                          className="min-w-[120px] px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                        >
                          Xem {brandProductCount} kết quả
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div
            ref={productContainerRef}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3"
          >
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white flex flex-col rounded-lg overflow-hidden shadow hover:shadow-lg transition-all duration-300"
              >
                <Link href={`/products/${product.slug}`} className="relative">
                  <div className="absolute top-2 left-2 z-10">
                    {product.discount > 0 && (
                      <span className="bg-red-500 text-white text-sm font-medium px-2 py-1 rounded">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  <div className="w-full p-4">
                    <Image
                      src={`${SETTINGS.URL_IMAGE}/${product.photos[0]}`}
                      alt={product.product_name}
                      className="w-full h-[200px] object-contain transform hover:scale-105 transition-transform duration-300"
                      width={200}
                      height={200}
                      priority
                    />
                  </div>
                </Link>

                <div className="p-4 flex-1 flex flex-col">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                      {product.product_name}
                    </h3>
                  </Link>

                  {/* Specifications */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Màn hình 6.7&quot;
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        RAM 8GB
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Pin 5000mAh
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Chip A16
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-red-600">
                        {formatToVND(
                          product.price * (1 - product.discount / 100)
                        )}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatToVND(product.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Storage Options */}
                  <div className="flex gap-2 mb-3">
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium hover:border-blue-500 hover:text-blue-500 transition-colors">
                      128GB
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium hover:border-blue-500 hover:text-blue-500 transition-colors">
                      256GB
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium hover:border-blue-500 hover:text-blue-500 transition-colors">
                      512GB
                    </button>
                  </div>

                  {/* Installment Payment */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-600">Trả góp 0%</span>
                    <div className="flex gap-1">
                      <Image
                        src="/bank-logos/ncb.png"
                        alt="NCB"
                        width={24}
                        height={24}
                        className="h-6"
                      />
                      <Image
                        src="/bank-logos/home.png"
                        alt="Home Credit"
                        width={24}
                        height={24}
                        className="h-6"
                      />
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <motion.button
                    type="button"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddToCart(product)}
                  >
                    Thêm vào giỏ hàng
                  </motion.button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMoreProducts && (
            <div className="flex justify-center mt-8 mb-6">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loadingMore ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Đang tải...</span>
                  </>
                ) : (
                  <>
                    <span>Xem thêm sản phẩm</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
