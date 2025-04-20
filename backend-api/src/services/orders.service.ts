import Order from "../models/orders.model";
import createError from "http-errors";
import { IOrder } from "../types/model.types";
import Customer from "../models/customers.model";
import nodemailer from "nodemailer";
import { paymentType } from "../configs/order.config";
import { Server } from "socket.io";

// Tạo transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "tuananhteves120@gmail.com",
    pass: process.env.MAIL_APP_PASSWORD,
  },
} as nodemailer.TransportOptions);

const generateOrderCode = async (orderDate: Date) => {
  const date = new Date(orderDate);

  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  const randomNum = Math.floor(10 + Math.random() * 90)
    .toString()
    .padStart(2, "0");

  const suffix = "TMTA";

  const orderCode = `#${year}${month}${day}${randomNum}${suffix}`;

  const existingOrder = await Order.findOne({ order_code: orderCode });
  if (existingOrder) {
    return generateOrderCode(orderDate);
  }

  return orderCode;
};

const findAllOrder = async (query: any) => {
  const page_str = query.page as string;
  const limit_str = query.limit as string;
  const orderStatus_str = query.order_status as string;
  const paymentType_str = query.payment_type as string;

  // Parse và validate page, limit
  const page = page_str ? parseInt(page_str) : 1;
  const limit = limit_str ? parseInt(limit_str) : 10;
  if (page < 1 || limit < 1) {
    throw createError(400, "Page and limit must be positive integers.");
  }

  // Parse payment_type
  const payment_type = paymentType_str ? parseInt(paymentType_str) : 0;
  if (payment_type != 0 && (payment_type < 1 || payment_type > 3)) {
    throw createError(400, "Invalid payment type. Must be between 1 and 3.");
  }

  // Parse order_status (hỗ trợ danh sách: "1,2,3,4,5,6")
  let order_status: number | number[] = orderStatus_str ? orderStatus_str.split(",").map(Number) : 0;
  if (order_status != 0) {
    // Nếu là mảng, kiểm tra từng giá trị
    if (Array.isArray(order_status)) {
      if (order_status.some((s) => s < 1 || s > 6)) { // Sửa: Cho phép order_status đến 6
        throw createError(400, "Invalid order status. Each must be between 1 and 6.");
      }
    } else {
      if (order_status < 1 || order_status > 6) { // Sửa: Cho phép order_status đến 6
        throw createError(400, "Invalid order status. Must be between 1 and 6.");
      }
    }
  }

  // Sắp xếp
  let objSort: any = {};
  const sortBy = query.sort || "createdAt";
  const orderBy = query.order === "ASC" ? 1 : -1;
  objSort = { ...objSort, [sortBy]: orderBy };

  const offset = (page - 1) * limit;

  // Bộ lọc
  let objectCustomerFilters: any = {};
  let objectOrderFilters: any = {};

  if (query.phone && query.phone !== "") {
    objectCustomerFilters = {
      ...objectCustomerFilters,
      phone: new RegExp(query.phone, "i"),
    };
  }

  if (query.keyword && query.keyword !== "") {
    objectCustomerFilters = {
      ...objectCustomerFilters,
      $or: [
        { first_name: new RegExp(query.keyword, "i") },
        { last_name: new RegExp(query.keyword, "i") },
      ],
    };
  }

  if (order_status != 0) {
    objectOrderFilters = {
      ...objectOrderFilters,
      order_status: Array.isArray(order_status) ? { $in: order_status } : order_status,
    };
  }

  if (payment_type != 0) {
    objectOrderFilters = { ...objectOrderFilters, payment_type };
  }

  // Query chính
  const orders = await Order.find({
    ...objectOrderFilters,
    customer: { $exists: true, $ne: null },
  })
    .select("-__v -id")
    .populate({
      path: "customer",
      select: "first_name phone",
      match: objectCustomerFilters,
    })
    .populate("order_items.product", "_id product_name price slug thumbnail")
    .sort(objSort)
    .skip(offset)
    .limit(limit)
    .lean({ virtuals: true });

  // Lọc đơn hàng có customer
  const ordersWithConditions = orders.filter((order) => order.customer);

  // Đếm tổng bản ghi
  const totalRecords = await Order.countDocuments({
    ...objectOrderFilters,
    customer: { $exists: true, $ne: null },
  });

  return {
    orders_list: ordersWithConditions,
    sorts: objSort,
    filters: {
      orders: objectOrderFilters,
      customer: objectCustomerFilters,
    },
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
    },
  };
};

const findById = async (id: string) => {
  const order = await Order.findById(id)
    .populate("customer", "-__v -password")
    .populate("order_items.product", "_id product_name slug thumbnail")
    .lean({ virtuals: true });

  if (!order) {
    throw createError(400, "Order Not Found");
  }

  return order;
};

