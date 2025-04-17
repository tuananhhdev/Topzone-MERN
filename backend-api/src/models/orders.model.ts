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
  rating: {
    type: {
      stars: {
        type: Number,
        min: 1,
        max: 5,
        required: false,
      },
      comment: {
        type: String,
        required: false,
        default: "",
      },
      images: {
        type: [String], // Danh sách URL của hình ảnh
        required: false,
        default: [],
      },
      videos: {
        type: [String], // Danh sách URL của video
        required: false,
        default: [],
      },
      ratedAt: {
        type: Date,
        required: false,
      },
    },
    required: false,
  },
});

const trackingHistorySchema = new Schema({
  status: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5, 6],
  },
  description: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ordersSchema = new Schema<IOrder, OrderModelType>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    order_status: {
      type: Number,
      required: false,
      enum: [1, 2, 3, 4, 5, 6],
      default: 1,
    },
    payment_type: {
      type: Number,
      required: false,
      enum: [1, 2, 3], // Chỉ chấp nhận COD (1), VNPay (2), Momo (3)
      default: 1, // Mặc định là COD
    },
    cancelReason: {
      type: String,
      default: null,
    },
    trackingHistory: { type: [trackingHistorySchema], default: [] },
    order_code: { type: String, unique: true },
    order_date: {
      type: Date,
      required: false,
      default: new Date(),
    },
    require_date: {
      type: Date,
      required: false,
      default: null,
    },
    shipping_date: {
      type: Date,
      required: false,
      default: null,
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
    order_items: [orderItemsSchema],
    createdAt: {
      type: Date,
      default: Date.now,
      required: false,
    },
    isDelete: {
      type: Boolean,
      require: false,
      default: false,
    },
  },
  {
    timestamps: true,
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
ordersSchema.set("toObject", { virtuals: true });

const Order = model<IOrder, OrderModelType>("Order", ordersSchema);

export default Order;