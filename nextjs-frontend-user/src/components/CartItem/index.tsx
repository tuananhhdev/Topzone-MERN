import React from "react";
import { Checkbox, Tooltip } from "@mui/material";
import Image from "next/image";
import styles from "@/styles/cart.module.css";
import { formatToVND } from "@/helpers/formatPrice";
import { IoTrashOutline } from "react-icons/io5";
import { SETTINGS } from "@/config/settings";

interface CartItemProps {
  product;
  selectedItems: string[];
  toggleSelect: (id: string) => void;
  handleQuantityChange: (id: string, change: number) => void;
  removeFromCart: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  product,
  selectedItems,
  toggleSelect,
  handleQuantityChange,
  removeFromCart,
}) => {
  return (
    <div className={`${styles.productItem} flex items-center justify-between`}>
      <div className="flex items-center">
        <Checkbox
          name="selectedItems"
          checked={selectedItems.includes(product._id)}
          onChange={() => toggleSelect(product._id)}
        />

        <Image
          src={`${SETTINGS.URL_IMAGE}/${product.thumbnail}`}
          alt={product.product_name}
          width={64}
          height={64}
          className={styles.productImage}
        />
        <div className={styles.productInfo}>
          <h3>{product.product_name}</h3>
          <span className={styles.productPrice}>
            {formatToVND(product.price_end)}
          </span>
        </div>
      </div>
      <div className="flex items-center">
        <button
          className="mr-6 rounded-full bg-[#212121] px-3 py-1 text-white"
          onClick={() => handleQuantityChange(product._id, -1)}
        >
          -
        </button>
        <span className="rounded-lg border px-4 py-2">{product.quantity}</span>
        <button
          className="ml-6 rounded-full bg-[#212121] px-[10px] py-1 text-white"
          onClick={() => handleQuantityChange(product._id, 1)}
        >
          +
        </button>
        <Tooltip title="Xóa sản phẩm" placement="top">
          <IoTrashOutline
            className="ml-20 size-6 cursor-pointer text-rose-600"
            onClick={() => removeFromCart(product._id)}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default CartItem;
