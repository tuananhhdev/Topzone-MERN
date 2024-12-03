import { Request, Response, NextFunction } from "express";
import ordersService from "../services/orders.service";

import { sendJsonSuccess } from "../helpers/responseHandler";

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lấy data từ lớp service
    const orders = await ordersService.findAllOrder(req.query);
    console.log("<<=== 🚀findAll orders  ===>>", orders);
    //Trả lại cho client
    // res.status(200).json({
    //   data: orders
    // })
    sendJsonSuccess(res, "success")(orders);
  } catch (error) {
    next(error);
  }
};
const findById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await ordersService.findById(id);
    sendJsonSuccess(res, "success")(order);
  } catch (error) {
    next(error);
  }
};
const createRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("req.body ===>>", req.body);
    console.log("res.locals.customer ===>>", res.locals.customer);

    const order = await ordersService.createRecordOrder(
      req.body,
      res.locals.customer
    );

    sendJsonSuccess(res, "success", 201)(order);
  } catch (error) {
    next(error);
  }
};
const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await ordersService.updateById(id, req.body);
    //Thành công
    sendJsonSuccess(res, "success", 200)(order);
  } catch (error) {
    //Chuyển lỗi qua cho handler error trong app.ts xử lý
    next(error);
  }
};
const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await ordersService.deleteById(id);
    sendJsonSuccess(res, "success", 200)(order);
  } catch (error) {
    next(error);
  }
};
export default {
  findAll,
  findById,
  createRecord,
  updateById,
  deleteById,
};
