"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { SETTINGS } from "@/config/settings";
import { useCartStore } from "@/stores/useCart";
import Breadcrumb from "@/components/Breadcumb";
import BrandSwiper from "@/components/BrandSwiper";
import { FilterState } from "@/components/ProductFilter";

// Import our custom components
import ProductGrid from "@/components/Category/ProductGrid";
import BrandFilter from "@/components/Category/BrandFilter";
import SortOptions from "@/components/Category/SortOptions";
import FiltersPanel from "@/components/Category/FiltersPanel";
import MobileFilterDrawer from "@/components/Category/MobileFilterDrawer";
import CategorySkeleton from "@/components/Category/CategorySkeleton";

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
  pagination?: {
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
  const scrollRef = useRef<number>(0);
  
  const [products, setProducts] = useState<TProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandProductCount, setBrandProductCount] = useState<number>(0);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [mobileFilterLoading, setMobileFilterLoading] = useState(false);
  
  const ITEMS_PER_PAGE = 12; // Number of products per page
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

  // Refs để theo dõi các giá trị
  const filtersRef = useRef<FilterState>(filters);
  const sortByRef = useRef<string>(sortBy);
  const currentPageRef = useRef<number>(currentPage);
  const brandsRef = useRef<Brand[]>(brands);
  const isFirstRender = useRef<boolean>(true);

  // Biến state mới để theo dõi trạng thái loading của product count
  const [brandCountLoading, setBrandCountLoading] = useState(false);

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

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(`${SETTINGS.URL_API}/v1/brands?page=1&limit=200`);
        setBrands(response.data?.data.brands_list || []);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      }
    };
    fetchBrands();
  }, []);

  // Fetch products count by brand
  const fetchProductCountByBrand = useCallback(async (brandSlug: string) => {
    setBrandCountLoading(true); // Set loading state khi bắt đầu fetch
    try {
      const response = await axios.get(
        `${SETTINGS.URL_API}/v1/products/brand/${brandSlug}?categories=${slug}`
      );
      setBrandProductCount(response.data?.data.pagination?.totalRecords || 0);
    } catch (error) {
      console.error("Failed to fetch product count:", error);
      setBrandProductCount(0);
    } finally {
      setBrandCountLoading(false); // Reset loading state khi hoàn thành
    }
  }, [slug]);

  // Update product count when brand selection changes
  useEffect(() => {
    if (selectedBrand) {
      const selectedBrandData = brands.find((b) => b.brand_name === selectedBrand);
      if (selectedBrandData) {
        fetchProductCountByBrand(selectedBrandData.slug);
      }
    } else {
      setBrandProductCount(0);
      setBrandCountLoading(false);
    }
  }, [selectedBrand, brands, fetchProductCountByBrand]);

  // Cập nhật refs khi các giá trị thay đổi
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    sortByRef.current = sortBy;
  }, [sortBy]);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    brandsRef.current = brands;
  }, [brands]);

  // Fetch products function - sử dụng loading skeleton cho cả initial load và filter
  const fetchProducts = useCallback(async (isInitialLoad = false) => {
    if (!slug) return;
    
    const currentFilters = filtersRef.current;
    const currentPageValue = currentPageRef.current;
    const currentSortBy = sortByRef.current;
    const currentBrands = brandsRef.current;

    try {
      if (isInitialLoad) {
        // Khi tải trang đầu tiên, hiển thị skeleton toàn trang
        setLoading(true);
      } else {
        // Khi filter thay đổi, chỉ hiển thị skeleton ở phần sản phẩm
        setProductsLoading(true);
      }

      // Construct base URL with pagination
      const baseUrl = new URL(`${SETTINGS.URL_API}/v1/products/category/${slug as string}`);
      baseUrl.searchParams.append("page", String(currentPageValue));
      baseUrl.searchParams.append("limit", String(ITEMS_PER_PAGE));

      // Add brand filter if selected
      if (currentFilters.os.length > 0) {
        const selectedBrandData = currentBrands.find(
          (b) => b.brand_name === currentFilters.os[0]
        );
        if (selectedBrandData) {
          baseUrl.pathname = `/api/v1/products/brand/${selectedBrandData.slug}`;
          baseUrl.searchParams.append("categories", slug as string);
        }
      }

      // Add sort parameters only for price sorting
      if (currentSortBy === "gia-thap-den-cao") {
        baseUrl.searchParams.append("sort", "price");
        baseUrl.searchParams.append("order", "ASC");
      } else if (currentSortBy === "gia-cao-den-thap") {
        baseUrl.searchParams.append("sort", "price");
        baseUrl.searchParams.append("order", "DESC");
      } else if (currentSortBy === "noi-bat") {
        // For "Nổi bật", sort by createdAt in descending order (newest first)
        baseUrl.searchParams.append("sort", "createdAt");
        baseUrl.searchParams.append("order", "DESC");
      }

      console.log("Fetching products with URL:", baseUrl.toString());

      const response = await axios.get(baseUrl.toString());

      if (currentPageValue === 1) {
        setProducts(response.data?.data.products_list || []);
      } else {
        setProducts((prev) => [...prev, ...(response.data?.data.products_list || [])]);
      }
      setTotalRecords(response.data?.data.pagination?.totalRecords || 0);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      // Đảm bảo reset tất cả các trạng thái loading
      setLoading(false);
      setLoadingMore(false);
      setProductsLoading(false);
    }
  }, [slug, ITEMS_PER_PAGE]);

  // Initial load
  useEffect(() => {
    if (slug) {
      // Tải lần đầu với loading toàn trang
      fetchProducts(true);
    }
  }, [slug, fetchProducts]);

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    // Cập nhật state filters
    setFilters(newFilters);
    // Reset to page 1 when filters change
    setCurrentPage(1);
  };

  // Handle filter changes effect
  useEffect(() => {
    // Skip the first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // Tải lại sản phẩm khi filter thay đổi - không sử dụng loading toàn trang
    fetchProducts(false);
  }, [filters, fetchProducts]);

  // Handle page changes
  useEffect(() => {
    if (slug && currentPage > 1) {
      setLoadingMore(true);
      fetchProducts(false);
    }
  }, [currentPage, fetchProducts, slug]);

  // Handle sort changes
  useEffect(() => {
    if (slug && !isFirstRender.current) {
      setCurrentPage(1);
      fetchProducts(false);
    }
  }, [sortBy, fetchProducts, slug]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setCurrentPage((prev) => prev + 1);
  };

  const handleAddToCart = (product: TProduct) => {
    addToCart({
      ...product,
      quantity: 1,
      thumbnail: product.photos[0],
    });
  };

  if (loading) {
    return <CategorySkeleton />;
  }

  return (
    <div className="mx-auto mt-6 p-4 font-sans md:max-w-4xl lg:max-w-6xl">
      <Breadcrumb
        categoryName={products[0]?.category?.category_name || "Danh mục"}
        categorySlug={products[0]?.category?.slug}
      />

      <h2 className="mb-2 text-3xl font-semibold text-white">
        {products[0]?.category?.category_name}
      </h2>
      <BrandSwiper />

      <div className="mt-4 flex gap-4">
        {/* Filter Sidebar */}
        <div className="w-[250px] md:block">
          <FiltersPanel 
            handleFilterChange={handleFilterChange}
            currentFilters={filters}
            filterLoading={false}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header with Sort */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-white">
              Tìm thấy <span className="font-bold">{totalRecords}</span> kết quả
            </p>
            <div className="flex items-center gap-2">
              <label className="font-medium text-white">Sắp xếp theo:</label>
              <SortOptions 
                sortBy={sortBy}
                setSortBy={setSortBy}
                handleSortChange={handleSortChange}
                maintainScroll={maintainScroll}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </div>

          {/* Quick Manufacturer Filter */}
          <BrandFilter 
            brands={brands}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            brandProductCount={brandProductCount}
            filters={filters}
            handleFilterChange={handleFilterChange}
            setBrandProductCount={setBrandProductCount}
            maintainScroll={maintainScroll}
            setFilters={setFilters}
            brandCountLoading={brandCountLoading}
          />

          {/* Product Grid */}
          <ProductGrid 
            products={products}
            handleAddToCart={handleAddToCart}
            hasMoreProducts={hasMoreProducts}
            loadingMore={loadingMore}
            handleLoadMore={handleLoadMore}
            filterLoading={productsLoading}
          />
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer 
        showMobileFilter={showMobileFilter}
        setShowMobileFilter={setShowMobileFilter}
        handleFilterChange={handleFilterChange}
        filters={filters}
        filterLoading={false}
        mobileFilterLoading={mobileFilterLoading}
        setMobileFilterLoading={setMobileFilterLoading}
      />
    </div>
  );
};

export default CategoryPage;
