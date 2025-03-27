import React from 'react';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProductSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-white shadow">
      {/* Product Image Skeleton */}
      <div className="relative w-full p-4">
        <Skeleton height={200} className="rounded-lg" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        {/* Product Title Skeleton */}
        <Skeleton height={24} width="80%" className="mb-3" />

        {/* Specifications Skeleton */}
        <div className="mb-3 space-y-2">
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
        <div className="mb-3 flex gap-2">
          <Skeleton height={32} width={70} />
          <Skeleton height={32} width={70} />
          <Skeleton height={32} width={70} />
        </div>

        {/* Installment Payment Skeleton */}
        <div className="mb-3 flex items-center gap-2">
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
  );
};

export default ProductSkeleton; 