import React from "react";
import ProductFilter, { FilterState } from "@/components/Category/ProductFilter";
import OperatingSystemFilter from "../OperatingSystemFilter";

interface FiltersPanelProps {
  handleFilterChange: (newFilters: FilterState) => void;
  currentFilters: FilterState;
  filterLoading: boolean;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  handleFilterChange,
  currentFilters,
  filterLoading,
}) => {
  return (
    <div className="bg-white rounded-lg shadow sticky top-24">
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold">Bộ lọc tìm kiếm</h3>
      </div>
      <div className="filter-scrollbar max-h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden px-3 relative">
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
          onFilterChange={handleFilterChange}
          currentFilters={currentFilters}
        />
        <OperatingSystemFilter
          currentFilters={currentFilters}
          onFilterChange={handleFilterChange}
        />
      </div>
    </div>
  );
};

export default FiltersPanel; 