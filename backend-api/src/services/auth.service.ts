import createError from "http-errors";
import Customer from "../models/customers.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";
import globalConfig from "../configs/globalConfig";
import crypto from "crypto";
import OTP from "../models/otp.model";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: globalConfig.MAIL_APP_USER,
    pass: globalConfig.MAIL_APP_PASSWORD,
  },
});

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

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const sendOTP = async (email: string): Promise<string> => {
  const recentOTP = await OTP.findOne({ email }).sort({ createdAt: -1 });
  if (recentOTP && Date.now() - recentOTP.createdAt.getTime() < 60000) {
    throw createError(429, "Vui lòng đợi 60 giây trước khi gửi lại OTP.");
  }

  const otp = generateOTP();
  const expires = Date.now() + 5 * 60 * 1000;

  await OTP.create({ email, otp, expires });

  const mailOptions = {
    from: globalConfig.MAIL_APP_USER,
    to: email,
    subject: "Mã OTP để đổi mật khẩu",
    html: `<p>Mã OTP của bạn là: <strong>${otp}</strong>. Mã này sẽ hết hạn sau 5 phút.</p>`,
  };

  await transporter.sendMail(mailOptions);
  return otp;
};

export const verifyOTP = async (email: string, otp: string) => {
  const otpRecord = await OTP.findOne({
    email,
    otp,
    expires: { $gt: new Date() },
  });
  if (!otpRecord) throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn");

  return true;
};

export const changePassword = async (
  email: string,
  oldPassword: string,
  newPassword: string
) => {
  const user = await Customer.findOne({ email });
  if (!user) throw new Error("Người dùng không tồn tại");

  // So sánh mật khẩu cũ (sử dụng bcrypt để hash)
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Mật khẩu cũ không đúng");

  // Hash mật khẩu mới
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await Customer.updateOne({ email }, { password: hashedPassword });

  return { message: "Đổi mật khẩu thành công" };
};
export default {
  getProfile,
  login,
  getTokens,
  sendOTP,
  verifyOTP,
  changePassword,
};
