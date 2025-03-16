import React from "react";
import { Checkbox, Tooltip } from "@mui/material";
import Image from "next/image";
import styles from "@/styles/cart.module.css";
import { formatToVND } from "@/helpers/formatPrice";
import { IoTrashOutline } from "react-icons/io5";
import { SETTINGS } from "@/config/settings";

interface CartItemProps {
  product: any;
  control: any;
  selectedItems: string[];
  toggleSelect: (id: string) => void;
  handleQuantityChange: (id: string, change: number) => void;
  removeFromCart: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  product,
  control,
  selectedItems,
  toggleSelect,
  handleQuantityChange,
  removeFromCart,
}) => {
  return (
    <div className={`${styles.productItem} flex justify-between items-center`}>
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
            {formatToVND(product.price * product.quantity)}
          </span>
        </div>
      </div>
      <div className="flex items-center">
        <button
          className="px-3 py-1 bg-[#212121] text-white rounded-full mr-6"
          onClick={() => handleQuantityChange(product._id, -1)}
        >
          -
        </button>
        <span className="border rounded-lg px-4 py-2">{product.quantity}</span>
        <button
          className="px-[10px] py-1 bg-[#212121] text-white rounded-full ml-6"
          onClick={() => handleQuantityChange(product._id, 1)}
        >
          +
        </button>
        <Tooltip title="Xóa sản phẩm" placement="top">
          <IoTrashOutline
            className="text-rose-600 size-6 cursor-pointer ml-20"
            onClick={() => removeFromCart(product._id)}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default CartItem;
