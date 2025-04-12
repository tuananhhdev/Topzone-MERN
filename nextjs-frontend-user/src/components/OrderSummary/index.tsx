import React from "react";
import { formatToVND } from "@/helpers/formatPrice";
import styles from "@/styles/cart.module.css";

interface OrderSummaryProps {
  totalAmount: number;
  discount: number;
  selectedItems: string[];
  cartItems: any[];
  redirectToCheckout: () => void; // Hàm chuyển hướng
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  totalAmount,
  discount,
  redirectToCheckout,
}) => {
  return (
    <div className={styles.orderSummary}>
      <h2>Thông tin đơn hàng</h2>
      <div className={styles.summaryItem}>
        <span>Tổng tiền</span>
        <span>{formatToVND(totalAmount)}</span>
      </div>
      <div className={styles.summaryItem}>
        <span>Khuyến mãi</span>
        <span>-{formatToVND(discount)}</span>
      </div>
      <div
        className={styles.summaryItem}
        style={{
          borderBottom: "1px solid #e0e0e0",
          paddingBottom: "20px",
        }}
      >
        <span>Phí vận chuyển</span>
        <span className="text-green-400">Miễn phí</span>
      </div>
      <div className={styles.summaryTotal}>
        <span>Cần thanh toán</span>
        <span>{formatToVND(totalAmount - discount)}</span>
      </div>
      <button
        onClick={redirectToCheckout} // Gọi hàm chuyển hướng
        className={styles.orderButton}
      >
        Thanh toán
      </button>
    </div>
  );
};

export default OrderSummary;
