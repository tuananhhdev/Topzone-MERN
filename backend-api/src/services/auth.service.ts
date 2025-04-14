import createError from "http-errors";
import Customer from "../models/customers.model"; // Sử dụng model Customer
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";
import globalConfig from "../configs/globalConfig";

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
  // B1. Check xem tồn tại email
  const customer = await Customer.findOne({
    email: email,
  });
  if (!customer) {
    throw createError(400, "Invalid email or password");
  }
  if (!customer.active) {
    throw createError(400, "Account is not active");
  }
  const passwordHash = customer.password;
  const isValid = bcrypt.compareSync(password, passwordHash);
  if (!isValid) {
    throw createError(400, "Invalid email or password");
  }
  console.log("Login thành công");

  // B2. Tạo token
  const access_token = jwt.sign(
    {
      _id: customer?._id,
      email: customer.email,
    },
    globalConfig.JWT_SECRET as string,
    {
      expiresIn: "7days",
    }
  );
  // Refresh token hết hạn lâu hơn
  const refresh_token = jwt.sign(
    {
      _id: customer?._id,
      email: customer.email,
    },
    globalConfig.JWT_SECRET as string,
    {
      expiresIn: "30days",
    }
  );

  // B3. Trả token
  return {
    access_token,
    refresh_token,
  };
};

// Làm mới token
const getTokens = async (user: any) => {
  const access_token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
    },
    globalConfig.JWT_SECRET as string,
    {
      expiresIn: "7days",
    }
  );
  const refresh_token = jwt.sign(
    {
      _id: user?._id,
      email: user.email,
    },
    globalConfig.JWT_SECRET as string,
    {
      expiresIn: "30days",
    }
  );
  return { access_token, refresh_token };
};

export default {
  getProfile,
  login,
  getTokens,
};