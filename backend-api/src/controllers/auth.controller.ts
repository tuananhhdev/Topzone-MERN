import { NextFunction, Request, Response } from "express";
import authServices from "../services/auth.service"; // Chỉ import authServices
import { sendJsonSuccess } from "../helpers/responseHandler";
import jwt from "jsonwebtoken";
import createError from "http-errors";

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const tokens = await authServices.login(email, password);

    const decoded = tokens.access_token ? jwt.decode(tokens.access_token) : null;
    const decodedPayload = decoded && typeof decoded === "object" ? decoded : {};

    sendJsonSuccess(res, "Login successful")({
      _id: decodedPayload._id || null,
      email: decodedPayload.email || null,
      token: tokens.access_token,
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

const checkEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const isValidEmail = await authServices.checkEmail(email);
    if (!isValidEmail) {
      res.status(404).json({ message: "Email đăng ký không đúng" });
      return;
    }
    sendJsonSuccess(res, "Email đăng ký hợp lệ")(isValidEmail);
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!res.locals.customer) {
      throw createError(401, "Không được phép: Không tìm thấy khách hàng");
    }

    const customer = res.locals.customer;
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

const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, action } = req.body;
    if (!email || !otp) {
      res.status(400).json({ message: "Vui lòng cung cấp email và mã OTP" });
      return;
    }

    if (action === "verify") {
      await authServices.verifyOTP(email, otp); 
      sendJsonSuccess(res, "Mã OTP hợp lệ")(true);
    } else if (action === "change") {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      if (!currentPassword || !newPassword || !confirmPassword) {
        res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin" });
        return;
      }
      await authServices.verifyOTP(email, otp); 
      const result = await authServices.changePassword(email, currentPassword, newPassword, confirmPassword); 
      sendJsonSuccess(res, result.message)(true);
    } else {
      res.status(400).json({ message: "Hành động không hợp lệ" });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      next(createError(500, "Lỗi server"));
    }
  }
};

export default {
  login,
  getProfile,
  checkEmail,
  refreshToken,
  requestOTP,
  verifyOtp,
};