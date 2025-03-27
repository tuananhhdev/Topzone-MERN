// "use client";

// import React, { useEffect, useState } from "react";
// import { useCartStore } from "@/stores/useCart";
// import Image from "next/image";
// import styles from "@/styles/checkout.module.css";
// import { SETTINGS } from "@/config/settings";
// import { useSession } from "next-auth/react";
// import { TCustomer } from "@/types/modes";

// interface IProduct {
//   _id: string;
//   product_name: string;
//   price: number;
//   quantity: number;
//   discount: number;
//   thumbnail: string;
// }

// const CheckoutPage = () => {
//   const cartItems = useCartStore((state) => state.cart); // Lấy giỏ hàng từ store
//   const [productsToCheckout, setProductsToCheckout] = useState<IProduct[]>([]);
//   const [totalAmount, setTotalAmount] = useState(0); // Tổng tiền
//   const [address, setAddress] = useState(""); // Địa chỉ
//   const [shippingCost, setShippingCost] = useState(0); // Phí vận chuyển
//   const [selectedPayment, setSelectedPayment] = useState(""); // Phương thức thanh toán

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const itemsToCheckout = JSON.parse(
//         localStorage.getItem("itemsToCheckout") || "[]"
//       );
//       const selectedProducts = cartItems.filter((item) =>
//         itemsToCheckout.includes(item._id)
//       );
//       setProductsToCheckout(selectedProducts);
//     }
//   }, [cartItems]);

//   useEffect(() => {
//     if (address.trim() === "") {
//       setShippingCost(0);
//     } else {
//       setShippingCost(50000); // Phí vận chuyển mặc định
//     }
//   }, [address]);

//   useEffect(() => {
//     const total = productsToCheckout.reduce(
//       (sum, product) => sum + product.price * product.quantity,
//       0
//     );
//     setTotalAmount(total + shippingCost);
//   }, [productsToCheckout, shippingCost]);

//   const handlePaymentSelect = (method: string) => {
//     setSelectedPayment(method);
//   };

//   return (
//     <div className="container mx-auto p-4 mt-20">
//       <div className="flex flex-wrap -mx-4">
//         {/* Phần bên trái */}
//         <div className="w-full lg:w-2/3 px-4">
//           {/* Thông tin sản phẩm */}
//           <div className="bg-white shadow-md rounded p-4 mb-6">
//             <h2 className="text-lg font-medium mb-4">Sản phẩm</h2>
//             {productsToCheckout.map((product) => (
//               <div
//                 key={product._id}
//                 className="flex items-center justify-between mb-4"
//               >
//                 <Image
//                   src={`${SETTINGS.URL_IMAGE}/${product.thumbnail}`}
//                   alt={product.product_name}
//                   width={80}
//                   height={80}
//                   className="rounded"
//                 />
//                 <div className="flex-1 ml-4">
//                   <h3 className="font-medium">{product.product_name}</h3>
//                   <p className="text-sm text-gray-500">
//                     Số lượng: {product.quantity}
//                   </p>
//                 </div>
//                 <div className="text-right">
//                   <p className="font-medium">
//                     {product.price.toLocaleString()}₫
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Phương thức thanh toán */}
//           <div className="bg-white shadow-md rounded p-4 mb-6">
//             <h2 className="text-lg font-medium mb-4">Phương thức thanh toán</h2>
//             <div className="flex flex-col space-y-4">
//               <label className="flex items-center">
//                 <input
//                   type="radio"
//                   name="paymentMethod"
//                   value="cod"
//                   onChange={() => handlePaymentSelect("cod")}
//                   className="mr-2"
//                 />
//                 Thanh toán khi nhận hàng (COD)
//               </label>
//               <label className="flex items-center">
//                 <input
//                   type="radio"
//                   name="paymentMethod"
//                   value="bankTransfer"
//                   onChange={() => handlePaymentSelect("bankTransfer")}
//                   className="mr-2"
//                 />
//                 Chuyển khoản ngân hàng
//               </label>
//               <label className="flex items-center">
//                 <input
//                   type="radio"
//                   name="paymentMethod"
//                   value="creditCard"
//                   onChange={() => handlePaymentSelect("creditCard")}
//                   className="mr-2"
//                 />
//                 Thanh toán bằng thẻ tín dụng
//               </label>
//             </div>
//             {selectedPayment && (
//               <div className="mt-4 text-sm text-gray-600">
//                 <p>
//                   <strong>Phương thức đã chọn:</strong>{" "}
//                   {selectedPayment === "cod"
//                     ? "Thanh toán khi nhận hàng"
//                     : selectedPayment === "bankTransfer"
//                     ? "Chuyển khoản ngân hàng"
//                     : "Thanh toán bằng thẻ tín dụng"}
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Form nhập thông tin */}
//           <div className="bg-white shadow-md rounded p-4">
//             <h2 className="text-lg font-medium mb-4">Thông tin giao hàng</h2>
//             <form>
//               <div className="mb-4">
//                 <label
//                   htmlFor="address"
//                   className="block text-sm font-medium text-gray-700"
//                 >
//                   Địa chỉ giao hàng
//                 </label>
//                 <input
//                   type="text"
//                   id="address"
//                   value={address}
//                   onChange={(e) => setAddress(e.target.value)}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                   placeholder="Nhập địa chỉ"
//                 />
//               </div>
//               <div className="mb-4">
//                 <label
//                   htmlFor="name"
//                   className="block text-sm font-medium text-gray-700"
//                 >
//                   Họ và tên
//                 </label>
//                 <input
//                   type="text"
//                   id="name"
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                   placeholder="Nhập họ và tên"
//                 />
//               </div>
//               <div className="mb-4">
//                 <label
//                   htmlFor="phone"
//                   className="block text-sm font-medium text-gray-700"
//                 >
//                   Số điện thoại
//                 </label>
//                 <input
//                   type="text"
//                   id="phone"
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                   placeholder="Nhập số điện thoại"
//                 />
//               </div>
//             </form>
//           </div>
//         </div>

//         {/* Phần bên phải */}
//         <div className="w-full lg:w-1/3 px-4">
//           <div className="bg-white shadow-md rounded p-4">
//             <h2 className="text-lg font-medium mb-4">Chi tiết thanh toán</h2>
//             <div className="flex justify-between mb-2">
//               <span>Tổng tiền hàng</span>
//               <span>{totalAmount - shippingCost}₫</span>
//             </div>
//             <div className="flex justify-between mb-2">
//               <span>Phí vận chuyển</span>
//               <span>{shippingCost.toLocaleString()}₫</span>
//             </div>
//             <div className="border-t pt-2 flex justify-between font-medium">
//               <span>Tổng cộng</span>
//               <span>{totalAmount.toLocaleString()}₫</span>
//             </div>
//             <button className="mt-4 w-full bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600">
//               Đặt hàng
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CheckoutPage;

import Checkout from "@/components/Checkout";
import React from "react";

const CheckoutPage = () => {
  return (
    <div>
      <Checkout />
    </div>
  );
};

export default CheckoutPage;
