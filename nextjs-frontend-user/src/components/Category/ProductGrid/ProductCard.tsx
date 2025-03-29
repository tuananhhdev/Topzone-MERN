import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatToVND } from "@/helpers/formatPrice";
import { TProduct, IProductVariant } from "@/types/product";
import { useCart } from "@/hooks/useCart";
import { SETTINGS } from "@/config/settings";

interface ProductCardProps {
  product: TProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<IProductVariant | null>(
    product.variants?.[0] || null
  );

  const handleVariantChange = (variant: IProductVariant) => {
    setSelectedVariant(variant);
  };

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) return;
    
    addToCart({
      ...product,
      selectedVariant: selectedVariant ? {
        storage: selectedVariant.storage,
        price: selectedVariant.price,
        stock: selectedVariant.stock
      } : undefined
    });
  };

  // Calculate the display price based on variant and discount
  const displayPrice = selectedVariant 
    ? selectedVariant.price - (selectedVariant.price * (product.discount / 100))
    : product.price - (product.price * (product.discount / 100));

  const originalPrice = selectedVariant ? selectedVariant.price : product.price;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl bg-white p-3 shadow-sm transition-all hover:shadow-lg">
      <div className="relative mb-2">
        <Link href={`/products/${product.slug}`} className="relative block overflow-hidden">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-50">
            <Image
              src={`${SETTINGS.URL_IMAGE}/${product.photos[0]}`}
              alt={product.product_name}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>
        </Link>

        {/* Discount badge */}
        {product.discount > 0 && (
          <div className="absolute right-2 top-2 rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white">
            -{product.discount}%
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <Link href={`/products/${product.slug}`}>
          <h3 className="mb-2 text-sm font-medium text-gray-900 line-clamp-2">
            {product.product_name}
          </h3>
        </Link>

        {/* Price section */}
        <div className="mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-red-600">
              {formatToVND(displayPrice)}
            </span>
            {product.discount > 0 && (
              <span className="text-sm text-gray-400 line-through">
                {formatToVND(originalPrice)}
              </span>
            )}
          </div>
          <div className="mt-1">
            <span className="text-xs text-blue-600">Trả góp 0%</span>
          </div>
        </div>

        {/* Variants section */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.storage}
                onClick={() => handleVariantChange(variant)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selectedVariant?.storage === variant.storage
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-gray-200 text-gray-600 hover:border-red-500 hover:text-red-600"
                }`}
              >
                {variant.storage}
              </button>
            ))}
          </div>
        )}

        {/* Promotion badges */}
        <div className="mt-auto flex flex-wrap gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs">
            <span className="font-medium text-blue-600">Giảm {formatToVND(4000000)}</span>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs">
            <span>Còn {product.stock} ngày</span>
          </div>
        </div>

        {/* Compare button */}
        <button 
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-blue-500 hover:text-blue-600"
        >
          <span>So sánh</span>
        </button>

        {/* Add to cart button */}
        <motion.button
          type="button"
          className={`mt-2 w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 ${
            (product.variants && product.variants.length > 0 && !selectedVariant) || 
            (selectedVariant && selectedVariant.stock === 0) ||
            (!product.variants && product.stock === 0)
              ? "cursor-not-allowed opacity-50" 
              : ""
          }`}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCart}
          disabled={
            (product.variants && product.variants.length > 0 && !selectedVariant) || 
            (selectedVariant && selectedVariant.stock === 0) ||
            (!product.variants && product.stock === 0)
          }
        >
          {product.variants && product.variants.length > 0 
            ? (!selectedVariant 
                ? "Chọn phiên bản" 
                : selectedVariant.stock > 0 
                  ? "Thêm vào giỏ hàng" 
                  : "Hết hàng")
            : (product.stock > 0 
                ? "Thêm vào giỏ hàng" 
                : "Hết hàng")
          }
        </motion.button>
      </div>
    </div>
  );
};

export default ProductCard; 