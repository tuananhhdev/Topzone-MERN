import { JwtPayload } from "jsonwebtoken";
import mongoose, { Model, SchemaDefinitionProperty } from "mongoose";
import { ObjectId } from "mongoose";

export interface ICategory {
  category_name: string;
  description?: string;
  slug?: string;
  photos: string[]; // Dùng `string[]` thay vì `[String]`
  isActive?: boolean;
  order?: number;
}

export interface IBrand {
  brand_name: string;
  description?: string;
  thumbnail: string;
  slug?: string;
  isActive?: boolean;
  isShowHome?: boolean;
}

export interface ICustomer {
  _id?: ObjectId;
  avatar?: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  password: string;
  active?: boolean;
  isDelete?: boolean;
}

export interface decodedJWT extends JwtPayload {
  _id?: string;
}

export interface IProduct {
  product_name: string;
  price: number;
  discount: number;
  price_end: number;
  category: mongoose.Schema.Types.ObjectId;
  brand: mongoose.Schema.Types.ObjectId;
  description?: string;
  photos: string[];
  stock?: number;
  slug?: string;
  order?: number;
  isBest?: boolean;
  isShowHome?: boolean;
  isDelete?: boolean;
  specifications?: string;
}

export interface IStaff {
  _id?: ObjectId;
  avatar?: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
  active?: boolean;
  role?: string;
}

export enum EnumOrderStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Canceled = "canceled",
  PrepareShipping = "prepareShipping",
  Shipping = "shipping",
  CancelShipping = "cancelShipping",
  Shipped = "shipped",
  PendingPaid = "pendingPaid",
  Paid = "paid",
  Refund = "refund",
  Finished = "finished",
}

export enum EnumPayments {
  Cash = "CASH",
  Credit = "CREDIT",
  Cod = "COD",
}

export enum EnumRole {
  Admin = "admin",
  SubAdmin = "subAdmin",
  User = "user",
}

export enum EnumBoolean {
  Yes = "true",
  No = "false",
}

export interface IOrderItems {
  product: ObjectId;
  product_name: string;
  quantity: number;
  price: number;
  discount: number;
  price_end: number;
  thumbnail?: string;
  name: string;
}

export interface IActionOrder {
  staff: ObjectId;
  action: string;
  orderStatus: string;
  note: string;
}

export interface ITrackingHistory {
  status: number;
  description: string;
  timestamp: Date;
}

export interface IOrder {
  customer?: ObjectId;
  staff?: ObjectId;
  order_date: Date;
  require_date?: Date;
  shipping_date?: Date;
  order_status: number;
  street: string;
  city: string;
  state: string;
  zip_code?: string;
  payment_type: number;
  order_note?: string;
  order_itemts: IOrderItems[];
  orderCode: string; // Thêm trường orderCode
  cancelReason?: string;
  trackingHistory: ITrackingHistory[];
  createdAt?: Date;
  updatedAt: Date;
  order_items?:
    | SchemaDefinitionProperty<ObjectId | undefined, IOrder>
    | undefined;
  isDelete?: boolean;
}

export interface IPayloadOrder {
  orderItems: IOrderItems[];
  orderNote?: string;
  paymentType: EnumPayments;
  customer: {
    customerId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    district: string;
    yard: string;
    province: string;
  };
}

export type OrderModelType = Model<IOrder>;

export interface IPayloadBrand {
  id: ObjectId;
  brand_name: string;
  description?: string;
  slug: string;
  logo_url?: string;
  order?: number;
  isActive: boolean;
}

export interface TPayloadCategory {
  _id: ObjectId;
  category_name: string;
  slug: string;
  imageUrl: string;
  order: number;
  description?: string;
  isActive: boolean;
}

export interface IBanner {
  imageUrl: string;
  altText: string;
  link?: string;
}
