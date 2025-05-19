import { motion } from "framer-motion";

interface Order {
  id: string;
  orderDate: string;
  total: number;
  status: string;
}

interface OrdersSectionProps {
  orders: Order[];
}

export const OrdersSection = ({ orders }: OrdersSectionProps) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Danh sách đơn hàng</h3>
    <div className="space-y-4">
      {orders.map((order) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-50 p-4 rounded-lg shadow-sm"
        >
          <p>Ngày đặt: {order.orderDate}</p>
          <p>Tổng tiền: {order.total.toLocaleString()} VNĐ</p>
          <p
            className={
              order.status === "Hoàn thành" ? "text-green-600" : "text-yellow-600"
            }
          >
            Trạng thái: {order.status}
          </p>
        </motion.div>
      ))}
    </div>
  </div>
);