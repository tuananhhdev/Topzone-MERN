import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "../../../styles/brand-swiper.css";

const CategorySkeleton: React.FC = () => {
  return (
    <div className="mx-auto mt-10 p-4 font-sans md:max-w-4xl lg:max-w-6xl">
      {/* Skeleton for Breadcrumb */}
      <Skeleton height={24} width={200} className="mb-4" />

      {/* Skeleton for Category Title */}
      <Skeleton height={48} width={300} className="mb-4" />

      {/* Skeleton for Brand Swiper */}
      <div className="brand-swiper-container animate-pulse">
        <div className="grid grid-cols-5 gap-4 md:grid-cols-4 sm:grid-cols-3">
          {Array(8).fill(0).map((_, index) => (
            <div key={index} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {/* Skeleton for Filter Sidebar */}
        <div className="hidden w-[250px] md:block">
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 p-4">
              <Skeleton height={24} width={140} />
            </div>
            <div className="filter-scrollbar max-h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden p-4">
              {/* Price Range Skeleton */}
              <div className="mb-4 border-b pb-4">
                <Skeleton height={24} width={80} className="mb-3" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton circle width={16} height={16} />
                      <Skeleton width={120} height={18} />
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Skeleton width={200} height={18} className="mb-2" />
                  <div className="flex items-center gap-2">
                    <Skeleton height={36} className="flex-1" />
                    <Skeleton width={10} />
                    <Skeleton height={36} className="flex-1" />
                  </div>
                </div>
              </div>

              {/* OS Skeleton */}
              <div className="mb-4 border-b pb-4">
                <Skeleton height={24} width={120} className="mb-3" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton width={60} height={30} borderRadius={20} />
                  <Skeleton width={90} height={30} borderRadius={20} />
                </div>
              </div>

              {/* Storage Skeleton */}
              <div className="mb-4 border-b pb-4">
                <Skeleton height={24} width={140} className="mb-3" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton width={70} height={30} borderRadius={20} />
                  <Skeleton width={70} height={30} borderRadius={20} />
                  <Skeleton width={70} height={30} borderRadius={20} />
                  <Skeleton width={70} height={30} borderRadius={20} />
                </div>
              </div>

              {/* Connection Skeleton */}
              <div className="mb-4 border-b pb-4">
                <Skeleton height={24} width={100} className="mb-3" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton width={80} height={30} borderRadius={20} />
                  <Skeleton width={100} height={30} borderRadius={20} />
                  <Skeleton width={80} height={30} borderRadius={20} />
                </div>
              </div>

              {/* Battery Skeleton */}
              <div className="mb-4">
                <Skeleton height={24} width={140} className="mb-3" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton circle width={16} height={16} />
                      <Skeleton width={140} height={18} />
                    </div>
                  ))}
                </div>
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
            {Array(9)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col overflow-hidden rounded-lg bg-white shadow"
                >
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
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySkeleton; 