import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import globalConfig from "../configs/globalConfig";
import { decodedJWT } from "../types/model.types";
import jwt from "jsonwebtoken";
import Customer from "../models/customers.model";

export const checkCustomerToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Get the jwt token from the head
  const authHeader = req.headers["authorization"];

  console.log("authHeader", authHeader);

  const token = authHeader && authHeader.split(" ")[1];

  //If token is not valid, respond with 401 (unauthorized)
  if (!token) {
    return next();
  }
  // Nếu mọi thứ ok rồi, có token hợp lệ
  try {
    //Giai ma token
    const decoded = jwt.verify(
      token,
      globalConfig.JWT_SECRET as string
    ) as decodedJWT;

    console.log("token decoded", decoded);

    //try verify customer exits in database
    const customer = await Customer.findById(decoded._id);

    if (!customer) {
      return next(createError(401, "Unauthorized"));
    }
    //Đăng ký biến customer global trong app
    res.locals.customer = customer;

    next();
  } catch (err) {
    return next(createError(403, "Forbidden"));
  }
};
