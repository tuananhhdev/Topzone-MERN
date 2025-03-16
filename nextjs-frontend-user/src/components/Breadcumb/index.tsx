"use client";
import Link from "next/link";
import React from "react";
import { GoHome } from "react-icons/go";

interface BreadcrumbProps {
  categoryName?: string;
  categorySlug?: string;
  brandName?: string;
  productName?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  categoryName,
  categorySlug,
  brandName,
  productName,
}) => {
  const breadcrumbItems: { name: React.ReactNode; url: string }[] = [];

  console.log("Breadcrumb Props:", {
    categoryName,
    categorySlug,
    brandName,
    productName,
  });

  // Thêm item Trang chủ
  breadcrumbItems.push({
    name: <GoHome className="text-xl" />,
    url: "/",
  });

  // Thêm item category nếu có categoryName
  if (categoryName && categorySlug) {
    breadcrumbItems.push({ name: categoryName, url: `/category/${categorySlug}` });
  }

  // Thêm tên thương hiệu nếu có brandName
  if (brandName) {
    breadcrumbItems.push({ name: brandName, url: "" });
  }

  // Cắt bớt tên sản phẩm nếu có productName
  const truncateProductName = (name: string) => {
    const maxLength = 50;
    return name.length > maxLength ? name.substring(0, maxLength) + "..." : name;
  };

  // Thêm tên sản phẩm nếu có productName
  if (productName) {
    breadcrumbItems.push({ name: truncateProductName(productName), url: "" });
  }

  if (breadcrumbItems.length === 1) {
    console.warn("Breadcrumb chỉ có trang chủ, kiểm tra dữ liệu đầu vào.");
  }

  return (
    <nav aria-label="breadcrumb" className="py-3">
      <ol className="list-none p-0 flex items-center space-x-3">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            <Link
              href={item.url}
              className={`${
                index === breadcrumbItems.length - 1
                  ? "text-gray-900 font-semibold"
                  : "text-gray-500 hover:text-gray-900"
              } flex items-center`}
            >
              {item.name}
            </Link>
            {index < breadcrumbItems.length - 1 && (
              <span className="mx-2 text-gray-400">›</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
