export interface OrderItem {
  product_name: string;
  thumbnail: string;
  quantity: number;
  price_end: number;
  _id: string;
}

export interface TrackingEntry {
  status: number;
  description: string;
  timestamp: string;
}

export interface Order {
  _id: string;
  order_code: string;
  order_status: number;
  order_items: OrderItem[];
  trackingHistory: TrackingEntry[];
  createdAt: string;
  cancelReason?: string;
  order_note?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}
