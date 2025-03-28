import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatToVND } from "@/helpers/formatPrice";
import { SETTINGS } from "@/config/settings";

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

interface ProductCardProps {
  product: TProduct;
  handleAddToCart: (product: TProduct) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, handleAddToCart }) => {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-white shadow transition-all duration-300 hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="relative">
        <div className="h-[180px] w-full overflow-hidden p-4 transition-transform duration-300 hover:scale-105">
          <Image
            src={`${SETTINGS.URL_IMAGE}/${product.photos[0]}`}
            alt={product.product_name}
            width={200}
            height={160}
            className="h-full w-full object-contain p-2"
            priority
          />
          
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="mb-2 text-lg font-semibold text-gray-800 transition-colors hover:text-blue-600">
            {product.product_name}
          </h3>
        </Link>

        {/* Specifications */}
        <div className="mb-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="rounded bg-gray-100 px-2 py-1">Màn hình 6.7&quot;</span>
            <span className="rounded bg-gray-100 px-2 py-1">RAM 8GB</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="rounded bg-gray-100 px-2 py-1">Pin 5000mAh</span>
            <span className="rounded bg-gray-100 px-2 py-1">Chip A16</span>
          </div>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-red-600">
              {formatToVND(product.price * (1 - product.discount / 100))}
            </span>
            {product.discount > 0 && (
              <span className="text-sm text-gray-400 line-through">
                {formatToVND(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Storage Options */}
        <div className="mb-3 flex gap-2">
          <button className="rounded border border-gray-300 px-3 py-1 text-sm font-medium transition-colors hover:border-blue-500 hover:text-blue-500">
            128GB
          </button>
          <button className="rounded border border-gray-300 px-3 py-1 text-sm font-medium transition-colors hover:border-blue-500 hover:text-blue-500">
            256GB
          </button>
          <button className="rounded border border-gray-300 px-3 py-1 text-sm font-medium transition-colors hover:border-blue-500 hover:text-blue-500">
            512GB
          </button>
        </div>

        {/* Installment Payment */}
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm text-gray-600">Trả góp 0%</span>
          <div className="flex gap-1">
            <Image
              src="/bank-logos/ncb.png"
              alt="NCB"
              width={24}
              height={24}
              className="h-6"
            />
            <Image
              src="/bank-logos/home.png"
              alt="Home Credit"
              width={24}
              height={24}
              className="h-6"
            />
          </div>
        </div>

        {/* Add to Cart Button */}
        <motion.button
          type="button"
          className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAddToCart(product)}
        >
          Thêm vào giỏ hàng
        </motion.button>
      </div>
    </div>
  );
};

export default ProductCard; 