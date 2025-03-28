import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterState } from "@/components/Category/ProductFilter";
import LoadingSpinner from "../LoadingSpinner";

interface Brand {
  _id: string;
  brand_name: string;
  slug: string;
}

interface BrandFilterProps {
  brands: Brand[];
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  brandProductCount: number;
  filters: FilterState;
  handleFilterChange: (newFilters: FilterState, isLoading?: boolean) => void;
  setBrandProductCount: (count: number) => void;
  maintainScroll: (callback: () => void) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  brandCountLoading?: boolean;
}

const BrandFilter: React.FC<BrandFilterProps> = ({
  brands,
  selectedBrand,
  setSelectedBrand,
  brandProductCount,
  filters,
  handleFilterChange,
  setBrandProductCount,
  maintainScroll,
  setFilters,
  brandCountLoading,
}) => {
  const [showBrands, setShowBrands] = useState(false);
  const [brandFilterLoading, setBrandFilterLoading] = useState(false);
  const brandRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (brandRef.current && !brandRef.current.contains(event.target as Node)) {
        setShowBrands(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedBrandModal = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute left-0 top-full z-20 mt-4 w-[400px] rounded-lg bg-white shadow-lg"
    >
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {brands.map((brand) => (
            <button
              key={brand._id}
              onClick={() => {
                setSelectedBrand(
                  selectedBrand === brand.brand_name ? "" : brand.brand_name
                );
              }}
              className={`flex items-center justify-center whitespace-nowrap rounded-lg border px-6 py-3 text-xs ${
                selectedBrand === brand.brand_name
                  ? "border-red-500 bg-red-50 text-red-500"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {brand.brand_name}
            </button>
          ))}
        </div>
        {selectedBrand && (
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <button
              onClick={() => {
                setSelectedBrand("");
                setBrandProductCount(0);
                setShowBrands(false);
              }}
              disabled={brandFilterLoading}
              className="rounded-lg border border-red-500 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400"
            >
              Bỏ chọn
            </button>
            <button
              onClick={() => {
                const selectedBrandData = brands.find(
                  (b) => b.brand_name === selectedBrand
                );
                if (selectedBrandData) {
                  setBrandFilterLoading(true);
                  setTimeout(() => {
                    handleFilterChange({
                      ...filters,
                      os: [selectedBrandData.brand_name],
                    });
                    setShowBrands(false);
                    setTimeout(() => {
                      setBrandFilterLoading(false);
                    }, 800);
                  }, 800);
                }
              }}
              disabled={brandFilterLoading || brandProductCount === 0}
              className="flex min-w-[170px] items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm text-white hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500"
            >
              {brandFilterLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="md" color="white" />
                  <span className="loading-text">Đang xử lý...</span>
                </div>
              ) : brandCountLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="md" color="white" />
                  <span className="loading-text">Đang tính kết quả...</span>
                </div>
              ) : (
                <span>{brandProductCount === 0 ? "Không có kết quả" : `Xem ${brandProductCount} kết quả`}</span>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="relative mb-4" ref={brandRef}>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowBrands(!showBrands)}
          className="flex items-center gap-1 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-sm transition-colors hover:bg-gray-100"
        >
          <span>Lọc nhanh :</span>
          <span className="font-medium">Hãng sản xuất</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`h-4 w-4 transition-transform duration-200 ${
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
              setSelectedBrand("");
              setBrandProductCount(0);
              setFilters(prev => ({...prev, os: newOs}));
              handleFilterChange({ ...filters, os: newOs }, true);
            }}
            className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm transition-colors hover:bg-gray-100"
          >
            {brand}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        ))}
        {filters.os.length > 0 && (
          <button
            onClick={() => {
              maintainScroll(() => {
                handleFilterChange({ ...filters, os: [] }, true);
                setSelectedBrand("");
                setBrandProductCount(0);
                setShowBrands(false);
              });
            }}
            className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-100"
          >
            Xóa tất cả
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Brand Selection Modal */}
      <AnimatePresence>
        {showBrands && selectedBrandModal()}
      </AnimatePresence>
    </div>
  );
};

export default BrandFilter; 