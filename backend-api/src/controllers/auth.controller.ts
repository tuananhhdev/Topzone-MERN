import { NextFunction, Request, Response } from "express";
import authServices, {
  changePassword,
  verifyOTP,
} from "../services/auth.service";
import { sendJsonSuccess } from "../helpers/responseHandler";
import jwt from "jsonwebtoken";
import createError from "http-errors";

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const tokens = await authServices.login(email, password); // Gọi hàm login từ auth.service.ts

    const decoded = tokens.access_token
      ? jwt.decode(tokens.access_token)
      : null;
    const decodedPayload =
      decoded && typeof decoded === "object" ? decoded : {};

    sendJsonSuccess(
      res,
      "Login successful"
    )({
      _id: decodedPayload._id || null,
      email: decodedPayload.email || null,
      token: tokens.access_token, // Đặt access_token vào trường token
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!res.locals.customer) {
      throw createError(401, "Không được phép: Không tìm thấy khách hàng");
    }

    const { _id } = res.locals.customer;
    const result = await authServices.getProfile(_id);
    sendJsonSuccess(res)(result);
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.customer) {
      throw createError(401, "Không được phép: Không tìm thấy khách hàng");
    }

    const customer = res.locals.customer;
    console.log(`req.customer`, res.locals.customer);

    const tokens = await authServices.getTokens(customer);
    sendJsonSuccess(res)(tokens);
  } catch (error) {
    next(error);
  }
};

const requestOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    await authServices.sendOTP(email);
    sendJsonSuccess(res, "Mã OTP đã được gửi đến email của bạn")(true);
  } catch (error) {
    next(error);
  }
};

const verifyOTPAndChangePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, oldPassword, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !oldPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin" });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: "Mật khẩu mới và xác nhận không khớp" });
      return;
    }

    await verifyOTP(email, otp);
    await changePassword(email, oldPassword, newPassword);

    sendJsonSuccess(res, "Đổi mật khẩu thành công")(true);
  } catch (error) {
    next(error);
  }
};

export default {
  login,
  getProfile,
  refreshToken,
  requestOTP,
  verifyOTPAndChangePassword,
};
