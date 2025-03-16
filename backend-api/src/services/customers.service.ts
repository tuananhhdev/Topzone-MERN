import Customer from "../models/customers.model";
import createError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";
import globalConfig from "../configs/globalConfig";
import { ICustomer } from "../types/model.types";
const findAllCustomer = async (query: any) => {
  let objSort: any = {};
  const sortBy = query.sort || "createdAt"; // Mặc dịnh sắp xếp thep ngày giảm dần
  const orderBy = query.order && query.order == "ASC" ? 1 : -1;
  objSort = { ...objSort, [sortBy]: orderBy };

  // Lọc theo tên thương hiệu
  let objectFilters: any = {};
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

  const customers = await Customer.find({
    ...objectFilters,
  })
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
  //Đi tìm 1 cái khớp id
  const customer = await Customer.findById(id).select("-__v -id -password");
  /* Bắt lỗi khi ko tìm thấy thông tin */
  if (!customer) {
    throw createError(400, "Customer Not Found");
  }
  return customer;
};

// 3. Create new customer
const createRecord = async (payload: ICustomer) => {
  const customer = await Customer.create(payload);
  return customer;
};
// 4. update Customer
const updateCustomer = async (id: string, payload: ICustomer) => {
  const customer = await findCustomerById(id);
  Object.assign(customer, payload);
  await customer.save();
  return customer;
};
// 5. delete Customer
const deleteCustomer = async (id: string) => {
  const customer = await findCustomerById(id);
  await customer.deleteOne({ _id: customer._id });
  return customer;
};
//  getProfile customer
const getProfile = async (id: ObjectId) => {
  const customer = await Customer.findOne({
    _id: id,
  });

  if (!customer) {
    throw createError(400, "Customer Not Found");
  }

  // const {
  //   _id,
  //   email,
  //   first_name,
  //   last_name,
  //   phone,
  //   street,
  //   city,
  //   state,
  //   zip_code,
  //   avatar,
  // } = customer;

  // return {
  //   _id,
  //   email,
  //   first_name,
  //   full_name,
  //   last_name,
  //   phone,
  //   street,k
  //   city,
  //   state,
  //   zip_code,
  //   avatar,
  // };
  const customerObject = customer.toObject();

  return {
    _id: customerObject._id,
    email: customerObject.email,
    first_name: customerObject.first_name,
    last_name: customerObject.last_name,
    phone: customerObject.phone,
    street: customerObject.street,
    city: customerObject.city,
    state: customerObject.state,
    zip_code: customerObject.zip_code,
    avatar: customerObject.avatar,
    full_name: customerObject.full_name,
  };
};
// login customer
const login = async (email: string, password: string) => {
  //b1. Check xem tồn tại customer có email này không
  const customer = await Customer.findOne({
    email: email,
  });

  if (!customer) {
    throw createError(400, "Invalid email or password");
  }
  if (!customer.active) {
    throw createError(400, "Invalid email or password");
  }
  //b2. Nếu tồn tại thì đi so sánh mật khẩu xem khớp ko
  const passwordHash = customer.password;
  const isValid = await bcrypt.compareSync(password, passwordHash); // true
  if (!isValid) {
    //Đừng thông báo: Sai mật mật khẩu. Hãy thông báo chung chung
    throw createError(400, "Invalid email or password");
  }
  console.log("<<=== 🚀 Login thành công ===>>");
  //3. Tạo token
  const access_token = jwt.sign(
    {
      _id: customer._id,
      email: customer.email,
    },
    globalConfig.JWT_SECRET as string,
    {
      expiresIn: "7days", //Xác định thời gian hết hạn của token
      //algorithm: 'RS256' //thuật toán mã hóa
    }
  );

  //Fresh Token hết hạn lâu hơn
  const refresh_token = jwt.sign(
    {
      _id: customer._id,
      email: customer.email,
    },
    globalConfig.JWT_SECRET as string,
    {
      expiresIn: "30days", //Xác định thời gian hết hạn của token
      //algorithm: 'RS256' //thuật toán mã hóa
    }
  );
  return {
    access_token,
    refresh_token,
  };
};

/**
 * hàm để sinh ra 1 cặp tokken
 * @param customer
 * @returns
 */
const getTokens = async (customer: { _id: ObjectId; email: string }) => {
  const access_token = jwt.sign(
    {
      _id: customer._id,
      email: customer.email,
    },
    globalConfig.JWT_SECRET as string,
    {
      expiresIn: "7days", //Xác định thời gian hết hạn của token
      //algorithm: 'RS256' //thuật toán mã hóa
    }
  );

  //Fresh Token hết hạn lâu hơn
  const refresh_token = jwt.sign(
    {
      _id: customer?._id,
      email: customer.email,
      //role: staff.role,  //phân quyền
    },
    globalConfig.JWT_SECRET as string,
    {
      expiresIn: "30days", //Xác định thời gian hết hạn của token
      //algorithm: 'RS256' //thuật toán mã hóa
    }
  );
  return { access_token, refresh_token };
};

export default {
  findAllCustomer,
  findCustomerById,
  createRecord,
  updateCustomer,
  deleteCustomer,
  login,
  getTokens,
  getProfile,
};
