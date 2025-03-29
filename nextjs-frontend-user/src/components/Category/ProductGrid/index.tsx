import React, { useRef, useMemo } from "react";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";

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

interface ProductGridProps {
  products: TProduct[];
  handleAddToCart: (product: TProduct) => void;
  hasMoreProducts: boolean;
  loadingMore: boolean;
  handleLoadMore: () => void;
  filterLoading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  handleAddToCart,
  hasMoreProducts,
  loadingMore,
  handleLoadMore,
  filterLoading = false
}) => {
  const productContainerRef = useRef<HTMLDivElement>(null);
  const skeletonArray = Array(9).fill(0);

  // Lọc sản phẩm trùng lặp dựa trên _id
  const uniqueProducts = useMemo(() => {
    const seen = new Set<string>();
    return products.filter(product => {
      if (seen.has(product._id)) {
        return false;
      }
      seen.add(product._id);
      return true;
    });
  }, [products]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" ref={productContainerRef}>
        {filterLoading ? (
          skeletonArray.map((_, index) => (
            <ProductSkeleton key={index} />
          ))
        ) : (
          uniqueProducts.map((product) => (
            <ProductCard 
              key={product._id}
              product={product} 
              handleAddToCart={handleAddToCart} 
            />
          ))
        )}
      </div>

      {/* Load More Button */}
      {hasMoreProducts && !filterLoading && (
        <div className="mb-6 mt-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-medium text-white shadow-lg transition-colors hover:bg-blue-700 hover:shadow-xl disabled:bg-blue-400"
          >
            {loadingMore ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin text-white"
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
    </>
  );
};

export default ProductGrid; 