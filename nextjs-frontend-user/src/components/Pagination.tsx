import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  // Calculate the range of pages to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show before and after current page
    const range = [];
    const rangeWithDots = [];
    let l;

    // Always show first page
    range.push(1);

    // Calculate the range around current page
    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i > 1 && i < totalPages) {
        range.push(i);
      }
    }

    // Always show last page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Add dots between ranges
    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className={`flex items-center justify-center gap-2 mt-8 ${className}`}>
      {/* Previous page button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center justify-center w-10 h-10 rounded-lg border ${
          currentPage === 1
            ? "border-gray-600 text-gray-600 cursor-not-allowed"
            : "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
        }`}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-2">
        {getPageNumbers().map((pageNumber, index) => (
          <React.Fragment key={index}>
            {pageNumber === "..." ? (
              <span className="w-10 text-center text-gray-300">...</span>
            ) : (
              <button
                onClick={() =>
                  typeof pageNumber === "number" && onPageChange(pageNumber)
                }
                className={`w-10 h-10 rounded-lg border ${
                  currentPage === pageNumber
                    ? "bg-blue-500 text-white border-blue-500"
                    : "border-gray-300 text-gray-300 hover:border-blue-500 hover:text-blue-500 transition-colors"
                }`}
              >
                {pageNumber}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next page button */}
      <button
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        disabled={currentPage === totalPages}
        className={`flex items-center justify-center w-10 h-10 rounded-lg border ${
          currentPage === totalPages
            ? "border-gray-600 text-gray-600 cursor-not-allowed"
            : "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
        }`}
        aria-label="Next page"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
