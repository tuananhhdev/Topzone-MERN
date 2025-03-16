"use client";

import React from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import styles from "@/styles/cart.module.css";
import { useCartLogic } from "@/hooks/useCartLogic";
import CartItem from "@/components/CartItem";
import OrderSummary from "@/components/OrderSummary";

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    control,
    selectedItems,
    selectAll,
    totalAmount,
    discount,
    toggleSelect,
    handleQuantityChange,
    handleSelectAll,
    redirectToCheckout,
  } = useCartLogic();

  // Hàm xử lý khi nhấn "Thanh toán"
  const handleCheckout = () => {
    if (selectedItems.length === 0 && cartItems.length === 0) {
      alert("Không có sản phẩm nào trong giỏ hàng để thanh toán.");
      return;
    }

    // Gọi hàm redirectToCheckout từ logic
    redirectToCheckout(
      selectedItems.length > 0
        ? selectedItems
        : cartItems.map((item) => item._id)
    );
  };

  return (
    <div className="container mx-auto p-4 mt-20">
      <div className="flex flex-wrap -mx-4">
        {/* Danh sách sản phẩm */}
        <div className="w-full lg:w-2/3 px-4">
          <div className={styles.products}>
            <h2 className="font-medium mb-5">
              Sản phẩm trong đơn ({cartItems.length})
            </h2>
            <div className="mb-4">
              <FormControlLabel
                control={
                  <Checkbox checked={selectAll} onChange={handleSelectAll} />
                }
                label="Chọn tất cả"
              />
            </div>
            {cartItems.map((product) => (
              <CartItem
                key={product._id}
                product={{
                  ...product,
                  thumbnail: product.thumbnail.startsWith("/")
                    ? product.thumbnail
                    : `/${product.thumbnail}`, // Thêm dấu "/" nếu thiếu
                }}
                control={control}
                selectedItems={selectedItems}
                toggleSelect={toggleSelect}
                handleQuantityChange={handleQuantityChange}
                removeFromCart={removeFromCart}
              />
            ))}
          </div>
        </div>

        {/* Thông tin đơn hàng */}
        <div className="w-full lg:w-1/3 px-4">
          <OrderSummary
            totalAmount={totalAmount}
            discount={discount}
            selectedItems={selectedItems}
            cartItems={cartItems}
            redirectToCheckout={handleCheckout} // Sử dụng hàm chuyển hướng
          />
        </div>
      </div>
    </div>
  );
};

export default CartPage;
