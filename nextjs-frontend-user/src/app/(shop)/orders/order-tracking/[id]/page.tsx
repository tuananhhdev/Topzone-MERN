"use client";

import { useState, useEffect, JSX } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { SETTINGS } from "@/config/settings";

interface TrackingEvent {
  status: number;
  description: string;
  timestamp: string;
}

interface Order {
  _id: string;
  order_code?: string;
  order_status: number;
  trackingHistory?: TrackingEvent[];
  orderStatusTitle: string;
}

interface ErrorResponse {
  message?: string;
  status?: number;
  data?: unknown;
}

const OrderTracking = () => {
  const params = useParams();
  const { data: session, status } = useSession();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);

  const fetchOrder = async () => {
    if (!id) {
      console.error("Không có id để lấy đơn hàng");
      setLoading(false);
      return;
    }

    if (status !== "authenticated" || !session?.user?.accessToken) {
      console.error("Người dùng chưa đăng nhập hoặc không có token");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${SETTINGS.URL_API}/v1/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      });
      setOrder(res.data.data || null);
      setTimeout(() => {
        setAnimationComplete(true);
      }, 500);
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorDetails: ErrorResponse = {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      };

      console.error("Lỗi khi lấy lộ trình đơn hàng:", errorDetails);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const intervalId = setInterval(fetchOrder, 30000);
    return () => clearInterval(intervalId);
  }, [id, session, status]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-black mt-4">
            Đang tải thông tin đơn hàng...
          </p>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center border border-gray-300">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-black mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-gray-700 font-medium">
            Vui lòng kiểm tra lại mã đơn hàng hoặc đăng nhập để xem thông tin
            chi tiết.
          </p>
        </div>
      </div>
    );

  // Cập nhật trạng thái theo yêu cầu
  const statusDescriptions: { [key: number]: string } = {
    1: "Xác nhận đơn hàng",
    2: "Đang chuẩn bị hàng",
    3: "Sẵn sàng giao hàng",
    4: "Đang vận chuyển",
    5: "Đã giao hàng",
    6: "Đơn hàng đã hủy",
  };

  // Cập nhật icon với icon mới cho "Đang vận chuyển" và "Đã giao hàng"
  const statusIcons: { [key: number]: JSX.Element } = {
    1: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    2: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0l-8 4-8-4"
        />
      </svg>
    ),
    3: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    4: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
         className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
        />
      </svg>
    ),
    5: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m-9 2H5a2 2 0 00-2 2v6a2 2 0 002 2h1m5 0a2 2 0 100-4 2 2 0 000 4zm5 0a2 2 0 100-4 2 2 0 000 4zM16 11V7a4 4 0 00-8 0v4"
        />
      </svg>
    ),
    6: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  const currentStatus = order.order_status;
  // Cập nhật mainSteps để bao gồm các trạng thái chính (trừ "Đơn hàng đã hủy")
  const mainSteps = [1, 2, 3, 4, 5];

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Order Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-300 mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <p className="text-xl font-bold text-black mb-1">
                Mã đơn hàng:{" "}
                <span className="text-black">{order.order_code || "N/A"}</span>
              </p>
              <p className="text-base font-medium text-black">
                Cập nhật lần cuối:{" "}
                <span className="text-black">
                  {new Date().toLocaleString("vi-VN")}
                </span>
              </p>
            </div>
            <div className="mt-3 sm:mt-0 flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-300">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  currentStatus === 6
                    ? "bg-red-500"
                    : currentStatus === 5
                      ? "bg-green-500"
                      : "bg-black"
                }`}
              ></div>
              <span
                className={`font-bold ${
                  currentStatus === 6
                    ? "text-red-500"
                    : currentStatus === 5
                      ? "text-green-600"
                      : "text-black"
                }`}
              >
                {order.orderStatusTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-300 mb-10">
          <h2 className="text-2xl font-bold text-black mb-6 text-center">
            Lộ Trình Đơn Hàng
          </h2>
          <div className="relative">
            <div className="absolute top-7 left-0 right-0 h-1 bg-gray-300"></div>
            <div
              className="absolute top-7 left-0 h-1 bg-black transition-all duration-1000 ease-out"
              style={{
                width:
                  animationComplete &&
                  (currentStatus === 1
                    ? "20%"
                    : currentStatus === 2
                      ? "40%"
                      : currentStatus === 3
                        ? "60%"
                        : currentStatus === 4
                          ? "80%"
                          : currentStatus >= 5
                            ? "100%"
                            : "0%"),
              }}
            ></div>

            <div className="flex justify-between relative">
              {mainSteps.map((step, index) => {
                const isActive = currentStatus >= step;
                const isCurrent = currentStatus === step;
                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        isActive
                          ? "bg-black text-white shadow-lg transform transition-all duration-500"
                          : "bg-white text-gray-600 border-2 border-gray-300 transition-all duration-500"
                      } ${isCurrent ? "scale-110" : ""}`}
                      style={{ transitionDelay: `${index * 300}ms` }}
                    >
                      {statusIcons[step]}
                    </div>
                    <p
                      className={`mt-3 text-sm font-bold ${
                        isActive ? "text-black" : "text-gray-500"
                      }`}
                      style={{ transitionDelay: `${index * 300}ms` }}
                    >
                      {statusDescriptions[step]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Timeline Chi tiết dưới với icon bên cạnh */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-300 mb-10">
          <h3 className="text-xl font-bold text-black mb-6 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
            Chi tiết lộ trình đơn hàng
          </h3>
          <div className="relative">
            {Array.isArray(order.trackingHistory) &&
              order.trackingHistory.length > 0 &&
              order.trackingHistory.map((event, index) => {
                const isActive = event.status <= currentStatus;
                const isCanceled = currentStatus === 6 && event.status === 6;
                const isLastEvent = index === order.trackingHistory.length - 1;
                const lineHeightClass = isLastEvent ? "h-0" : "bottom-0";

                return (
                  <div key={index} className="relative">
                    <div
                      className={`absolute left-6 top-0 ${lineHeightClass} w-0.5 z-0 transition-all duration-500 ${
                        isActive
                          ? isCanceled
                            ? "bg-red-500"
                            : "bg-black"
                          : "bg-gray-300"
                      }`}
                      style={{ transitionDelay: `${index * 200}ms` }}
                    ></div>
                    <div
                      className={`relative flex items-start mb-8 ${
                        animationComplete
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-4"
                      } transition-all duration-500`}
                      style={{ transitionDelay: `${index * 200}ms` }}
                    >
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                          isActive
                            ? isCanceled
                              ? "bg-red-500 text-white"
                              : "bg-black text-white"
                            : "bg-gray-200 text-gray-500"
                        } transition-all duration-500`}
                        style={{ transitionDelay: `${index * 200}ms` }}
                      >
                        {statusIcons[event.status] || (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-6 w-6 ${
                              isActive ? "text-white" : "text-gray-500"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6l4 2"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="ml-6 p-4 rounded-lg shadow-sm border border-gray-200 flex-1">
                        <div className="flex justify-between items-start">
                          <p
                            className={`text-base font-bold ${
                              isActive ? "text-black" : "text-gray-500"
                            }`}
                          >
                            {statusDescriptions[event.status] ||
                              "Trạng thái không xác định"}
                          </p>
                          <p className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {new Date(event.timestamp).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        {event.description && (
                          <p className="text-sm font-medium text-gray-700 mt-2">
                            {event.description}
                          </p>
                        )}
                        {index === 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-semibold text-black">
                              {currentStatus < 5
                                ? "Đơn hàng của bạn đang được xử lý"
                                : "Cảm ơn bạn đã mua hàng!"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

            {(!Array.isArray(order.trackingHistory) ||
              order.trackingHistory.length === 0) && (
              <div
                className={`relative flex items-start mb-6 ${
                  animationComplete ? "opacity-100" : "opacity-0"
                } transition-all duration-500`}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center z-10 bg-gray-200 text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-6 p-4 rounded-lg shadow-sm border border-gray-200 flex-1">
                  <p className="text-base font-bold text-black">
                    Chưa có thông tin lộ trình
                  </p>
                  <p className="text-sm font-medium text-gray-700 mt-2">
                    Chúng tôi sẽ cập nhật thông tin lộ trình đơn hàng của bạn
                    ngay khi có tin mới.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg flex items-center justify-between border border-gray-300">
          <p className="text-base font-bold text-black">
            Cần hỗ trợ về đơn hàng?
          </p>
          <button className="px-4 py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition shadow-sm">
            Liên hệ hỗ trợ
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
