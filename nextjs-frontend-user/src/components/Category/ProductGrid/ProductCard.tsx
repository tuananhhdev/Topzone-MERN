import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatToVND } from "@/helpers/formatPrice";
import { TProduct, IProductVariant } from "@/types/product";
import { useCart } from "@/hooks/useCart";
import { SETTINGS } from "@/config/settings";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

interface ProductCardProps {
  product: TProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<IProductVariant | null>(
    product.variants?.[0] || null
  );
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!product.discount_end_time) return "";
      
      const now = dayjs();
      const end = dayjs(product.discount_end_time);
      const diff = end.diff(now);
      
      if (diff <= 0) return "";
      
      const duration = dayjs.duration(diff);
      const days = Math.floor(duration.asDays());
      const hours = duration.hours().toString().padStart(2, '0');
      const minutes = duration.minutes().toString().padStart(2, '0');
      const seconds = duration.seconds().toString().padStart(2, '0');
      
      return days > 0 
        ? `Còn ${days} ngày ${hours} : ${minutes} : ${seconds}`
        : `Còn ${hours} : ${minutes} : ${seconds}`;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [product.discount_end_time]);

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

  // Check if discount is still valid
  const isDiscountValid = product.discount_end_time 
    ? dayjs().isBefore(dayjs(product.discount_end_time))
    : true;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-lg w-full">
    <div className="mb-2">
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden">
        <div className="overflow-hidden h-48 rounded-lg bg-slate-50">
          <Image
            src={`${SETTINGS.URL_IMAGE}/${product.photos[0]}`}
            alt={product.product_name}
            width={150}
            height={150}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </div>
      </Link>
    </div>

    <div className="flex flex-1 flex-col">
      <Link href={`/products/${product.slug}`}>
        <h3 className="mb-2 text-base font-medium text-gray-900 line-clamp-2">
          {product.product_name}
        </h3>
      </Link>

      {/* Giá */}
      <div className="mb-2">
        {product.discount > 0 && isDiscountValid && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 line-through">
              {formatToVND(originalPrice)}
            </span>
            <span className="text-xs text-red-600">-{product.discount}%</span>
          </div>
        )}
        <div className="text-lg font-bold text-red-600">
          {formatToVND(displayPrice)}
        </div>
        {product.discount > 0 && isDiscountValid && (
          <div className="mt-1">
            <span className="text-xs text-green-600">
              Giảm {formatToVND(originalPrice - displayPrice)}
            </span>
          </div>
        )}
        <div className="mt-1">
          <span className="text-xs text-blue-600">Trả góp 0%</span>
        </div>
      </div>

      {/* Phiên bản */}
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

      {/* Thời gian giảm giá */}
      {timeLeft && (
        <div className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs text-red-600 w-full justify-center">
          <span>{timeLeft}</span>
        </div>
      )}

      {/* Nút thêm vào giỏ hàng */}
      <motion.button
        type="button"
        className={`mt-2 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 ${
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
        Thêm vào giỏ hàng
      </motion.button>
    </div>
  </div>
  );
};

export default ProductCard; 