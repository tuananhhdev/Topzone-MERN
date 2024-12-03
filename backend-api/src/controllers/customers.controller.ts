import { Request, Response, NextFunction } from "express";
import customersService from "../services/customers.service";
import { sendJsonSuccess } from "../helpers/responseHandler";

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await customersService.findAll(req.query);
    sendJsonSuccess(res, "success")(customers);
  } catch (error) {
    next(error);
  }
};

const findById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const customer = await customersService.findById(id);
    return sendJsonSuccess(res, "success")(customer);
  } catch (error) {
    next(error);
  }
};

const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const customer = await customersService.updateById(id, payload);
    sendJsonSuccess(res, "success")(customer);
  } catch (error) {
    next(error);
  }
};

const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const customer = await customersService.deleteById(id);
  sendJsonSuccess(res, "success")(customer);
};

const profile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id } = res.locals.customer;
    console.log(`req.customer`, res.locals.customer);

    const result = await customersService.getProfile(_id);
    sendJsonSuccess(res)(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const tokens = await customersService.login(email, password);
    sendJsonSuccess(res)(tokens);
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
    const customer = res.locals.customer;
    console.log(`req.customer`, res.locals.customer);

    const tokens = await customersService.getTokens(customer);

    //tạo cặp token mới
    sendJsonSuccess(res)(tokens);
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;
    const customer = await customersService.createRecord(payload);
    sendJsonSuccess(res, "success", 201)(customer);
  } catch (error) {
    next(error);
  }
};

export default {
  findAll,
  findById,
  createCustomer,
  updateById,
  deleteById,
  login,
  profile,
  refreshToken,
};
