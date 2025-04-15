"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { SETTINGS } from "@/config/settings";
import DeleteOrder from "@/components/DeleteOrder";
import EmptyOrders from "@/components/EmptyOrders";

interface OrderItem {
  product_name: string;
  thumbnail: string;
  quantity: number;
  price: number;
  discount: number;
  price_end: number;
  _id: string;
  id: string;
}

interface Order {
  _id: string;
  customer: {
    _id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
  order_status: number;
  payment_type: number;
  order_date: string;
  require_date: string | null;
  shipping_date: string | null;
  street: string;
  city: string;
  state: string;
  order_items: OrderItem[];
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
  orderStatusTitle: string;
  paymentTypeTitle: string;
  orderCode: string;
}

const MyOrders = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        if (!session?.user.accessToken) {
          throw new Error("Thiếu access token");
        }
        // Kiểm tra token hợp lệ
        const tokenParts = session.user.accessToken.split(".");
        if (tokenParts.length !== 3) {
          throw new Error("Token không hợp lệ: định dạng không đúng");
        }

        const res = await axios.get(`${SETTINGS.URL_API}/v1/orders/customer`, {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        });
        setOrders(res.data.data || []);
      } catch (err: any) {
        console.error("Lỗi khi lấy đơn hàng:", err);
        setError(err.message || "Lỗi khi lấy danh sách đơn hàng");
        if (
          err.message === "Thiếu access token" ||
          err.message.includes("Token không hợp lệ") ||
          err.response?.status === 401
        ) {
          alert("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, session, router]);

  const handleOrderDeleted = (orderId: string) => {
    setOrders(orders.filter((order) => order._id !== orderId));
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-xl text-gray-300">Đang tải...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-xl text-red-400">{error}</p>
      </div>
    );

  if (!orders.length) return <EmptyOrders />;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-extrabold text-center mb-12">
          Đơn Hàng Của Tôi
        </h1>
        {/* Responsive grid: 1 cột trên mobile, 2 cột trên md, 3 cột trên lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 flex flex-col overflow-hidden"
            >
              {/* Header Card */}
              <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">
                    {order.orderCode}
                  </h2>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.orderStatusTitle === "Pending"
                        ? "bg-yellow-500 text-gray-900"
                        : order.orderStatusTitle === "Đã hủy"
                        ? "bg-red-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {order.orderStatusTitle}
                  </span>
                </div>
                <p className="text-sm opacity-80">
                  Ngày đặt:{" "}
                  {new Date(order.order_date).toLocaleDateString("vi-VN")}
                </p>
              </div>

              {/* Nội dung card: tổng tiền và sản phẩm */}
              <div className="p-4 flex-grow flex flex-col">
                <div className="mb-4">
                  <p className="text-sm">
                    Tổng tiền:{" "}
                    <span className="font-bold text-red-400">
                      {order.order_items
                        .reduce(
                          (sum, item) => sum + item.price_end * item.quantity,
                          0
                        )
                        .toLocaleString("vi-VN")}{" "}
                      VNĐ
                    </span>
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="text-md font-semibold mb-2">
                    Mặt hàng
                  </h3>
                  {/* Danh sách sản phẩm dạng slider (scroll ngang) */}
                  <div className="flex space-x-4 overflow-x-auto pb-2">
                    {order.order_items.map((item) => (
                      <div
                        key={item._id || item.id}
                        className="min-w-[120px] flex-shrink-0 bg-gray-700 rounded-lg p-2 shadow-sm border border-gray-600"
                      >
                        {item.thumbnail ? (
                          <Image
                            src={`${SETTINGS.URL_IMAGE}/${item.thumbnail}`}
                            alt={item.product_name}
                            width={100}
                            height={100}
                            className="object-contain rounded-md"
                            unoptimized
                          />
                        ) : (
                          <div className="w-24 h-24 flex items-center justify-center bg-gray-600 rounded-md text-gray-400 text-sm">
                            No Image
                          </div>
                        )}
                        <p className="mt-2 text-xs font-bold">
                          {item.product_name}
                        </p>
                        <p className="text-xs">
                          x {item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thông tin khách hàng cơ bản */}
                <div className="border-t border-gray-700 pt-4 mt-auto">
                  <p className="text-sm">
                    <span className="font-semibold">Khách:</span> {order.customer.first_name} {order.customer.last_name}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">ĐT:</span> {order.customer.phone}
                  </p>
                </div>
              </div>

              {/* Footer Card - các hành động */}
              <div className="p-4 border-t border-gray-700 flex items-center justify-between">
                <Link href={`/orders/order-tracking/${order._id}`}>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-medium rounded-lg">
                    Theo dõi
                  </button>
                </Link>
                <DeleteOrder
                  orderId={order._id}
                  onDelete={handleOrderDeleted}
                  token={session?.user.accessToken || ""}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
