import React from "react";
import { FilterState } from "@/components/Category/ProductFilter";
import { motion } from "framer-motion";

interface NoProductsFoundProps {
  filters: FilterState;
  onResetFilters: () => void;
  isLoading?: boolean;
}

const NoProductsFound: React.FC<NoProductsFoundProps> = ({ 
  filters, 
  onResetFilters,
  isLoading = false 
}) => {
  const hasActiveFilters = 
    filters.priceRange !== "all" ||
    filters.os.length > 0 ||
    filters.storage.length > 0 ||
    filters.connection.length > 0 ||
    filters.battery !== "all";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-4 text-6xl"
      >
        😕
      </motion.div>
      
      <motion.h3 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-2 text-xl font-semibold text-white"
      >
        Không tìm thấy sản phẩm
      </motion.h3>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6 text-gray-400"
      >
        {hasActiveFilters
          ? "Không có sản phẩm nào phù hợp với bộ lọc của bạn. Hãy thử điều chỉnh lại các bộ lọc."
          : "Hiện tại không có sản phẩm nào trong danh mục này."}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onResetFilters}
        disabled={isLoading}
        className="relative rounded-md bg-[#101010] px-6 py-3 text-sm font-medium text-white hover:bg-[#202020] focus:outline-none focus:ring-2 focus:ring-[#101010] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Đang xóa...</span>
          </div>
        ) : (
          "Xóa tất cả bộ lọc"
        )}
      </motion.button>
    </motion.div>
  );
};

export default NoProductsFound; 