import Customer from "../models/customers.model";
import createError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";
import globalConfig from "../configs/globalConfig";
import { ICustomer } from "../types/model.types";

const findAllCustomer = async (query: any) => {
  let objSort: any = {};
  const sortBy = query.sort || "createdAt";
  const orderBy = query.order && query.order == "ASC" ? 1 : -1;
  objSort = { ...objSort, [sortBy]: orderBy };

  let objectFilters: any = { isDelete: false };
  if (query.keyword && query.keyword != "") {
    objectFilters = {
      ...objectFilters,
      first_name: new RegExp(query.keyword, "i"),
    };
  }
  if (query.email && query.email != "") {
    objectFilters = { ...objectFilters, email: new RegExp(query.email, "i") };
  }
  if (query.phone && query.phone != "") {
    objectFilters = { ...objectFilters, phone: new RegExp(query.phone, "i") };
  }
  const page_str = query.page;
  const limit_str = query.limit;
  const page = page_str ? parseInt(page_str as string) : 1;
  const limit = limit_str ? parseInt(limit_str as string) : 10;

  const totalRecords = await Customer.countDocuments(objectFilters);
  const offset = (page - 1) * limit;

  const customers = await Customer.find({ ...objectFilters })
    .select("-__v -id -password")
    .sort(objSort)
    .skip(offset)
    .limit(limit);
  return {
    customers_list: customers,
    sort: objSort,
    filters: {
      first_name: query.keyword || null,
      email: query.email || null,
      phone: query.phone || null,
    },
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
    },
  };
};

const findCustomerById = async (id: string) => {
  const customer = await Customer.findOne({ _id: id, isDelete: false }).select(
    "-__v -id -password"
  );
  if (!customer) {
    throw createError(400, "Customer Not Found");
  }
  return customer;
};

const createRecord = async (payload: ICustomer) => {
  const customer = await Customer.create(payload);
  return customer;
};

const updateCustomer = async (id: string, payload: Partial<ICustomer>) => {
  const customer = await findCustomerById(id);
  if (!customer) {
    throw new Error(`Không tìm thấy khách hàng với ID: ${id}`);
  }

  console.log("Payload nhận được từ client:", payload);

  Object.assign(customer, payload);

  // Lưu và lấy dữ liệu mới nhất
  const updatedCustomer = await customer.save();
  console.log("Dữ liệu sau khi cập nhật:", updatedCustomer);

  return updatedCustomer;
};

const deleteCustomer = async (id: string) => {
  const customer = await findCustomerById(id);
  customer.isDelete = true;
  await customer.save();
  return customer;
};

const restoreCustomer = async (id: string) => {
  const customer = await Customer.findOne({ _id: id, isDelete: true });
  if (!customer) {
    throw createError(400, "Customer Not Found or Not Deleted");
  }
  customer.isDelete = false;
  await customer.save();
  return customer;
};

const toggleAccountStatus = async (id: string) => {
  const customer = await findCustomerById(id);
  customer.active = !customer.active;
  await customer.save();
  return customer;
};

const updateAvatar = async (id: ObjectId, file: any) => {
  const customer = await Customer.findOne({ _id: id, isDelete: false });
  if (!customer) {
    throw createError(400, "Customer Not Found");
  }
  customer.avatar = file?.path || customer.avatar;
  await customer.save();
  return customer;
};

const getProfile = async (id: ObjectId) => {
  const customer = await Customer.findOne({ _id: id, isDelete: false });
  if (!customer) {
    throw createError(400, "Customer Not Found");
  }
  const customerObject = customer.toObject();
  return {
    id: customerObject._id.toString(),
    email: customerObject.email,
    full_name: customerObject.full_name || "",
    phone: customerObject.phone || "",
    street: customerObject.street || "",
    city: customerObject.city || "",
    state: customerObject.state || "",
    avatar: customerObject.avatar || "",
  };
};

const login = async (email: string, password: string) => {
  const customer = await Customer.findOne({ email, isDelete: false });
  if (!customer) {
    throw createError(400, "Invalid email or password");
  }
  if (!customer.active) {
    throw createError(400, "Account is deactivated");
  }
  const passwordHash = customer.password;
  const isPassword = bcrypt.compareSync(password, passwordHash);

  console.log("Password match result:", isPassword);

  if (!isPassword) {
    throw createError(400, "Invalid email or password!");
  }

  const secret = globalConfig.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const accessTokenPayload = {
    sub: customer._id,
    email: customer.email,
    full_name: customer.full_name,
  };

  const refreshTokenPayload = {
    sub: customer._id,
  };

  const accessToken = jwt.sign(accessTokenPayload, secret, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign(refreshTokenPayload, secret, {
    expiresIn: "30d",
  });

  return {
    accessToken,
    refreshToken,
  };
};

const googleLogin = async (email: string, name: string) => {
  let customer = await Customer.findOne({ email, isDelete: false });
  if (!customer) {
    // Tạo tài khoản mới nếu chưa tồn tại
    customer = await Customer.create({
      email,
      first_name: name.split(" ")[0] || "",
      last_name: name.split(" ").slice(1).join(" ") || "",
      phone: "",
      password: "", // Không cần password cho Google login
      active: true,
      isDelete: false,
    });
  }
  if (!customer.active) {
    throw createError(400, "Account is deactivated");
  }

  const secret = globalConfig.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  const access_token = jwt.sign(
    { _id: customer._id, email: customer.email },
    secret,
    { expiresIn: "7days" }
  );
  const refresh_token = jwt.sign(
    { _id: customer._id, email: customer.email },
    secret,
    { expiresIn: "30days" }
  );
  return {
    id: customer._id.toString(),
    access_token,
    refresh_token,
  };
};

const getTokens = async (customer: { _id: ObjectId; email: string }) => {
  const secret = globalConfig.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  const access_token = jwt.sign(
    { _id: customer._id, email: customer.email },
    secret,
    { expiresIn: "7days" }
  );
  const refresh_token = jwt.sign(
    { _id: customer._id, email: customer.email },
    secret,
    { expiresIn: "30days" }
  );
  return { access_token, refresh_token };
};



export default {
  findAllCustomer,
  findCustomerById,
  createRecord,
  updateCustomer,
  deleteCustomer,
  restoreCustomer,
  toggleAccountStatus,
  updateAvatar,
  login,
  googleLogin,
  getTokens,
  getProfile,
};
