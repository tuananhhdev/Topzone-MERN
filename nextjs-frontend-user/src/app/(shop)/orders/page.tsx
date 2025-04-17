"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { SETTINGS } from "@/config/settings";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import Image from "next/image";
import { formatToVND } from "@/helpers/formatPrice";
import ReceivedModal from "@/components/ReceivedModal";

interface OrderItem {
  product_name: string;
  thumbnail: string;
  quantity: number;
  price_end: number;
  _id: string;
}

interface TrackingEntry {
  status: number;
  description: string;
  timestamp: string;
}

interface Order {
  _id: string;
  order_code: string;
  order_items: OrderItem[];
  trackingHistory: TrackingEntry[];
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total_pages: number;
  total_records: number;
}

const getStatusText = (status: number): string => {
  switch (status) {
    case 1:
      return "Đang chờ xử lý";
    case 2:
      return "Đã xác nhận";
    case 3:
      return "Đang giao hàng";
    case 4:
      return "Đã giao hàng";
    case 5:
      return "Đã hoàn tất";
    default:
      return "Không xác định";
  }
};

const getStatusColor = (status: number): string => {
  switch (status) {
    case 1:
      return "bg-gray-500";
    case 2:
      return "bg-yellow-500";
    case 3:
      return "bg-blue-500";
    case 4:
      return "bg-green-500";
    case 5:
      return "bg-gray-700";
    default:
      return "bg-gray-400";
  }
};

const OrdersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [modal, setModal] = useState<{ orderId: string; product: OrderItem } | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [detailModal, setDetailModal] = useState<Order | null>(null);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [layout, setLayout] = useState<"grid" | "list" | "compact">("list");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<number[]>([]);
  const [filterDateRange, setFilterDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [filterPriceRange, setFilterPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: Infinity,
  });

  const fetchOrders = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const res = await axios.get(`${SETTINGS.URL_API}/v1/orders?page=${page}`, {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        });
        console.log("API Response:", res.data);
        console.log("res.data.data:", res.data.data);

        const fetchedOrders = Array.isArray(res.data.data.orders_list)
          ? res.data.data.orders_list
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];
        setOrders(fetchedOrders);
        setPagination(res.data.data.pagination || null);
        console.log("State orders after setOrders:", fetchedOrders);

        if (fetchedOrders.length === 0) {
          console.log("No orders returned from API.");
        } else {
          console.log("Orders fetched:", fetchedOrders);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError<{ message?: string }>;
          const errorMessage =
            axiosError.response?.data?.message || axiosError.message;
          setError(errorMessage);
          toast.error(errorMessage);
          if (axiosError.response?.status === 401) {
            console.log("Unauthorized - Redirecting to login");
            router.push("/login");
          }
        } else if (err instanceof Error) {
          setError(err.message);
          toast.error(err.message);
        } else {
          setError("Lỗi không xác định");
          toast.error("Lỗi không xác định");
        }
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [session, router]
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const tab = searchParams.get("tab");
    if (tab === "completed") {
      setActiveTab("completed");
    } else {
      setActiveTab("pending");
    }

    if (status === "authenticated") {
      fetchOrders(currentPage);
    }
  }, [status, session, router, searchParams, lastRefresh, currentPage, fetchOrders]);

  const handleOpenModal = (orderId: string, product: OrderItem) => {
    setModal({ orderId, product });
  };

  const handleCloseModal = () => {
    setModal(null);
    setLastRefresh(Date.now());
    fetchOrders(currentPage);
  };

  const handleCancelOrder = async (orderId: string) => {
    setCancelLoading(orderId);
    try {
      await axios.delete(`${SETTINGS.URL_API}/v1/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
      toast.success("Hủy đơn hàng thành công!");
      setLastRefresh(Date.now());
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message;
        toast.error(`Lỗi khi hủy đơn hàng: ${errorMessage}`);
      } else {
        toast.error("Lỗi không xác định khi hủy đơn hàng");
      }
    } finally {
      setCancelLoading(null);
    }
  };

  const handleTrackOrder = (orderId: string) => {
    router.push(`/orders/tracking/${orderId}`);
  };

  const pendingOrdersCount = Array.isArray(orders)
    ? orders.filter((order) => {
        const currentStatus =
          order.trackingHistory && order.trackingHistory.length > 0
            ? order.trackingHistory[order.trackingHistory.length - 1].status
            : 0;
        return currentStatus < 5;
      }).length
    : 0;

  const completedOrdersCount = Array.isArray(orders)
    ? orders.filter((order) => {
        const currentStatus =
          order.trackingHistory && order.trackingHistory.length > 0
            ? order.trackingHistory[order.trackingHistory.length - 1].status
            : 0;
        return currentStatus === 5;
      }).length
    : 0;

  const filteredOrders = Array.isArray(orders)
    ? orders
        .filter((order) => {
          const currentStatus =
            order.trackingHistory && order.trackingHistory.length > 0
              ? order.trackingHistory[order.trackingHistory.length - 1].status
              : 0;

          if (activeTab === "pending") {
            return currentStatus < 5;
          }
          return currentStatus === 5;
        })
        .filter((order) => {
          if (!searchQuery) return true;
          const query = searchQuery.toLowerCase();
          return (
            (order.order_code && order.order_code.toLowerCase().includes(query)) ||
            order.order_items.some((item) =>
              item.product_name.toLowerCase().includes(query)
            )
          );
        })
        .filter((order) => {
          const currentStatus =
            order.trackingHistory && order.trackingHistory.length > 0
              ? order.trackingHistory[order.trackingHistory.length - 1].status
              : 0;
          if (filterStatus.length > 0 && !filterStatus.includes(currentStatus)) {
            return false;
          }
          return true;
        })
        .filter((order) => {
          const orderDate = new Date(order.createdAt).getTime();
          const startDate = filterDateRange.start
            ? new Date(filterDateRange.start).getTime()
            : -Infinity;
          const endDate = filterDateRange.end
            ? new Date(filterDateRange.end).getTime()
            : Infinity;
          return orderDate >= startDate && orderDate <= endDate;
        })
        .filter((order) => {
          const totalPrice = order.order_items.reduce(
            (sum, item) => sum + item.price_end * item.quantity,
            0
          );
          return totalPrice >= filterPriceRange.min && totalPrice <= filterPriceRange.max;
        })
        .sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        })
    : [];

  const handleClearFilters = () => {
    setFilterStatus([]);
    setFilterDateRange({ start: "", end: "" });
    setFilterPriceRange({ min: 0, max: Infinity });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] text-white">
        <ClipLoader color="#ffffff" size={50} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] text-white">
        <div className="bg-[#2d2d2d] p-6 rounded-lg shadow-lg">
          <p className="text-xl text-red-400">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       

        <div className="flex flex-col sm:flex-row justify-between mt-12 mb-6 gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-[#2d2d2d] text-white border border-[#4b4b4b] rounded-lg focus:outline-none focus:border-[#5c5c5c] transition"
            />
            <svg
              className="absolute right-3 top-3 h-5 w-5 text-[#6b7280]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setFilterModalOpen(true)}
              className="px-4 py-2 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span>Bộ lọc nâng cao</span>
            </button>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
              className="px-4 py-2 bg-[#2d2d2d] text-white border border-[#4b4b4b] rounded-lg focus:outline-none focus:border-[#5c5c5c] transition"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
            <div className="flex space-x-2">
              <button
                onClick={() => setLayout("grid")}
                className={`px-3 py-2 rounded-lg ${
                  layout === "grid"
                    ? "bg-[#4b4b4b] text-white"
                    : "bg-[#2d2d2d] text-[#d1d5db] hover:bg-[#3a3a3a]"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <button
                onClick={() => setLayout("list")}
                className={`px-3 py-2 rounded-lg ${
                  layout === "list"
                    ? "bg-[#4b4b4b] text-white"
                    : "bg-[#2d2d2d] text-[#d1d5db] hover:bg-[#3a3a3a]"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h18M3 3v18M3 3l6 6m12-6v18m0 0l-6-6"
                  />
                </svg>
              </button>
              <button
                onClick={() => setLayout("compact")}
                className={`px-3 py-2 rounded-lg ${
                  layout === "compact"
                    ? "bg-[#4b4b4b] text-white"
                    : "bg-[#2d2d2d] text-[#d1d5db] hover:bg-[#3a3a3a]"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2 font-medium transition-colors duration-300 rounded-l-lg border border-r-0 border-[#4b4b4b] flex items-center space-x-2 ${
              activeTab === "pending"
                ? "bg-[#4b4b4b] text-white"
                : "bg-[#2d2d2d] text-[#d1d5db] hover:bg-[#3a3a3a]"
            }`}
          >
            <span>Đang xử lý</span>
            <span className="bg-[#5c5c5c] text-white text-xs font-semibold px-2 py-1 rounded-full">
              {pendingOrdersCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-2 font-medium transition-colors duration-300 rounded-r-lg border border-[#4b4b4b] flex items-center space-x-2 ${
              activeTab === "completed"
                ? "bg-[#4b4b4b] text-white"
                : "bg-[#2d2d2d] text-[#d1d5db] hover:bg-[#3a3a3a]"
            }`}
          >
            <span>Đã hoàn tất</span>
            <span className="bg-[#5c5c5c] text-white text-xs font-semibold px-2 py-1 rounded-full">
              {completedOrdersCount}
            </span>
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center text-[#6b7280] py-12">
            <svg
              className="mx-auto h-12 w-12 text-[#6b7280] mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h18M3 3v18M3 3l6 6m12-6v18m0 0l-6-6"
              />
            </svg>
            <p className="text-lg mb-4">Không có đơn hàng nào trong trạng thái này.</p>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition"
            >
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div
            className={`${
              layout === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : layout === "list"
                ? "space-y-6"
                : "space-y-4"
            }`}
          >
            {filteredOrders.map((order) => {
              const currentStatus =
                order.trackingHistory && order.trackingHistory.length > 0
                  ? order.trackingHistory[order.trackingHistory.length - 1].status
                  : 0;

              if (layout === "compact") {
                return (
                  <div
                    key={order._id}
                    className="bg-[#2d2d2d] rounded-xl p-4 shadow-lg border border-[#4b4b4b] hover:border-[#5c5c5c] transition-all duration-300 flex justify-between items-center animate-fade-in"
                  >
                    <div>
                      <h2 className="text-base font-semibold">
                        Mã đơn hàng: {order.order_code || order._id}
                      </h2>
                      <span
                        className={`px-3 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(
                          currentStatus
                        )}`}
                      >
                        {getStatusText(currentStatus)}
                      </span>
                      <p className="text-sm text-[#6b7280] mt-1">
                        Tổng tiền: {formatToVND(
                          order.order_items.reduce(
                            (sum, item) => sum + item.price_end * item.quantity,
                            0
                          )
                        )}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleTrackOrder(order._id)}
                        className="px-3 py-1 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition-colors duration-300 text-sm flex items-center space-x-1"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 20l-5.447-2.724A2 2 0 012 15.382V6.618a2 2 0 011.553-1.894L9 2m0 18l6-3m-6 3V2m6 15l5.447-2.724A2 2 0 0021 12.382V3.618a2 2 0 00-1.553-1.894L15 0m0 0v15"
                          />
                        </svg>
                        <span>Theo dõi</span>
                      </button>
                      <button
                        onClick={() => setDetailModal(order)}
                        className="px-3 py-1 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition-colors duration-300 text-sm"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                );
              }

              if (layout === "grid") {
                return (
                  <div
                    key={order._id}
                    className="bg-[#2d2d2d] rounded-xl p-6 shadow-lg border border-[#4b4b4b] hover:border-[#5c5c5c] transition-all duration-300 animate-fade-in"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-semibold">
                          Mã đơn hàng: {order.order_code || order._id}
                        </h2>
                        <span
                          className={`px-3 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(
                            currentStatus
                          )}`}
                        >
                          {getStatusText(currentStatus)}
                        </span>
                      </div>
                    </div>
                    {order.order_items && order.order_items.length > 0 ? (
                      order.order_items.slice(0, 1).map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center space-x-4 mb-4"
                        >
                          <div className="w-16 h-16 flex items-center justify-center bg-[#3a3a3a] rounded-lg">
                            {item.thumbnail ? (
                              <Image
                                src={`${SETTINGS.URL_IMAGE}/${item.thumbnail}`}
                                alt={item.product_name}
                                width={64}
                                height={64}
                                className="object-contain rounded-lg"
                                unoptimized
                              />
                            ) : (
                              <span className="text-[#6b7280] text-sm">Không có ảnh</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-base font-medium text-white">
                              {item.product_name}
                            </h3>
                            <p className="text-sm text-[#6b7280]">
                              Số lượng: {item.quantity} | Giá: {formatToVND(item.price_end * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#6b7280] mb-4">Không có sản phẩm trong đơn hàng.</p>
                    )}
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleTrackOrder(order._id)}
                        className="px-3 py-1 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition-colors duration-300 text-sm flex items-center space-x-1"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 20l-5.447-2.724A2 2 0 012 15.382V6.618a2 2 0 011.553-1.894L9 2m0 18l6-3m-6 3V2m6 15l5.447-2.724A2 2 0 0021 12.382V3.618a2 2 0 00-1.553-1.894L15 0m0 0v15"
                          />
                        </svg>
                        <span>Theo dõi</span>
                      </button>
                      <button
                        onClick={() => setDetailModal(order)}
                        className="px-3 py-1 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition-colors duration-300 text-sm"
                      >
                        Xem chi tiết
                      </button>
                      {currentStatus === 1 && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancelLoading === order._id}
                          className={`px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 text-sm flex items-center ${
                            cancelLoading === order._id ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {cancelLoading === order._id ? (
                            <>
                              <ClipLoader color="#ffffff" size={16} className="mr-2" />
                              Đang hủy...
                            </>
                          ) : (
                            "Hủy đơn hàng"
                          )}
                        </button>
                      )}
                      {currentStatus === 4 && activeTab === "pending" && (
                        <button
                          onClick={() => handleOpenModal(order._id, order.order_items[0])}
                          className="px-3 py-1 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition-colors duration-300 text-sm"
                        >
                          Xác nhận nhận hàng
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={order._id}
                  className="bg-[#2d2d2d] rounded-xl p-6 shadow-lg border border-[#4b4b4b] hover:border-[#5c5c5c] transition-all duration-300 animate-fade-in"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-lg sm:text-xl font-semibold">
                        Mã đơn hàng: {order.order_code || order._id}
                      </h2>
                      <span
                        className={`px-3 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(
                          currentStatus
                        )}`}
                      >
                        {getStatusText(currentStatus)}
                      </span>
                    </div>
                    <p className="text-sm text-[#6b7280] mt-2 sm:mt-0">
                      Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      {[1, 2, 3, 4, 5].map((step) => (
                        <div key={step} className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                              step <= currentStatus ? "bg-green-500" : "bg-[#4b4b4b]"
                            }`}
                          >
                            {step}
                          </div>
                          <p className="text-xs text-[#6b7280] mt-2 text-center">
                            {getStatusText(step)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="relative mt-2">
                      <div className="absolute top-4 w-full h-1 bg-[#4b4b4b]"></div>
                      <div
                        className="absolute top-4 h-1 bg-green-500"
                        style={{
                          width: `${((currentStatus - 1) / 4) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((item) => (
                      <div
                        key={item._id}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center py-4 border-t border-[#4b4b4b]"
                      >
                        <div className="col-span-1 sm:col-span-2 flex items-center space-x-4">
                          <div className="w-16 h-16 flex items-center justify-center bg-[#3a3a3a] rounded-lg">
                            {item.thumbnail ? (
                              <Image
                                src={`${SETTINGS.URL_IMAGE}/${item.thumbnail}`}
                                alt={item.product_name}
                                width={64}
                                height={64}
                                className="object-contain rounded-lg"
                                unoptimized
                              />
                            ) : (
                              <span className="text-[#6b7280] text-sm">Không có ảnh</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-medium text-white">
                              {item.product_name}
                            </h3>
                            <p className="text-sm text-[#6b7280]">
                              Số lượng: {item.quantity} | Giá: {formatToVND(item.price_end * item.quantity)}
                            </p>
                          </div>
                        </div>

                        <div className="col-span-1 flex justify-end space-x-2">
                          <button
                            onClick={() => handleTrackOrder(order._id)}
                            className="px-3 py-1 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition-colors duration-300 text-sm flex items-center space-x-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 20l-5.447-2.724A2 2 0 012 15.382V6.618a2 2 0 011.553-1.894L9 2m0 18l6-3m-6 3V2m6 15l5.447-2.724A2 2 0 0021 12.382V3.618a2 2 0 00-1.553-1.894L15 0m0 0v15"
                              />
                            </svg>
                            <span>Theo dõi</span>
                          </button>
                          <button
                            onClick={() => setDetailModal(order)}
                            className="px-3 py-1 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition-colors duration-300 text-sm"
                          >
                            Xem chi tiết
                          </button>
                          {currentStatus === 1 && (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              disabled={cancelLoading === order._id}
                              className={`px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 text-sm flex items-center ${
                                cancelLoading === order._id ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            >
                              {cancelLoading === order._id ? (
                                <>
                                  <ClipLoader color="#ffffff" size={16} className="mr-2" />
                                  Đang hủy...
                                </>
                              ) : (
                                "Hủy đơn hàng"
                              )}
                            </button>
                          )}
                          {currentStatus === 4 && activeTab === "pending" && (
                            <button
                              onClick={() => handleOpenModal(order._id, item)}
                              className="px-3 py-1 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition-colors duration-300 text-sm"
                            >
                              Xác nhận nhận hàng
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#6b7280] py-4">
                      Không có sản phẩm trong đơn hàng.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {pagination && pagination.total_pages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page
                    ? "bg-[#4b4b4b] text-white"
                    : "bg-[#2d2d2d] text-[#d1d5db] hover:bg-[#3a3a3a]"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {detailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2d2d2d] rounded-xl p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">
              Chi tiết đơn hàng (Mã: {detailModal.order_code || detailModal._id})
            </h2>
            <p className="text-sm text-[#6b7280] mb-4">
              Ngày đặt: {new Date(detailModal.createdAt).toLocaleDateString("vi-VN")}
            </p>
            <h3 className="text-lg font-medium mb-2">Sản phẩm</h3>
            {detailModal.order_items.map((item) => (
              <div key={item._id} className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-[#3a3a3a] rounded-lg">
                  {item.thumbnail ? (
                    <Image
                      src={`${SETTINGS.URL_IMAGE}/${item.thumbnail}`}
                      alt={item.product_name}
                      width={48}
                      height={48}
                      className="object-contain rounded-lg"
                      unoptimized
                    />
                  ) : (
                    <span className="text-[#6b7280] text-sm">Không có ảnh</span>
                  )}
                </div>
                <div>
                  <p className="text-white">{item.product_name}</p>
                  <p className="text-sm text-[#6b7280]">
                    Số lượng: {item.quantity} | Giá: {formatToVND(item.price_end * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
            <h3 className="text-lg font-medium mb-2">Lịch sử trạng thái</h3>
            <div className="max-h-48 overflow-y-auto">
              {detailModal.trackingHistory.map((entry, index) => (
                <div key={index} className="mb-2">
                  <p className="text-sm text-[#d1d5db]">
                    {new Date(entry.timestamp).toLocaleString("vi-VN")} -{" "}
                    <span className="font-medium">{entry.description}</span> ({getStatusText(entry.status)})
                  </p>
                </div>
              ))}
            </div>
            <p className="text-lg font-semibold mt-4">
              Tổng tiền: {formatToVND(
                detailModal.order_items.reduce(
                  (sum, item) => sum + item.price_end * item.quantity,
                  0
                )
              )}
            </p>
            <button
              onClick={() => setDetailModal(null)}
              className="mt-4 w-full px-4 py-2 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {modal && (
        <ReceivedModal
          orderId={modal.orderId}
          productId={modal.product._id}
          product={modal.product}
          onClose={handleCloseModal}
        />
      )}

      {filterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2d2d2d] rounded-xl p-6 max-w-lg w-full mx-4 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4">Bộ lọc nâng cao</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Trạng thái đơn hàng</h3>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((status) => (
                  <label key={status} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filterStatus.includes(status)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterStatus([...filterStatus, status]);
                        } else {
                          setFilterStatus(filterStatus.filter((s) => s !== status));
                        }
                      }}
                      className="form-checkbox bg-[#3a3a3a] border-[#4b4b4b] text-green-500 rounded focus:ring-0"
                    />
                    <span className="text-[#d1d5db]">{getStatusText(status)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Khoảng thời gian đặt hàng</h3>
              <div className="flex space-x-4">
                <input
                  type="date"
                  value={filterDateRange.start}
                  onChange={(e) =>
                    setFilterDateRange({ ...filterDateRange, start: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-[#3a3a3a] text-white border border-[#4b4b4b] rounded-lg focus:outline-none focus:border-[#5c5c5c] transition"
                />
                <input
                  type="date"
                  value={filterDateRange.end}
                  onChange={(e) =>
                    setFilterDateRange({ ...filterDateRange, end: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-[#3a3a3a] text-white border border-[#4b4b4b] rounded-lg focus:outline-none focus:border-[#5c5c5c] transition"
                />
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Khoảng giá tổng tiền (VNĐ)</h3>
              <div className="flex space-x-4">
                <input
                  type="number"
                  placeholder="Từ"
                  value={filterPriceRange.min === 0 ? "" : filterPriceRange.min}
                  onChange={(e) =>
                    setFilterPriceRange({
                      ...filterPriceRange,
                      min: e.target.value ? parseInt(e.target.value) : 0,
                    })
                  }
                  className="w-full px-4 py-2 bg-[#3a3a3a] text-white border border-[#4b4b4b] rounded-lg focus:outline-none focus:border-[#5c5c5c] transition"
                />
                <input
                  type="number"
                  placeholder="Đến"
                  value={filterPriceRange.max === Infinity ? "" : filterPriceRange.max}
                  onChange={(e) =>
                    setFilterPriceRange({
                      ...filterPriceRange,
                      max: e.target.value ? parseInt(e.target.value) : Infinity,
                    })
                  }
                  className="w-full px-4 py-2 bg-[#3a3a3a] text-white border border-[#4b4b4b] rounded-lg focus:outline-none focus:border-[#5c5c5c] transition"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Xóa bộ lọc
              </button>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="px-4 py-2 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;