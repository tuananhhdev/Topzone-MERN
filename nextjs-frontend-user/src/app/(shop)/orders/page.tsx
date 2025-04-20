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
import { useCartStore } from "@/stores/useCart";
import { Tooltip } from "react-tooltip";

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
  order_status: number;
  order_items: OrderItem[];
  trackingHistory: TrackingEntry[];
  createdAt: string;
  cancelReason?: string;
  order_note?: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

interface IProduct {
  price_end: number;
  _id: string;
  product_name: string;
  price: number;
  discount: number;
  thumbnail: string;
  slug: string;
  category: {
    _id: string;
    category_name: string;
    slug: string;
  };
  quantity: number;
}

const getStatusText = (status: number): string => {
  switch (status) {
    case 1: return "Đang chờ xử lý";
    case 2: return "Đã xác nhận";
    case 3: return "Đang giao hàng";
    case 4: return "Đã giao hàng";
    case 5: return "Đã hoàn tất";
    case 6: return "Đã hủy";
    default: return "Không xác định";
  }
};

const getStatusColor = (status: number): string => {
  switch (status) {
    case 1: return "bg-orange-500";
    case 2: return "bg-yellow-400";
    case 3: return "bg-blue-600";
    case 4: return "bg-green-400";
    case 5: return "bg-purple-500";
    case 6: return "bg-red-600";
    default: return "bg-gray-500";
  }
};

const OrdersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const addToCart = useCartStore((state) => state.addToCart);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "canceled">("pending");
  const [modal, setModal] = useState<{ orderId: string; product: OrderItem } | null>(null);
  const [cancelModal, setCancelModal] = useState<{ orderId: string } | null>(null);
  const [cancelReasons, setCancelReasons] = useState<string[]>([]);
  const [customCancelReason, setCustomCancelReason] = useState<string>("");
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [layout, setLayout] = useState<"grid" | "list" | "compact">("list");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [detailModal, setDetailModal] = useState<Order | null>(null);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<number[]>([]);
  const [tempFilterStatus, setTempFilterStatus] = useState<number[]>([]);
  const [filterDateRange, setFilterDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [tempFilterDateRange, setTempFilterDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [filterPriceRange, setFilterPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 10000000,
  });
  const [tempFilterPriceRange, setTempFilterPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 10000000,
  });
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState<number>(0);
  const [canceledOrdersCount, setCanceledOrdersCount] = useState<number>(0);
  const [searchCounts, setSearchCounts] = useState<{ pending: number; completed: number; canceled: number }>({
    pending: 0,
    completed: 0,
    canceled: 0,
  });
  const [orderNotes, setOrderNotes] = useState<{ [orderId: string]: string }>(
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("orderNotes") || "{}") : {}
  );
  const [noteModal, setNoteModal] = useState<{ orderId: string; note: string } | null>(null);
  const [newOrderNotification, setNewOrderNotification] = useState<boolean>(false);
  const [lastOrderCount, setLastOrderCount] = useState<number>(0);
  const [pendingTab, setPendingTab] = useState<"pending" | "completed" | "canceled" | null>(null);

  const cancelReasonOptions = [
    "Thay đổi ý định",
    "Sản phẩm không phù hợp",
    "Thông tin đặt hàng sai",
    "Khác",
  ];

  const fetchOrdersCount = useCallback(async () => {
    if (!session?.user.accessToken) return;
    try {
      const statuses = [
        { key: "pending", params: { order_status: "1,2,3,4", keyword: searchQuery } },
        { key: "completed", params: { order_status: "5", keyword: searchQuery } },
        { key: "canceled", params: { order_status: "6", keyword: searchQuery } },
      ];
      const requests = statuses.map(({ params }) =>
        axios.get(`${SETTINGS.URL_API}/v1/orders`, {
          params: { ...params, page: 1, limit: 1 },
          headers: { Authorization: `Bearer ${session.user.accessToken}` },
        })
      );
      const responses = await Promise.all(requests);
      const newPendingCount = responses[0].data.data.pagination?.totalRecords || 0;
      setPendingOrdersCount(newPendingCount);
      setCompletedOrdersCount(responses[1].data.data.pagination?.totalRecords || 0);
      setCanceledOrdersCount(responses[2].data.data.pagination?.totalRecords || 0);
      setSearchCounts({
        pending: newPendingCount,
        completed: responses[1].data.data.pagination?.totalRecords || 0,
        canceled: responses[2].data.data.pagination?.totalRecords || 0,
      });

      if (newPendingCount > lastOrderCount) {
        setNewOrderNotification(true);
      } else if (newPendingCount <= lastOrderCount) {
        setNewOrderNotification(false);
      }
      setLastOrderCount(newPendingCount);
    } catch (err) {
      console.error("Error fetching orders count:", err);
    }
  }, [session, searchQuery, lastOrderCount]);

  const handleReorder = async (items: OrderItem[]) => {
    try {
      for (const item of items) {
        const product: IProduct = {
          _id: item._id,
          product_name: item.product_name,
          price: item.price_end,
          price_end: item.price_end,
          discount: 0,
          thumbnail: item.thumbnail,
          slug: item.product_name.toLowerCase().replace(/\s+/g, "-"),
          category: { _id: "", category_name: "", slug: "" },
          quantity: item.quantity,
        };
        addToCart(product);
      }
      toast.success("Đã thêm sản phẩm vào giỏ hàng!", {
        icon: "✅",
        style: { background: "#2d2d2d", color: "#ffffff" },
      });
      router.push("/cart");
    } catch (err) {
      toast.error("Không thể thêm vào giỏ hàng!", {
        icon: "❌",
        style: { background: "#2d2d2d", color: "#ffffff" },
      });
    }
  };

  const fetchOrders = useCallback(
    async (page: number, tab: "pending" | "completed" | "canceled") => {
      if (!session?.user.accessToken) return;
      setLoading(true);
      setIsInitialLoad(false);
      try {
        const params: any = {
          page,
          sort: "createdAt",
          order: sortOrder === "newest" ? "DESC" : "ASC",
        };
        if (searchQuery) {
          params.keyword = searchQuery.trim().toLowerCase();
        }
        if (filterStatus.length > 0 && tab !== "canceled") {
          params.order_status = filterStatus.join(",");
        } else {
          if (tab === "pending") params.order_status = "1,2,3,4";
          else if (tab === "completed") params.order_status = "5";
          else if (tab === "canceled") params.order_status = "6";
        }
        if (filterDateRange.start) params.start_date = filterDateRange.start;
        if (filterDateRange.end) params.end_date = filterDateRange.end;
        if (filterPriceRange.min > 0) params.min_price = filterPriceRange.min;
        if (filterPriceRange.max < 10000000) params.max_price = filterPriceRange.max;
  
        const res = await axios.get(`${SETTINGS.URL_API}/v1/orders`, {
          params,
          headers: { Authorization: `Bearer ${session.user.accessToken}` },
        });
  
        const fetchedOrders = Array.isArray(res.data.data.orders_list)
          ? res.data.data.orders_list
          : [];
        setOrders(fetchedOrders);
        setPagination(res.data.data.pagination || null);
        setError(null);
        setFetchError(null);
      } catch (err: unknown) {
        console.error("Error fetching orders:", err);
        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError<{ message?: string }>;
          const errorMessage = axiosError.response?.data?.message || "Không thể tải đơn hàng, vui lòng thử lại! ⚠️";
          setFetchError(errorMessage);
          toast.error(errorMessage, {
            icon: "⚠️",
            style: { background: "#2d2d2d", color: "#ffffff" },
          });
          if (axiosError.response?.status === 401) {
            setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
            router.push("/login");
          }
        } else {
          setFetchError("Không thể tải đơn hàng, vui lòng thử lại! ⚠️");
          toast.error("Không thể tải đơn hàng, vui lòng thử lại! ⚠️", {
            icon: "⚠️",
            style: { background: "#2d2d2d", color: "#ffffff" },
          });
        }
        setOrders([]);
      } finally {
        setLoading(false);
        setPendingTab(null); // Xóa pendingTab khi hoàn tất
      }
    },
    [session, sortOrder, filterStatus, searchQuery, filterDateRange, filterPriceRange, router]
  );

  const handleAddNote = (orderId: string, note: string) => {
    const updatedNotes = { ...orderNotes, [orderId]: note };
    setOrderNotes(updatedNotes);
    localStorage.setItem("orderNotes", JSON.stringify(updatedNotes));
    setNoteModal(null);
    toast.success("Đã lưu ghi chú!", {
      icon: "📝",
      style: { background: "#2d2d2d", color: "#ffffff" },
    });
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user.accessToken) {
      fetchOrdersCount();
    }
  }, [status, session, fetchOrdersCount]);

  useEffect(() => {
    if (status === "unauthenticated") {
      setError("Vui lòng đăng nhập để xem đơn hàng!");
      router.push("/login");
      return;
    }
    const tab = searchParams.get("tab");
    const newTab = tab === "completed" ? "completed" : tab === "canceled" ? "canceled" : "pending";
    if (newTab !== activeTab) {
      setActiveTab(newTab);
      setCurrentPage(1);
      fetchOrders(1, newTab);
    } else if (status === "authenticated") {
      fetchOrders(currentPage, activeTab);
    }
  }, [status, session, searchParams, currentPage, activeTab, fetchOrders]);

