import Customer from "../models/customers.model";
import createError from "http-errors";
import { ICustomer } from "../types/model.types";
import { ObjectId } from "mongoose";
import globalConfig from "../configs/globalConfig";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const findAll = async (query: any) => {
  let objSort: any = {};
  const sortBy = query.sort || "createdAt";
  const orderBy = query.order && query.order == "ASC" ? 1 : -1;
  objSort = { ...objSort, [sortBy]: orderBy };

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

const findById = async (id: string) => {
  const customer = await Customer.findById(id).select("-__v -id -password");
  if (!customer) {
    throw createError(400, "Customer Not Found!");
  }
  return customer;
};

const updateById = async (id: string, payload: ICustomer) => {
  const customer = await findById(id);
  Object.assign(customer, payload);
  await customer.save();
  return customer;
};

const deleteById = async (id: string) => {
  const customer = await findById(id);
  await customer.deleteOne({ _id: customer._id });
  return customer;
};

const getProfile = async (id: ObjectId) => {
  const customer = await Customer.findOne({
    _id: id,
  }).select("-password -__v");

  if (!customer) {
    throw createError(400, "Customer Not Found");
  }
  return customer;
};

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
      _id: customer?._id,
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
      //role: customer.role,  //phân quyền
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

const createRecord = async (payload: ICustomer) => {
    const customer = await Customer.create(payload);
    return customer
}

export default {
    findAll,
    findById,
    createRecord,
    updateById,
    deleteById,
    login,
    getTokens,
    getProfile
}