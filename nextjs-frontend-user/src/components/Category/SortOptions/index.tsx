import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SortOptionsProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  handleSortChange: (value: string) => void;
  maintainScroll: (callback: () => void) => void;
  setCurrentPage: (page: number) => void;
}

const SortOptions: React.FC<SortOptionsProps> = ({
  sortBy,
  setSortBy,
  handleSortChange,
  maintainScroll,
  setCurrentPage,
}) => {
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSort(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={sortRef}>
      <button
        onClick={() => setShowSort(!showSort)}
        className="flex min-w-[180px] cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white p-2 text-base text-gray-700 transition-all duration-200 hover:border-gray-400 focus:border-gray-400 focus:outline-none"
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
          className={`h-4 w-4 transition-transform duration-200 ${
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
            className="absolute left-0 top-full z-50 mt-3.5 w-[180px] rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            <motion.div
              className="cursor-pointer px-3 py-2 text-base text-gray-400 transition-colors duration-150 first:rounded-t-lg hover:bg-gray-200"
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
              className="flex cursor-pointer items-center px-3 py-2 text-base transition-colors duration-150 hover:bg-gray-200"
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
                className="ml-1 h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </motion.div>
            <motion.div
              className="flex cursor-pointer items-center px-3 py-2 text-base transition-colors duration-150 hover:bg-gray-200"
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
                className="ml-1 h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18"
                />
              </svg>
            </motion.div>
            <motion.div
              className="flex cursor-pointer items-center px-3 py-2 text-base transition-colors duration-150 hover:bg-gray-200"
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
                className="ml-1 h-4 w-4"
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
  );
};

export default SortOptions; 