const handleTabChange = (tab: "pending" | "completed" | "canceled") => {
  setPendingTab(tab); // Lưu tab đang chờ
  setActiveTab(tab);
  setCurrentPage(1);
  setOrders([]); // Xóa danh sách orders để tránh hiển thị dữ liệu cũ
  setNewOrderNotification(false);
  const params = new URLSearchParams(searchParams.toString());
  params.set("tab", tab);
  router.push(`/orders?${params.toString()}`, { scroll: false });
};

  const handleOpenModal = (orderId: string, product: OrderItem) => {
    setModal({ orderId, product });
  };

  const handleCloseModal = () => {
    setModal(null);
    setLastRefresh(Date.now());
    fetchOrders(currentPage, activeTab);
    fetchOrdersCount();
  };

  const handleOpenCancelModal = (orderId: string) => {
    setCancelModal({ orderId });
    setCancelReasons([]);
    setCustomCancelReason("");
  };

  const handleCloseCancelModal = () => {
    setCancelModal(null);
    setCancelReasons([]);
    setCustomCancelReason("");
  };

  const handleCancelOrder = async () => {
    if (!cancelModal || cancelReasons.length === 0) return;
    const orderId = cancelModal.orderId;
    const reason = cancelReasons.includes("Khác")
      ? [...cancelReasons.filter((r) => r !== "Khác"), customCancelReason].join(", ")
      : cancelReasons.join(", ");
    setCancelLoading(orderId);
    try {
      await axios.post(
        `${SETTINGS.URL_API}/v1/orders/cancel/${orderId}`,
        { cancelReason: reason },
        { headers: { Authorization: `Bearer ${session?.user.accessToken}` } }
      );
      toast.success("Hủy đơn hàng thành công!", {
        icon: "✅",
        style: { background: "#2d2d2d", color: "#ffffff" },
      });
      setLastRefresh(Date.now());
      fetchOrders(currentPage, activeTab);
      fetchOrdersCount();
      handleCloseCancelModal();
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || "Lỗi khi hủy đơn hàng, vui lòng thử lại!"
        : "Lỗi không xác định khi hủy đơn hàng";
      toast.error(`Lỗi: ${errorMessage}`, {
        icon: "❌",
        style: { background: "#2d2d2d", color: "#ffffff" },
      });
    } finally {
      setCancelLoading(null);
    }
  };

  const handleTrackOrder = (orderId: string) => {
    router.push(`/tracking/${orderId}`);
  };

  const handleApplyFilters = () => {
    setFilterStatus(tempFilterStatus);
    setFilterDateRange(tempFilterDateRange);
    setFilterPriceRange(tempFilterPriceRange);
    setFilterModalOpen(false);
    setCurrentPage(1);
    fetchOrders(1, activeTab);
    fetchOrdersCount();
  };

  const handleClearFilters = () => {
    setTempFilterStatus([]);
    setTempFilterDateRange({ start: "", end: "" });
    setTempFilterPriceRange({ min: 0, max: 10000000 });
  };

  const handleCloseFilterModal = () => {
    setTempFilterStatus(filterStatus);
    setTempFilterDateRange(filterDateRange);
    setTempFilterPriceRange(filterPriceRange);
    setFilterModalOpen(false);
  };

  const filteredOrders = orders
    .filter((order) => {
      if (activeTab === "pending") return order.order_status >= 1 && order.order_status <= 4;
      if (activeTab === "completed") return order.order_status === 5;
      if (activeTab === "canceled") return order.order_status === 6;
      return false;
    })
    .filter((order) => {
      if (!searchQuery) return true;
      const query = searchQuery.trim().toLowerCase();
      const orderCodeMatch = order.order_code?.toLowerCase().includes(query);
      const productNameMatch = order.order_items.some((item) =>
        item.product_name.toLowerCase().includes(query)
      );
      return orderCodeMatch || productNameMatch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center">
        <div className="bg-[#2d2d2d] p-6 rounded-lg shadow-lg text-center">
          <p className="text-lg sm:text-xl text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition text-sm sm:text-base"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-[#1a1a1a] text-white pt-20 sm:pt-24">
    <div className="max-w-full px-4 sm:max-w-7xl sm:mx-auto sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center truncate">
        Danh sách đơn hàng
      </h1>

      <div className="mb-6 flex space-x-4 overflow-x-auto">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Tìm kiếm mã đơn hàng hoặc tên sản phẩm..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
              fetchOrders(1, activeTab);
            }}
            className="w-full px-4 py-2 bg-[#2d2d2d] text-white border border-[#4b4b4b] rounded-lg focus:outline-none focus:border-[#5c5c5c] transition text-base"
          />
          <svg
            className="absolute right-3 top-3 h-5 w-5 text-[#6b7280]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button
          onClick={() => {
            setTempFilterStatus(filterStatus);
            setTempFilterDateRange(filterDateRange);
            setTempFilterPriceRange(filterPriceRange);
            setFilterModalOpen(true);
          }}
          className="px-3 sm:px-4 py-2 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition text-sm sm:text-base flex items-center space-x-1 sm:space-x-2 flex-shrink-0"
        >
          <svg
            className="w-4 sm:w-5 h-4 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
          className="px-3 sm:px-4 py-2 bg-[#2d2d2d] text-white border border-[#4b4b4b] rounded-lg focus:outline-none focus:border-[#5c5c5c] transition text-sm sm:text-base flex-shrink-0"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
        <div className="hidden sm:flex space-x-2 flex-shrink-0">
          <button
            onClick={() => setLayout("grid")}
            className={`px-2 py-2 rounded-lg ${layout === "grid" ? "bg-[#4b4b4b] text-white" : "bg-[#2d2d2d] text-[#d1d5db] hover:bg-[#3a3a3a]"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          <button
            onClick={() => setLayout("list")}
            className={`px-2 py-2 rounded-lg ${layout === "list" ? "bg-[#4b4b4b] text-white" : "bg-[#2d2d2d] text-[#d1d5db] hover:bg-[#3a3a3a]"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
          <button
            onClick={() => setLayout("compact")}
            className={`px-2 py-2 rounded-lg ${layout === "compact" ? "bg-[#4b4b4b] text-white" : "bg-[#2d2d2d] text-[#d1d5db] hover:bg-[#3a3a3a]"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
        <select
          value={layout}
          onChange={(e) => setLayout(e.target.value as "grid" | "list" | "compact")}
          className="sm:hidden px-3 py-2 bg-[#2d2d2d] text-white border border-[#4b4b4b] rounded-lg focus:outline-none focus:border-[#5c5c5c] transition text-sm flex-shrink-0"
        >
          <option value="grid">Lưới</option>
          <option value="list">Danh sách</option>
          <option value="compact">Gọn</option>
        </select>
      </div>

      <div className="flex justify-center mb-6 sm:mb-8 space-x-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange("pending")}
          disabled={loading}
          className={`relative flex-shrink-0 px-4 sm:px-6 py-2 text-sm sm:text-base font-medium rounded-l-lg border border-r-0 border-[#4b4b4b] flex items-center space-x-1 sm:space-x-2 ${
            activeTab === "pending" ? "bg-[#4b4b4b] text-white" : "bg-[#2d2d2d] text-[#d1d5db] hover:bg-[#3a3a3a]"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="truncate">Đang xử lý</span>
          <span className="bg-[#5c5c5c] text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            {searchQuery && searchCounts.pending > 0 ? searchCounts.pending : pendingOrdersCount}
          </span>
          {newOrderNotification && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => handleTabChange("completed")}
          disabled={loading}
          className={`flex-shrink-0 px-4 sm:px-6 py-2 text-sm sm:text-base font-medium border border-x-0 border-[#4b4b4b] flex items-center space-x-1 sm:space-x-2 ${
            activeTab === "completed" ? "bg-[#4b4b4b] text-white" : "bg-[#2d2d2d] text-[#d1d5db] hover:bg-[#3a3a3a]"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="truncate">Đã hoàn tất</span>
          <span className="bg-[#5c5c5c] text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            {searchQuery && searchCounts.completed > 0 ? searchCounts.completed : completedOrdersCount}
          </span>
        </button>
        <button
          onClick={() => handleTabChange("canceled")}
          disabled={loading}
          className={`flex-shrink-0 px-4 sm:px-6 py-2 text-sm sm:text-base font-medium rounded-r-lg border border-l-0 border-[#4b4b4b] flex items-center space-x-1 sm:space-x-2 ${
            activeTab === "canceled" ? "bg-[#4b4b4b] text-white" : "bg-[#2d2d2d] text-[#d1d5db] hover:bg-[#3a3a3a]"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="truncate">Đã hủy</span>
          <span className="bg-[#5c5c5c] text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            {searchQuery && searchCounts.canceled > 0 ? searchCounts.canceled : canceledOrdersCount}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 animate-pulse">
          <ClipLoader color="#ffffff" size={40} />
          <p className="text-base sm:text-lg text-[#6b7280] mt-4 flex items-center justify-center">
            {pendingTab === "pending" ? (
              <>
                <span className="mr-2 text-2xl">🚚</span> Đang tải danh sách đơn hàng đang xử lý...
              </>
            ) : pendingTab === "completed" ? (
              <>
                <span className="mr-2 text-2xl">✅</span> Đang tải danh sách đơn hàng đã hoàn tất...
              </>
            ) : pendingTab === "canceled" ? (
              <>
                <span className="mr-2 text-2xl">❌</span> Đang tải danh sách đơn hàng đã hủy...
              </>
            ) : null}
          </p>
        </div>
      ) : fetchError ? (
        <div className="text-center text-[#6b7280] py-12">
          <svg className="mx-auto h-12 w-12 text-[#6b7280] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-base sm:text-lg mb-4">{fetchError}</p>
          <button
            onClick={() => fetchOrders(currentPage, activeTab)}
            className="px-4 py-2 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition text-sm sm:text-base"
          >
            Thử lại
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center text-[#6b7280] py-12">
          <svg className="mx-auto h-12 w-12 text-[#6b7280] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18M3 3v18M3 3l6 6m12-6v18m0 0l-6-6" />
          </svg>
          <p className="text-base sm:text-lg mb-4">Không có đơn hàng nào trong trạng thái này.</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition text-sm sm:text-base"
          >
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className={layout === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : layout === "list" ? "space-y-4 sm:space-y-6" : "space-y-4"}>
          {filteredOrders.map((order) => {
            const currentStatus = order.order_status;
            const hasOrderNote = !!order.order_note;
            return (
              <div
                key={order._id}
                className="bg-[#2d2d2d] rounded-2xl p-4 sm:p-6 shadow-lg border border-[#4b4b4b] hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                  <h2 className={layout === "grid" || layout === "compact" ? "text-sm font-semibold truncate" : "text-sm sm:text-lg font-semibold truncate"}>
                    Mã đơn hàng: {order.order_code || order._id}
                  </h2>
                  <span className={`px-2 sm:px-3 py-1 text-xs font-medium text-white rounded-full shadow-sm hover:shadow-md transition ${getStatusColor(currentStatus)}`}>
                    {getStatusText(currentStatus)}
                  </span>
                </div>

                {currentStatus !== 6 && (
                  <div className={layout === "grid" ? "hidden" : "hidden sm:block mb-4 sm:mb-6"}>
                    <div className="flex items-center justify-between">
                      {[1, 2, 3, 4, 5].map((step) => (
                        <div key={step} className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-base ${step <= currentStatus ? "bg-green-500" : "bg-[#4b4b4b]"}`}>
                            {step}
                          </div>
                          <p className="text-xs text-[#6b7280] mt-2 text-center">{getStatusText(step)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="relative mt-2">
                      <div className="absolute top-4 w-full h-1 bg-[#4b4b4b]"></div>
                      <div className="absolute top-4 h-1 bg-green-500" style={{ width: `${((currentStatus - 1) / 4) * 100}%` }}></div>
                    </div>
                  </div>
                )}

                {currentStatus !== 6 && (
                  <div className={layout === "grid" ? "flex sm:hidden mb-3" : "sm:hidden flex items-center justify-between mb-3"}>
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div key={step} className="flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${step <= currentStatus ? "bg-green-500" : "bg-[#4b4b4b]"}`}>
                          {step}
                        </div>
                        <p className="text-[9px] text-[#6b7280] mt-1 hidden">{getStatusText(step)}</p>
                      </div>
                    ))}
                    <div className="absolute left-0 right-0 top-2 h-0.5 bg-[#4b4b4b]"></div>
                    <div className="absolute left-0 top-2 h-0.5 bg-green-500" style={{ width: `${((currentStatus - 1) / 4) * 100}%` }}></div>
                  </div>
                )}

                {order.order_items && order.order_items.length > 0 ? (
                  order.order_items.map((item) => (
                    <div
                      key={item._id}
                      className={layout === "grid" || layout === "compact" ? "flex items-center space-x-3 py-2 border-t border-[#4b4b4b]" : "flex items-center space-x-4 py-3 sm:py-4 border-t border-[#4b4b4b]"}
                    >
                      <div className={layout === "grid" || layout === "compact" ? "w-12 h-12 flex items-center justify-center bg-[#3a3a3a] rounded-lg border border-[#5c5c5c] shadow-sm" : "w-14 sm:w-16 h-14 sm:h-16 flex items-center justify-center bg-[#3a3a3a] rounded-lg border border-[#5c5c5c] shadow-sm"}>
                        {item.thumbnail ? (
                          <Image
                            src={`${SETTINGS.URL_IMAGE}/${item.thumbnail}`}
                            alt={item.product_name}
                            width={layout === "grid" || layout === "compact" ? 48 : 56}
                            height={layout === "grid" || layout === "compact" ? 48 : 56}
                            className="object-contain rounded-lg"
                            unoptimized
                          />
                        ) : (
                          <span className="text-[#6b7280] text-xs sm:text-sm">No img</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={layout === "grid" || layout === "compact" ? "text-sm font-medium text-white truncate" : "text-base sm:text-lg font-medium text-white truncate"}>
                          {item.product_name}
                        </h3>
                        <p className={layout === "grid" || layout === "compact" ? "text-xs text-[#6b7280]" : "text-xs sm:text-sm text-[#6b7280]"}>
                          SL: {item.quantity} | Giá: {formatToVND(item.price_end * item.quantity)}
                        </p>
                        {layout !== "grid" && layout !== "compact" && (
                          <p className="text-xs sm:text-sm text-[#6b7280] sm:hidden">
                            Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[#6b7280] py-4 text-sm sm:text-base">Không có sản phẩm trong đơn hàng.</p>
                )}

                {order.order_status === 6 && order.cancelReason && (
                  <div className="mt-3 text-sm text-[#d1d5db]">
                    <p><strong>Lý do hủy:</strong> {order.cancelReason}</p>
                  </div>
                )}

                <div className={layout === "grid" ? "flex sm:hidden space-x-2 overflow-x-auto mt-2" : layout === "compact" ? "flex sm:hidden space-x-2 overflow-x-auto mt-2" : "flex sm:hidden space-x-2 overflow-x-auto mt-3"}>
                  {order.order_status !== 6 && (
                    <button
                      onClick={() => handleTrackOrder(order._id)}
                      className={layout === "grid" || layout === "compact" ? "px-2 py-1 bg-[#4b4b4b] text-white rounded-full hover:bg-[#5c5c5c] transition-colors text-xs shadow-sm flex items-center space-x-1 flex-shrink-0" : "px-3 py-1.5 bg-[#4b4b4b] text-white rounded-full hover:bg-[#5c5c5c] transition-colors text-xs shadow-sm flex items-center space-x-1 flex-shrink-0"}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 012 15.382V6.618a2 2 0 011.553-1.894L9 2m0 18l6-3m-6 3V2m6 15l5.447-2.724A2 2 0 0021 12.382V3.618a2 2 0 00-1.553-1.894L15 0m0 0v15" />
                      </svg>
                      <span>Theo dõi</span>
                    </button>
                  )}
                  <button
                    onClick={() => setDetailModal(order)}
                    className={layout === "grid" || layout === "compact" ? "px-2 py-1 bg-[#4b4b4b] text-white rounded-full hover:bg-[#5c5c5c] transition-colors text-xs shadow-sm flex-shrink-0" : "px-3 py-1.5 bg-[#4b4b4b] text-white rounded-full hover:bg-[#5c5c5c] transition-colors text-xs shadow-sm flex-shrink-0"}
                  >
                    Chi tiết
                  </button>
                  {activeTab === "pending" && (
                    <button
                      onClick={() => setNoteModal({ orderId: order._id, note: orderNotes[order._id] || "" })}
                      disabled={hasOrderNote}
                      className={layout === "grid" || layout === "compact" ? `px-2 py-1 text-white rounded-full transition-colors text-xs shadow-sm flex-shrink-0 ${hasOrderNote ? "bg-[#6b7280] opacity-50 cursor-not-allowed" : "bg-[#4b4b4b] hover:bg-[#5c5c5c]"}` : `px-3 py-1.5 text-white rounded-full transition-colors text-xs shadow-sm flex-shrink-0 ${hasOrderNote ? "bg-[#6b7280] opacity-50 cursor-not-allowed" : "bg-[#4b4b4b] hover:bg-[#5c5c5c]"}`}
                      data-tooltip-id={`note-tooltip-${order._id}`}
                      data-tooltip-content={hasOrderNote ? "Đã thêm ghi chú!" : ""}
                    >
                      {orderNotes[order._id] || hasOrderNote ? "Sửa ghi chú" : "Thêm ghi chú"}
                    </button>
                  )}
                  <Tooltip id={`note-tooltip-${order._id}`} />
                  {currentStatus === 1 && activeTab === "pending" && (
                    <button
                      onClick={() => handleOpenCancelModal(order._id)}
                      disabled={cancelLoading === order._id}
                      className={layout === "grid" || layout === "compact" ? `px-2 py-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-xs shadow-sm flex items-center flex-shrink-0 ${cancelLoading === order._id ? "opacity-50 cursor-not-allowed" : ""}` : `px-3 py-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-xs shadow-sm flex items-center flex-shrink-0 ${cancelLoading === order._id ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {cancelLoading === order._id ? (
                        <>
                          <ClipLoader color="#ffffff" size={12} className="mr-1" />
                          Đang hủy...
                        </>
                      ) : (
                        "Hủy đơn"
                      )}
                    </button>
                  )}
                  {currentStatus === 4 && activeTab === "pending" && (
                    <button
                      onClick={() => handleOpenModal(order._id, order.order_items[0])}
                      className={layout === "grid" || layout === "compact" ? "px-2 py-1 bg-[#4b4b4b] text-white rounded-full hover:bg-[#5c5c5c] transition-colors text-xs shadow-sm flex-shrink-0" : "px-3 py-1.5 bg-[#4b4b4b] text-white rounded-full hover:bg-[#5c5c5c] transition-colors text-xs shadow-sm flex-shrink-0"}
                    >
                      Nhận hàng
                    </button>
                  )}
                  {order.order_status === 6 && (
                    <button
                      onClick={() => handleReorder(order.order_items)}
                      className={layout === "grid" || layout === "compact" ? "px-2 py-1 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors text-xs shadow-sm flex-shrink-0" : "px-3 py-1.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors text-xs shadow-sm flex-shrink-0"}
                    >
                      Đặt lại
                    </button>
                  )}
                </div>

                <div className={layout === "grid" ? "hidden sm:flex sm:justify-between sm:items-center sm:mt-2" : layout === "compact" ? "hidden sm:flex sm:justify-between sm:items-center sm:mt-2" : "hidden sm:flex sm:justify-between sm:items-center sm:mt-4"}>
                  <p className="text-sm text-[#6b7280]">
                    Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                  <div className="flex space-x-2">
                    {order.order_status !== 6 && (
                      <button
                        onClick={() => handleTrackOrder(order._id)}
                        className={layout === "grid" || layout === "compact" ? "px-2 py-1 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition-colors text-sm flex items-center space-x-1" : "px-3 py-1 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition-colors text-sm flex items-center space-x-1"}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 012 15.382V6.618a2 2 0 011.553-1.894L9 2m0 18l6-3m-6 3V2m6 15l5.447-2.724A2 2 0 0021 12.382V3.618a2 2 0 00-1.553-1.894L15 0m0 0v15" />
                        </svg>
                        <span>Theo dõi</span>
                      </button>
                    )}
                    <button
                      onClick={() => setDetailModal(order)}
                      className={layout === "grid" || layout === "compact" ? "px-2 py-1 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition-colors text-sm" : "px-3 py-1 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition-colors text-sm"}
                    >
                      Chi tiết
                    </button>
                    {activeTab === "pending" && (
                      <button
                        onClick={() => setNoteModal({ orderId: order._id, note: orderNotes[order._id] || "" })}
                        disabled={hasOrderNote}
                        className={layout === "grid" || layout === "compact" ? `px-2 py-1 text-white rounded-lg transition-colors text-sm ${hasOrderNote ? "bg-[#6b7280] opacity-50 cursor-not-allowed" : "bg-[#4b4b4b] hover:bg-[#5c5c5c]"}` : `px-3 py-1 text-white rounded-lg transition-colors text-sm ${hasOrderNote ? "bg-[#6b7280] opacity-50 cursor-not-allowed" : "bg-[#4b4b4b] hover:bg-[#5c5c5c]"}`}
                        data-tooltip-id={`note-tooltip-${order._id}`}
                        data-tooltip-content={hasOrderNote ? "Đã thêm ghi chú!" : ""}
                      >
                        {orderNotes[order._id] || hasOrderNote ? "Sửa ghi chú" : "Thêm ghi chú"}
                      </button>
                    )}
                    <Tooltip id={`note-tooltip-${order._id}`} />
                    {currentStatus === 1 && activeTab === "pending" && (
                      <button
                        onClick={() => handleOpenCancelModal(order._id)}
                        disabled={cancelLoading === order._id}
                        className={layout === "grid" || layout === "compact" ? `px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center ${cancelLoading === order._id ? "opacity-50 cursor-not-allowed" : ""}` : `px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center ${cancelLoading === order._id ? "opacity-50 cursor-not-allowed" : ""}`}
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
                        className={layout === "grid" || layout === "compact" ? "px-2 py-1 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition-colors text-sm" : "px-3 py-1 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition-colors text-sm"}
                      >
                        Xác nhận nhận hàng
                      </button>
                    )}
                    {order.order_status === 6 && (
                      <button
                        onClick={() => handleReorder(order.order_items)}
                        className={layout === "grid" || layout === "compact" ? "px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm" : "px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"}
                      >
                        Đặt lại đơn hàng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && !loading && (
        <div className="flex justify-center mt-6 sm:mt-8 space-x-2 overflow-x-auto">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => {
                setCurrentPage(page);
                fetchOrders(page, activeTab);
              }}
              className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-base ${currentPage === page ? "bg-[#4b4b4b] text-white" : "bg-[#2d2d2d] text-[#d1d5db] hover:bg-[#3a3a3a]"}`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>

    {detailModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#2d2d2d] rounded-xl p-6 max-w-md sm:max-w-lg w-full mx-4 animate-scale-in">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 truncate">
            Chi tiết đơn hàng (Mã: {detailModal.order_code || detailModal._id})
          </h2>
          <p className="text-xs sm:text-sm text-[#6b7280] mb-4">
            Ngày đặt: {new Date(detailModal.createdAt).toLocaleDateString("vi-VN")}
          </p>
          {orderNotes[detailModal._id] && (
            <p className="text-sm text-[#d1d5db] mb-4">
              <strong>Ghi chú:</strong> {orderNotes[detailModal._id]}
            </p>
          )}
          {detailModal.order_status === 6 && detailModal.cancelReason && (
            <p className="text-sm text-[#d1d5db] mb-4">
              <strong>Lý do hủy:</strong> {detailModal.cancelReason}
            </p>
          )}
          {detailModal.order_status === 6 && detailModal.trackingHistory.length > 1 && (
            <div className="mb-4">
              <h3 className="text-base font-medium mb-2">Lịch sử trước khi hủy</h3>
              {detailModal.trackingHistory
                .filter((entry) => entry.status !== 6)
                .map((entry, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">{entry.status}</div>
                    <p className="ml-2 text-sm text-[#d1d5db]">
                      {new Date(entry.timestamp).toLocaleString("vi-VN")} - {entry.description}
                    </p>
                  </div>
                ))}
            </div>
          )}
          <h3 className="text-base sm:text-lg font-medium mb-2">Sản phẩm</h3>
          {detailModal.order_items.map((item) => (
            <div key={item._id} className="flex items-center space-x-4 mb-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center bg-[#3a3a3a] rounded-lg">
                {item.thumbnail ? (
                  <Image
                    src={`${SETTINGS.URL_IMAGE}/${item.thumbnail}`}
                    alt={item.product_name}
                    width={40}
                    height={40}
                    className="object-contain rounded-lg sm:w-12 sm:h-12"
                    unoptimized
                  />
                ) : (
                  <span className="text-[#6b7280] text-xs sm:text-sm">No img</span>
                )}
              </div>
              <div>
                <p className="text-sm sm:text-base text-white truncate">{item.product_name}</p>
                <p className="text-xs sm:text-sm text-[#6b7280]">
                  SL: {item.quantity} | Giá: {formatToVND(item.price_end * item.quantity)}
                </p>
              </div>
            </div>
          ))}
          <h3 className="text-base sm:text-lg font-medium mb-2">Lịch sử trạng thái</h3>
          <div className="max-h-40 sm:max-h-48 overflow-y-auto">
            {detailModal.trackingHistory.map((entry, index) => (
              <div key={index} className="mb-2">
                <p className="text-xs sm:text-sm text-[#d1d5db]">
                  {new Date(entry.timestamp).toLocaleString("vi-VN")} - <span className="font-medium">{entry.description}</span> ({getStatusText(entry.status)})
                </p>
              </div>
            ))}
          </div>
          <p className="text-base sm:text-lg font-semibold mt-4">
            Tổng tiền: {formatToVND(detailModal.order_items.reduce((sum, item) => sum + item.price_end * item.quantity, 0))}
          </p>
          <button
            onClick={() => setDetailModal(null)}
            className="mt-4 w-full px-4 py-2 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition text-sm sm:text-base"
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

    {cancelModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#2d2d2d] rounded-xl p-6 max-w-md w-full mx-4 animate-scale-in relative">
          <button
            onClick={handleCloseCancelModal}
            className="absolute top-4 right-4 text-[#d1d5db] hover:text-white"
            aria-label="Đóng modal"
          >
            <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Lý do hủy đơn hàng</h2>
          <div className="mb-4">
            {cancelReasonOptions.map((reason) => (
              <label key={reason} className="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-[#3a3a3a] p-2 rounded transition">
                <input
                  type="checkbox"
                  checked={cancelReasons.includes(reason)}
                  onChange={(e) => {
                    const updatedReasons = e.target.checked ? [...cancelReasons, reason] : cancelReasons.filter((r) => r !== reason);
                    setCancelReasons(updatedReasons);
                    if (!updatedReasons.includes("Khác")) setCustomCancelReason("");
                  }}
                  className="form-checkbox bg-[#3a3a3a] border-[#4b4b4b] text-green-500 rounded focus:ring-0 h-5 w-5"
                />
                <span className="text-[#d1d5db] text-sm sm:text-base">{reason}</span>
              </label>
            ))}
            {cancelReasons.includes("Khác") && (
              <textarea
                value={customCancelReason}
                onChange={(e) => setCustomCancelReason(e.target.value)}
                placeholder="Vui lòng nhập lý do cụ thể..."
                className="w-full mt-2 px-4 py-2 bg-[#3a3a3a] text-white border border-[#4b4b4b] rounded-lg focus:outline-none focus:border-[#5c5c5c] transition text-sm sm:text-base resize-none"
                rows={3}
                maxLength={200}
              />
            )}
          </div>
          {cancelReasons.length > 0 && (
            <div className="flex space-x-4">
              <button
                onClick={handleCloseCancelModal}
                className="flex-1 px-4 py-2 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition text-sm sm:text-base"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelLoading === cancelModal.orderId || (cancelReasons.includes("Khác") && !customCancelReason.trim())}
                className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base flex items-center justify-center ${cancelLoading === cancelModal.orderId || (cancelReasons.includes("Khác") && !customCancelReason.trim()) ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {cancelLoading === cancelModal.orderId ? (
                  <>
                    <ClipLoader color="#ffffff" size={16} className="mr-2" />
                    Đang hủy...
                  </>
                ) : (
                  "Đồng ý hủy"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    )}

    {noteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#2d2d2d] rounded-xl p-6 max-w-md w-full mx-4 animate-scale-in relative">
          <button
            onClick={() => setNoteModal(null)}
            className="absolute top-4 right-4 text-[#d1d5db] hover:text-white"
            aria-label="Đóng modal"
          >
            <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Thêm ghi chú cho đơn hàng</h2>
          <textarea
            value={noteModal.note}
            onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
            placeholder="Nhập ghi chú (ví dụ: Gọi trước khi giao)..."
            className="w-full px-4 py-2 bg-[#3a3a3a] text-white border border-[#4b4b4b] rounded-lg focus:outline-none focus:border-[#5c5c5c] transition text-sm sm:text-base resize-none"
            rows={4}
            maxLength={200}
          />
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setNoteModal(null)}
              className="flex-1 px-4 py-2 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition text-sm sm:text-base"
            >
              Hủy
            </button>
            <button
              onClick={() => handleAddNote(noteModal.orderId, noteModal.note)}
              disabled={!noteModal.note.trim()}
              className={`flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm sm:text-base ${!noteModal.note.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    )}

    {filterModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#2d2d2d] rounded-xl p-6 max-w-md w-full mx-4 animate-scale-in">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Bộ lọc nâng cao</h2>
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-medium mb-2">Trạng thái đơn hàng</h3>
            {[1, 2, 3, 4, 5].map((status) => (
              <label key={status} className="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-[#3a3a3a] p-2 rounded transition">
                <input
                  type="checkbox"
                  checked={tempFilterStatus.includes(status)}
                  onChange={(e) => {
                    setTempFilterStatus(e.target.checked ? [...tempFilterStatus, status] : tempFilterStatus.filter((s) => s !== status));
                  }}
                  className="form-checkbox bg-[#3a3a3a] border-[#4b4b4b] text-green-500 rounded focus:ring-0 h-5 w-5"
                />
                <span className="text-[#d1d5db] text-sm sm:text-base">{getStatusText(status)}</span>
              </label>
            ))}
          </div>
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-medium mb-2">Khoảng thời gian</h3>
            <input
              type="date"
              value={tempFilterDateRange.start}
              onChange={(e) => setTempFilterDateRange({ ...tempFilterDateRange, start: e.target.value })}
              className="w-full px-4 py-2 bg-[#3a3a3a] text-white border border-[#4b4b4b] rounded-lg focus:outline-none focus:border-[#5c5c5c] transition text-sm sm:text-base mb-2"
            />
            <input
              type="date"
              value={tempFilterDateRange.end}
              onChange={(e) => setTempFilterDateRange({ ...tempFilterDateRange, end: e.target.value })}
              className="w-full px-4 py-2 bg-[#3a3a3a] text-white border border-[#4b4b4b] rounded-lg focus:outline-none focus:border-[#5c5c5c] transition text-sm sm:text-base"
            />
          </div>
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-medium mb-2">Khoảng giá</h3>
            <input
              type="number"
              value={tempFilterPriceRange.min}
              onChange={(e) => setTempFilterPriceRange({ ...tempFilterPriceRange, min: parseInt(e.target.value) || 0 })}
              placeholder="Giá tối thiểu"
              className="w-full px-4 py-2 bg-[#3a3a3a] text-white border border-[#4b4b4b] rounded-lg focus:outline-none focus:border-[#5c5c5c] transition text-sm sm:text-base mb-2"
            />
            <input
              type="number"
              value={tempFilterPriceRange.max}
              onChange={(e) => setTempFilterPriceRange({ ...tempFilterPriceRange, max: parseInt(e.target.value) || 10000000 })}
              placeholder="Giá tối đa"
              className="w-full px-4 py-2 bg-[#3a3a3a] text-white border border-[#4b4b4b] rounded-lg focus:outline-none focus:border-[#5c5c5c] transition text-sm sm:text-base"
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleClearFilters}
              className="flex-1 px-4 py-2 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition text-sm sm:text-base"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm sm:text-base"
            >
              Áp dụng
            </button>
          </div>
          <button
            onClick={handleCloseFilterModal}
            className="mt-4 w-full px-4 py-2 bg-[#4b4b4b] text-white rounded-lg hover:bg-[#5c5c5c] transition text-sm sm:text-base"
          >
            Đóng
          </button>
        </div>
      </div>
    )}
  </div>
);
};

export default OrdersPage;