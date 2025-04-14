import { Schema } from "mongoose";
import { IOrder, IOrderItems, OrderModelType } from "../types/model.types";
import { model } from "mongoose";
import { paymentType, orderStatus } from "../configs/order.config";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

const orderItemsSchema = new Schema<IOrderItems>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    require: true,
  },
  product_name: {
    type: String,
    require: false,
  },
  thumbnail: {
    type: String,
    require: false,
  },
  quantity: {
    type: Number,
    min: 1,
  },
  price: {
    type: Number,
    min: 0,
  },
  discount: {
    type: Number,
    min: 0,
  },
  price_end: {
    type: Number,
    min: 0,
  },
});

const trackingHistorySchema = new Schema({
  status: {
    type: Number, // Trạng thái: 1 (Đơn hàng đã đặt), 2 (Đã xác nhận thông tin), 3 (Đã giao cho DVVC), 4 (Chờ giao hàng), 5 (Đã giao)
    required: true,
  },
  description: {
    type: String, // Mô tả trạng thái, ví dụ: "Đơn hàng đã được giao cho đơn vị vận chuyển tại..."
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now, // Thời gian cập nhật trạng thái
  },
});

const ordersSchema = new Schema<IOrder, OrderModelType>(
  {
    customer: {
      type: Schema.Types.ObjectId, //_id
      ref: "Customer",
      required: true,
    },
    //Staff là người duyệt đơn, mặc định đơn mới chưa có người duyệt
    staff: {
      type: Schema.Types.ObjectId, //_id
      ref: "Customer",
      required: false,
      default: null, // mặc định null chưa có người duyệt
    },
    order_status: {
      type: Number,
      required: false,
      /**
       * Order status:
       * 1 = Pending;
       * 2 = Processing;
       * 3 = Rejected;
       * 4 = Completed
       */
      enum: [1, 2, 3, 4],
      default: 1, // mặc định khi tạo đơn mới
    },
    payment_type: {
      type: Number,
      required: false,
      /**
       * payment type:
       * 1 = COD;
       * 2 = Credit;
       * 3 = ATM;
       * 4 = Cash
       */
      enum: [1, 2, 3, 4],
      default: 4, // mặc định khi tạo đơn mới
    },

    cancelReason: {
      type: String,
      default: null, // Lý do hủy đơn hàng
    },
    trackingHistory: { type: [trackingHistorySchema], default: [] },
    order_date: {
      type: Date,
      required: false,
      default: new Date(), //mặc định lấy time hiện tại
    },
    require_date: {
      type: Date,
      required: false,
      default: null, //mặc định null
    },
    shipping_date: {
      type: Date,
      required: false,
      default: null, //mặc định null
    },
    order_note: {
      type: String,
      required: false,
    },
    street: {
      type: String,
      required: true,
      maxLength: 255,
    },
    city: {
      type: String,
      required: true,
      maxLength: 50,
    },
    state: {
      type: String,
      required: true,
      maxLength: 50,
    },
    order_items: [orderItemsSchema], //mảng sản phẩm
    createdAt: {
      type: Date,
      default: Date.now,
      required: false,
    },
    /* 
     Soft delete 
     Khi xóa sp thì đi update isDelete = true
     */
    isDelete: {
      type: Boolean,
      require: false,
      default: false,
    },
  },
  {
    timestamps: true, //Tạo tự động thêm 2 trường createAt, updateAt
    //collection: 'category', //Tên collection Cố định theo tên bạn đặt
  }
);

ordersSchema.virtual("orderStatusTitle").get(function () {
  return orderStatus[this.order_status];
});

ordersSchema.virtual("paymentTypeTitle").get(function () {
  return paymentType[this.payment_type];
});

ordersSchema.plugin(mongooseLeanVirtuals);

ordersSchema.set("toJSON", { virtuals: true });
// Virtuals in console.log()
ordersSchema.set("toObject", { virtuals: true });

const Order = model<IOrder, OrderModelType>("Order", ordersSchema);

export default Order;
