"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { SETTINGS } from "@/config/settings";

interface TrackingEvent {
  status: number;
  description: string;
  timestamp: string;
}

interface Order {
  _id: string;
  orderCode: string;
  order_status: number;
  trackingHistory?: TrackingEvent[];
  orderStatusTitle: string;
}

const OrderTracking = () => {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    if (!id) {
      console.error("Không có id để lấy đơn hàng");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${SETTINGS.URL_API}/v1/orders/${id}`);
      console.log("Dữ liệu từ API:", res.data);
      setOrder(res.data || null);
    } catch (error: any) {
      console.error("Lỗi khi lấy lộ trình đơn hàng:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const intervalId = setInterval(fetchOrder, 30000);
    return () => clearInterval(intervalId);
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600">Đang tải...</p>
      </div>
    );

  if (!order)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600">Không tìm thấy đơn hàng.</p>
      </div>
    );

  const statusDescriptions: { [key: number]: string } = {
    1: "Đơn hàng đã được đặt",
    2: "Đơn hàng đang được giao",
    3: "Đơn hàng đã giao",
    4: "Đơn hàng đã bị hủy",
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl sm:text-4xl font-bold text-secondary mb-8 text-center">
        Lộ Trình Đơn Hàng
      </h1>
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200">
        <p className="text-lg font-semibold text-secondary mb-4">
          Mã đơn hàng: <span className="text-primary">{order.orderCode}</span>
        </p>
        <p className="text-sm text-gray-600 mb-6">
          Trạng thái hiện tại:{" "}
          <span
            className={`font-semibold ${order.orderStatusTitle === "Pending" ? "text-yellow-500" : "text-green-500"}`}
          >
            {order.orderStatusTitle}
          </span>
        </p>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          {Array.isArray(order.trackingHistory) && order.trackingHistory.length > 0 ? (
            order.trackingHistory.map((event, index) => (
              <div key={index} className="relative flex items-start mb-6">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center z-10">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <div className="ml-6">
                  <p className="text-sm font-semibold text-secondary">
                    {statusDescriptions[event.status] || "Trạng thái không xác định"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(event.timestamp).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 ml-6">Chưa có lộ trình cho đơn hàng này.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;