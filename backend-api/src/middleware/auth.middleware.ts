import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import Customer from "../models/customers.model";
import globalConfig from "../configs/globalConfig";

const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : req.headers.authorization;
    if (!token) {
      throw createError(401, "Yêu cầu token");
    }

    console.log("Token nhận được trong verifyToken:", token);

    const secret = globalConfig.JWT_SECRET || "TMTA";
    console.log("Khóa bí mật sử dụng:", secret);

    const decoded = jwt.verify(token, secret) as any;
    console.log("Token đã giải mã:", decoded);

    if (!decoded || !decoded.sub) {
      throw createError(401, "Token không hợp lệ: Thiếu ID người dùng");
    }

    const customer = await Customer.findById(decoded.sub);
    if (!customer) {
      console.log("Customer not found for _id:", decoded.sub);
      throw createError(401, "Không tìm thấy khách hàng");
    }

    res.locals.customer = {
      _id: decoded.sub,
      email: decoded.email,
    };

    console.log("res.locals.customer:", res.locals.customer);

    next();
  } catch (error: any) {
    console.error("Lỗi trong verifyToken:", error);
    if (error.name === "JsonWebTokenError") {
      next(createError(401, `Token không hợp lệ: ${error.message}`));
    } else if (error.name === "TokenExpiredError") {
      next(createError(401, "Token đã hết hạn"));
    } else {
      next(error);
    }
  }
};

export default verifyToken;