const findOrdersByCustomer = async (customerId: string) => {
  const orders = await Order.find({ customer: customerId })
    .select("-__v -id")
    .populate({
      path: "customer",
      select: "first_name last_name phone email",
    })
    .populate("order_items.product", "_id product_name price slug thumbnail")
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });

  return orders;
};

const createRecordOrder = async (payload: any, customerLogined: any) => {
  console.log("Payload trong createRecordOrder:", payload);
  console.log("customerLogined trong createRecordOrder:", customerLogined);

  if (!customerLogined || !customerLogined._id) {
    throw createError(401, "Bạn cần đăng nhập để tạo đơn hàng");
  }

  if (
    !payload ||
    !payload.customer ||
    !payload.payment_type ||
    !payload.order_items
  ) {
    throw createError(400, "Thiếu thông tin cần thiết để tạo đơn hàng");
  }

  // Kiểm tra payment_type hợp lệ (1-3)
  if (
    !Number.isInteger(payload.payment_type) ||
    payload.payment_type < 1 ||
    payload.payment_type > 3
  ) {
    throw createError(
      400,
      "Invalid payment type. Must be between 1 and 3 (COD, VNPay, Momo)."
    );
  }

  const total =
    payload.order_items?.length > 0
      ? payload.order_items.reduce(
          (sum: number, item: { price_end: number; quantity: number }) => {
            if (!item.price_end || !item.quantity) {
              throw createError(400, "Thông tin sản phẩm không hợp lệ");
            }
            return sum + item.price_end * item.quantity;
          },
          0
        )
      : 0;

  const orderDate = payload.order_date
    ? new Date(payload.order_date)
    : new Date();
  const orderCode = await generateOrderCode(orderDate);

  const initialTracking = {
    status: 1,
    description: "Đơn hàng đã được xác nhận",
    timestamp: new Date(),
  };

  const payload_order = {
    customer: customerLogined._id,
    payment_type: payload.payment_type,
    street: payload.customer.street || "",
    city: payload.customer.city || "",
    state: payload.customer.state || "",
    order_note: payload.order_note || "",
    order_items: payload.order_items || [],
    order_code: orderCode,
    trackingHistory: [initialTracking],
  };

  console.log("Payload gửi đến Order.create:", payload_order);
  const order = await Order.create(payload_order);

  if (order) {
    console.log("Tạo đơn thành công", payload.customer.email);
    const mailOptions = {
      from: "maitanhung2@gmail.com",
      to: customerLogined.email,
      subject: "Xác nhận đặt hàng",
      html: `
        <h1>Xác nhận đặt hàng</h1>
        <p>Xin chào <strong>${payload.customer.first_name || ""} ${
        payload.customer.last_name || ""
      }</strong>,</p>
        <p>Email: ${payload.customer.email || "Không có"}</p>
        <p>Số điện thoại: ${payload.customer.phone || "Không có"}</p>
        <p>Địa chỉ: ${payload.customer.street || ""}, ${
        payload.customer.city || ""
      }, ${payload.customer.state || ""}</p>
        <p>Chúng tôi đã nhận được đơn hàng của bạn với thông tin sau:</p>
        <p><strong>Phương thức thanh toán:</strong> ${
          paymentType[payload.payment_type] || "Không xác định"
        }</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Tên sản phẩm</th>
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Giá</th>
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Số lượng</th>
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${payload.order_items
              .map(
                (item: {
                  product_name: string;
                  price_end: number;
                  quantity: number;
                }) => `
                <tr>
                  <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${
                    item.product_name || "Không xác định"
                  }</td>
                  <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${(
                    item.price_end || 0
                  ).toLocaleString("vi-VN")} VNĐ</td>
                  <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${
                    item.quantity || 0
                  }</td>
                  <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${(
                    (item.price_end || 0) * (item.quantity || 0)
                  ).toLocaleString("vi-VN")} VNĐ</td>
                </tr>
              `
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="border: 1px solid #dddddd; text-align: left; padding: 8px;"><strong>Tổng số tiền:</strong></td>
              <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"><strong>${total.toLocaleString(
                "vi-VN"
              )} VNĐ</strong></td>
            </tr>
          </tfoot>
        </table>
        <p>Cảm ơn bạn đã mua hàng tại cửa hàng của chúng tôi!</p>
      `,
    };
    transporter.sendMail(
      mailOptions,
      (error: Error | null, info: nodemailer.SentMessageInfo) => {
        if (error) {
          console.log("Lỗi gửi email:", error);
        } else {
          console.log("Email sent: " + info.response);
        }
      }
    );
  }
  return order;
};

