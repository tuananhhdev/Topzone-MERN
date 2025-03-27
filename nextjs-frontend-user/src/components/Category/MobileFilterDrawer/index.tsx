import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductFilter, { FilterState } from "@/components/ProductFilter";
import LoadingSpinner from "@/components/LoadingSpinner";

interface MobileFilterDrawerProps {
  showMobileFilter: boolean;
  setShowMobileFilter: (show: boolean) => void;
  handleFilterChange: (newFilters: FilterState) => void;
  filters: FilterState;
  filterLoading: boolean;
  mobileFilterLoading: boolean;
  setMobileFilterLoading: (loading: boolean) => void;
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  showMobileFilter,
  setShowMobileFilter,
  handleFilterChange,
  filters,
  filterLoading,
  mobileFilterLoading,
  setMobileFilterLoading,
}) => {
  return (
    <AnimatePresence>
      {showMobileFilter && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setShowMobileFilter(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed right-0 top-0 z-50 h-full w-[300px] bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold">Bộ lọc tìm kiếm</h3>
              <button onClick={() => setShowMobileFilter(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="filter-scrollbar p-4 relative">
              {filterLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                  <svg
                    className="h-8 w-8 animate-spin text-red-500"
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
                </div>
              )}
              <ProductFilter
                onFilterChange={(newFilters) => {
                  handleFilterChange(newFilters);
                  setTimeout(() => setShowMobileFilter(false), 1000);
                }}
                currentFilters={filters}
              />
            </div>
            <div className="border-t p-4">
              <button
                onClick={() => {
                  setMobileFilterLoading(true);
                  setTimeout(() => {
                    setMobileFilterLoading(false);
                    setShowMobileFilter(false);
                  }, 1000);
                }}
                disabled={mobileFilterLoading}
                className="w-full rounded-lg bg-red-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center gap-2"
              >
                {mobileFilterLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="md" color="white" />
                    <span className="loading-text">Đang xử lý...</span>
                  </div>
                ) : (
                  "Xem kết quả"
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileFilterDrawer; 