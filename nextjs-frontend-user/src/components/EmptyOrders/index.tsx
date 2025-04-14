"use client";

import Link from "next/link";

const EmptyOrders = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#555"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginBottom: "20px" }}
      >
        <path d="M3 3h18v18H3z" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <p style={{ fontSize: "20px", color: "#555", marginBottom: "20px" }}>
        Bạn chưa có đơn hàng nào cả
      </p>
      <Link href="/products">
        <button
          style={{
            padding: "10px 20px",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#fff",
            backgroundColor: "#007bff",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0056b3";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#007bff";
          }}
        >
          Tiếp tục mua sắm
        </button>
      </Link>
    </div>
  );
};

export default EmptyOrders;