const updateById = async (id: string, payload: IOrder) => {
  // Kiểm tra nếu payload có payment_type thì phải hợp lệ
  if (
    payload.payment_type &&
    (payload.payment_type < 1 || payload.payment_type > 3)
  ) {
    throw createError(
      400,
      "Invalid payment type. Must be between 1 and 3 (COD, VNPay, Momo)."
    );
  }

  const order = await Order.findByIdAndUpdate(id, payload, {
    new: true,
  });
  console.log("=>> order ===>>", order);
  if (!order) {
    throw createError(400, "Order Not Found");
  }
  return order;
};

const updateOrderStatus = async (
  orderId: string,
  newStatus: number,
  description: string,
  io: Server
) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw createError(404, "Order Not Found");
  }

  if (order.order_status === 6) {
    throw createError(400, "Cannot update status. Order is already canceled.");
  }

  if (order.order_status === 5) {
    throw createError(400, "Cannot update status. Order is already delivered.");
  }

  if (newStatus < order.order_status) {
    throw createError(400, "Cannot revert to a previous status.");
  }

  order.order_status = newStatus;
  order.trackingHistory.push({
    status: newStatus,
    description,
    timestamp: new Date(),
  });

  await order.save();

  io.to(orderId).emit("orderUpdated", order);

  return order;
};

const deleteById = async (id: string) => {
  const order = await Order.findByIdAndDelete(id);
  if (!order) {
    throw createError(400, "Order Not Found");
  }
  return order;
};

const cancelOrder = async (
  orderId: string,
  customerId: string,
  cancelReason: string
) => {
  const order = await Order.findOne({ _id: orderId, customer: customerId });
  if (!order) {
    throw createError(404, "Order Not Found");
  }

  if (order.order_status >= 4) {
    throw createError(
      400,
      "Cannot cancel order. Order is already being transported or delivered."
    );
  }

  if (order.order_status === 6) {
    throw createError(400, "Order is already canceled.");
  }

  order.order_status = 6;
  order.isCanceled = true;
  order.cancelReason = cancelReason;
  order.trackingHistory.push({
    status: 6,
    description: `Đơn hàng đã bị hủy: ${cancelReason}`,
    timestamp: new Date(),
  });

  await order.save();
  return order;
};

const addRating = async (payload: {
  customerId: string;
  orderId: string;
  productId: string;
  stars: number;
  comment?: string;
  images?: string[];
  videos?: string[];
}) => {
  const { customerId, orderId, productId, stars, comment, images, videos } = payload;

  const order = await Order.findOne({ _id: orderId, customer: customerId }).populate("order_items.product");
  if (!order) {
    throw createError(404, "Order not found or you are not authorized");
  }
  if (order.order_status !== 5) {
    throw createError(400, "Order is not in delivered status");
  }

  console.log("Order items:", order.order_items);
  const item = order?.order_items?.find((item) => item?._id?.toString() === productId); // So sánh với item._id

  if (!item) {
    throw createError(404, "Product not found in this order");
  }

  if (item.rating) {
    throw createError(400, "You have already rated this product");
  }

  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    throw createError(400, "Rating must be an integer between 1 and 5");
  }

  item.rating = {
    stars,
    comment: comment || "",
    images: images || [],
    videos: videos || [],
    ratedAt: new Date(),
  };

  await order.save();
  return order;
};

const getOrderStatusById = async (orderId: string): Promise<{ order_status: number }> => {
  const order = await Order.findById(orderId).select("order_status");
  if (!order) {
    throw createError(404, "Order not found");
  }
  return { order_status: order.order_status };
};

const confirmReceived = async (orderId: string, customerId: string): Promise<IOrder> => {
  const order = await Order.findOne({ _id: orderId, customer: customerId });
  if (!order) {
    throw createError(404, "Order not found or you are not authorized");
  }

  if (order.order_status !== 5) {
    throw createError(400, "Order is not in delivered status");
  }

  // Kiểm tra xem đã xác nhận nhận hàng chưa
  const hasReceived = order.trackingHistory.some(
    (history) => history.description === "Khách hàng xác nhận đã nhận hàng"
  );
  if (hasReceived) {
    throw createError(400, "Order has already been confirmed as received");
  }

  // Thêm bản ghi vào trackingHistory
  order.trackingHistory.push({
    status: 5,
    description: "Khách hàng xác nhận đã nhận hàng",
    timestamp: new Date(),
  });

  await order.save();
  return order;
};

export default {
  findAllOrder,
  findById,
  findOrdersByCustomer,
  createRecordOrder,
  updateById,
  deleteById,
  cancelOrder,
  updateOrderStatus,
  addRating,
  getOrderStatusById,
  confirmReceived
};
