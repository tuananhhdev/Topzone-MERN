"use client";

import React from "react";
import { Checkbox, FormControlLabel, Modal } from "@mui/material";
import styles from "@/styles/cart.module.css";
import { useCartLogic } from "@/hooks/useCartLogic";
import CartItem from "@/components/CartItem";
import OrderSummary from "@/components/OrderSummary";
import { useSession, signIn } from "next-auth/react";

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    selectedItems,
    selectAll,
    totalAmount,
    discount,
    toggleSelect,
    handleQuantityChange,
    handleSelectAll,
    redirectToCheckout,
  } = useCartLogic();

  // Lấy dữ liệu phiên và trạng thái từ useSession
  const { status } = useSession();

  // State để điều khiển hiển thị modal
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  // Hàm xử lý khi nhấn "Đặt hàng"
  const handleCheckout = () => {
    // Kiểm tra nếu người dùng chưa đăng nhập
    if (status === "unauthenticated") {
      setShowLoginModal(true);
      return;
    }

    // // Kiểm tra nếu giỏ hàng trống
    if (cartItems.length === 0) {
      alert("Không có sản phẩm nào trong giỏ hàng để thanh toán.");
      return;
    }

    // Tiếp tục chuyển hướng đến checkout
    redirectToCheckout(
      selectedItems.length > 0
        ? selectedItems
        : cartItems.map((item) => item._id)
    );
  };

  return (
    <div className="container mx-auto mt-20 p-4">
      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500 text-lg py-20">
          🛒 Giỏ hàng của bạn đang trống.
        </div>
      ) : (
        <>
          <div className="-mx-4 flex flex-wrap">
            {/* Danh sách sản phẩm */}
            <div className="w-full px-4 lg:w-2/3">
              <div className={styles.products}>
                <h2 className="mb-5 font-medium">
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
                        : `/${product.thumbnail}`,
                    }}
                    selectedItems={selectedItems}
                    toggleSelect={toggleSelect}
                    handleQuantityChange={handleQuantityChange}
                    removeFromCart={removeFromCart}
                  />
                ))}
              </div>
            </div>
  
            {/* Thông tin đơn hàng */}
            <div className="w-full px-4 lg:w-1/3">
              <OrderSummary
                totalAmount={totalAmount}
                discount={discount}
                selectedItems={selectedItems}
                cartItems={cartItems}
                redirectToCheckout={handleCheckout}
              />
            </div>
          </div>
        </>
      )}
  
      {/* Modal yêu cầu đăng nhập */}
      {showLoginModal && (
        <Modal open={showLoginModal} onClose={() => setShowLoginModal(false)}>
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "5px",
              maxWidth: "400px",
              margin: "auto",
              position: "relative",
              top: "50%",
              transform: "translateY(-50%)",
              textAlign: "center",
            }}
          >
            <h3>Vui lòng đăng nhập</h3>
            <p>Bạn cần đăng nhập để có thể đặt hàng.</p>
            <button
              onClick={() => signIn()}
              style={{ marginRight: "10px", padding: "5px 10px" }}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setShowLoginModal(false)}
              style={{ padding: "5px 10px" }}
            >
              Đóng
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CartPage;
