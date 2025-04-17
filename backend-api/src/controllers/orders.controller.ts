import { Request, Response, NextFunction } from "express";
import ordersService from "../services/orders.service";
import createError from "http-errors";
import { sendJsonSuccess } from "../helpers/responseHandler";
import mongoose from "mongoose";
import { getIo } from "../common/websocket";

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await ordersService.findAllOrder(req.query);
    console.log("<<=== 🚀findAll orders  ===>>", orders);
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
): Promise<void> => {
  try {
    console.log("req.body ===>>", req.body);
    console.log("res.locals.customer ===>>", res.locals.customer);

    const customer = res.locals.customer;
    if (!customer || !customer._id) {
      res.status(401).json({
        statusCode: 401,
        errorType: "UnauthorizedError",
        message: "Bạn cần đăng nhập để tạo đơn hàng",
      });
      return;
    }

    const { customer: customerInfo, payment_type, order_items } = req.body;

    if (
      !customerInfo ||
      !payment_type ||
      !order_items ||
      order_items.length === 0
    ) {
      res.status(400).json({
        statusCode: 400,
        errorType: "BadRequest",
        message: "Thiếu thông tin cần thiết để tạo đơn hàng",
      });
      return;
    }

    const payload = {
      customer: customerInfo,
      payment_type,
      order_items,
    };

    const order = await ordersService.createRecordOrder(payload, customer);

    // Sử dụng sendJsonSuccess nhưng không return giá trị
    sendJsonSuccess(res, "Order created successfully", 201)(order);
  } catch (error) {
    console.error("Error in createRecord:", error);
    next(error);
  }
};

const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await ordersService.updateById(id, req.body);
    sendJsonSuccess(res, "success", 200)(order);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;
    const { status, description } = req.body;

    if (!status || !description) {
      throw createError(400, "Status and description are required");
    }

    let io;
    try {
      io = getIo();
    } catch (error) {
      throw createError(500, "WebSocket server not initialized");
    }
    const order = await ordersService.updateOrderStatus(
      orderId,
      status,
      description,
      io
    );
    sendJsonSuccess(res, "Order status updated successfully")(order);
  } catch (error) {
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

const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const customerId = res.locals.customer?._id;
    const { cancelReason } = req.body;

    if (!customerId) {
      throw createError(401, "Unauthorized");
    }

    if (!cancelReason) {
      throw createError(400, "Cancel reason is required");
    }

    const order = await ordersService.cancelOrder(
      orderId,
      customerId,
      cancelReason
    );
    sendJsonSuccess(res, "Order canceled successfully")(order);
  } catch (error) {
    next(error);
  }
};

const getOrdersByCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customerId = res.locals.customer?._id;
    console.log("Customer ID in getOrdersByCustomer:", customerId); // Log để kiểm tra

    if (!customerId) {
      throw createError(401, "Unauthorized: Customer ID not found");
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw createError(400, "Invalid Customer ID: Must be a valid ObjectId");
    }

    const orders = await ordersService.findOrdersByCustomer(customerId);
    sendJsonSuccess(res, "success")(orders);
  } catch (error) {
    next(error);
  }
};

const addRating = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = res.locals.customer?._id;
    if (!customerId) {
      throw createError(401, "Unauthorized");
    }

    const { id: orderId } = req.params; // Lấy orderId từ req.params
    const { productId, stars, comment, images, videos } = req.body;
    if (!orderId || !productId || !stars) {
      throw createError(400, "Missing required fields");
    }

    const order = await ordersService.addRating({
      customerId,
      orderId,
      productId,
      stars,
      comment,
      images,
      videos,
    });

    sendJsonSuccess(res, "Rating added successfully")(order);
  } catch (error) {
    next(error);
  }
};



const getOrderStatusById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const status = await ordersService.getOrderStatusById(orderId);
    sendJsonSuccess(res, "Order status retrieved successfully")(status);
  } catch (error) {
    next(error);
  }
};

const confirmReceived = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const customerId = res.locals.customer?._id;

    if (!customerId) {
      throw createError(401, "Unauthorized");
    }

    const order = await ordersService.confirmReceived(orderId, customerId);
    sendJsonSuccess(res, "Order received confirmed successfully")({ order });
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
  cancelOrder,
  updateOrderStatus,
  getOrdersByCustomer, 
  addRating,
  getOrderStatusById,
  confirmReceived
};
