import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Slider } from "@/components/ui/slider";

interface FilterProps {
  onFilterChange: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export interface FilterState {
  priceRange: string;
  priceMin: number;
  priceMax: number;
  os: string[];
  storage: string[];
  connection: string[];
  battery: string;
  min_price?: string;
  max_price?: string;
}

interface PriceInputs {
  min: number;
  max: number;
}

const FilterSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        className="flex items-center justify-between w-full py-2 text-left text-gray-900"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-base font-medium">{title}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
};

const ProductFilter = ({ onFilterChange, currentFilters }: FilterProps) => {
  const [priceInputs, setPriceInputs] = useState<PriceInputs>({
    min: currentFilters.priceMin || 0,
    max: currentFilters.priceMax || 50000000,
  });

  const handlePriceChange = (value: string) => {
    let priceMin = 0;
    let priceMax = 0;

    switch (value) {
      case "under-2m":
        priceMin = 0;
        priceMax = 2000000;
        break;
      case "2m-4m":
        priceMin = 2000000;
        priceMax = 4000000;
        break;
      case "4m-7m":
        priceMin = 4000000;
        priceMax = 7000000;
        break;
      case "7m-13m":
        priceMin = 7000000;
        priceMax = 13000000;
        break;
      case "above-13m":
        priceMin = 13000000;
        priceMax = 100000000;
        break;
      default:
        break;
    }

    // Cập nhật giá trị trong input fields
    setPriceInputs({
      min: priceMin,
      max: priceMax
    });

    // Gửi thông tin lọc giá đến component cha
    onFilterChange({
      ...currentFilters,
      priceRange: value,
      priceMin,
      priceMax,
      min_price: priceMin.toString(),
      max_price: priceMax.toString()
    });
  };

  const handlePriceInputChange = (type: "min" | "max", value: string) => {
    const numericValue = parseInt(value.replace(/[^0-9]/g, "")) || 0;
    const newInputs = {
      ...priceInputs,
      [type]: numericValue
    };
    setPriceInputs(newInputs);

    // Gửi thông tin lọc giá tùy chỉnh đến component cha
    onFilterChange({
      ...currentFilters,
      priceRange: "custom",
      priceMin: newInputs.min,
      priceMax: newInputs.max,
      min_price: newInputs.min.toString(),
      max_price: newInputs.max.toString()
    });
  };

  // Cập nhật xử lý slider
  const handleSliderChange = (values: number[]) => {
    const newInputs = {
      min: values[0],
      max: values[1]
    };
    setPriceInputs(newInputs);
    onFilterChange({
      ...currentFilters,
      priceRange: "custom",
      priceMin: newInputs.min,
      priceMax: newInputs.max,
      min_price: newInputs.min.toString(),
      max_price: newInputs.max.toString()
    });
  };

  const handleToggleSelection = (
    category: keyof FilterState,
    value: string
  ) => {
    if (Array.isArray(currentFilters[category])) {
      const currentValues = currentFilters[category] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      onFilterChange({
        ...currentFilters,
        [category]: newValues,
      });
    }
  };

  const formatPrice = (value: string) => {
    if (!value) return "";
    const number = parseInt(value);
    return new Intl.NumberFormat("vi-VN").format(number) + "đ";
  };

  return (
    <div className="py-2">
      <div className="space-y-4">
        {/* Price Range */}
        <FilterSection title="Mức giá">
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="price"
                value="all"
                checked={currentFilters.priceRange === "all"}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Tất cả</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="price"
                value="under-2m"
                checked={currentFilters.priceRange === "under-2m"}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Dưới 2 triệu</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="price"
                value="2m-4m"
                checked={currentFilters.priceRange === "2m-4m"}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Từ 2 - 4 triệu</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="price"
                value="4m-7m"
                checked={currentFilters.priceRange === "4m-7m"}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Từ 4 - 7 triệu</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="price"
                value="7m-13m"
                checked={currentFilters.priceRange === "7m-13m"}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Từ 7 - 13 triệu</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="price"
                value="above-13m"
                checked={currentFilters.priceRange === "above-13m"}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Trên 13 triệu</span>
            </label>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600 font-medium mb-2">
              Hoặc nhập khoảng giá phù hợp với bạn:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formatPrice(priceInputs.min.toString())}
                onChange={(e) => handlePriceInputChange("min", e.target.value)}
                placeholder="0đ"
                className="w-full p-2 text-sm border border-gray-300 rounded bg-white"
              />
              <span className="text-gray-500">-</span>
              <input
                type="text"
                value={formatPrice(priceInputs.max.toString())}
                onChange={(e) => handlePriceInputChange("max", e.target.value)}
                placeholder="50.000.000đ"
                className="w-full p-2 text-sm border border-gray-300 rounded bg-white"
              />
            </div>

            {/* Price Range Slider */}
            <div className="mt-6">
              <Slider
                value={[priceInputs.min, priceInputs.max]}
                onValueChange={handleSliderChange}
                min={0}
                max={50000000}
                step={100000}
                className="w-full"
              />
            </div>
          </div>
        </FilterSection>

        {/* Operating System */}
        <FilterSection title="Hệ điều hành">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "ios", label: "iOS" },
              { id: "android", label: "Android" },
            ].map((os) => (
              <button
                key={os.id}
                onClick={() => {
                  const newOs = currentFilters.os.includes(os.id)
                    ? currentFilters.os.filter((item) => item !== os.id)
                    : [...currentFilters.os, os.id];
                  onFilterChange({
                    ...currentFilters,
                    os: newOs,
                  });
                }}
                className={`px-4 py-1 text-sm border rounded-full transition-colors ${
                  currentFilters.os.includes(os.id)
                    ? "border-red-500 text-red-500 bg-red-50"
                    : "border-gray-300 hover:border-red-500 hover:text-red-500"
                }`}
              >
                {os.label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Storage */}
        <FilterSection title="Dung lượng ROM">
          <div className="flex flex-wrap gap-2">
            {["128GB", "256GB", "512GB", "1TB"].map((size) => (
              <button
                key={size}
                onClick={() => handleToggleSelection("storage", size)}
                className={`px-4 py-1 text-sm border rounded-full transition-colors ${
                  currentFilters.storage.includes(size)
                    ? "border-blue-500 text-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-500 hover:text-blue-500"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Connection */}
        <FilterSection title="Kết nối">
          <div className="flex flex-wrap gap-2">
            {["nfc", "bluetooth", "infrared"].map((conn) => (
              <button
                key={conn}
                onClick={() => handleToggleSelection("connection", conn)}
                className={`px-4 py-1 text-sm border rounded-full transition-colors ${
                  currentFilters.connection.includes(conn)
                    ? "border-blue-500 text-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-500 hover:text-blue-500"
                }`}
              >
                {conn === "nfc"
                  ? "NFC"
                  : conn === "bluetooth"
                  ? "Bluetooth"
                  : "Hồng ngoại"}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Battery and Performance */}
        <FilterSection title="Hiệu năng và Pin">
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="battery"
                value="all"
                checked={currentFilters.battery === "all"}
                onChange={(e) =>
                  onFilterChange({
                    ...currentFilters,
                    battery: e.target.value,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Tất cả</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="battery"
                value="under-3000"
                checked={currentFilters.battery === "under-3000"}
                onChange={(e) =>
                  onFilterChange({
                    ...currentFilters,
                    battery: e.target.value,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Dưới 3000 mah</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="battery"
                value="3000-4000"
                checked={currentFilters.battery === "3000-4000"}
                onChange={(e) =>
                  onFilterChange({
                    ...currentFilters,
                    battery: e.target.value,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Từ 3000 - 4000 mah</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="battery"
                value="above-4000"
                checked={currentFilters.battery === "above-4000"}
                onChange={(e) =>
                  onFilterChange({
                    ...currentFilters,
                    battery: e.target.value,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Trên 4000 mah</span>
            </label>
          </div>
        </FilterSection>
      </div>
    </div>
  );
};

export default ProductFilter;
