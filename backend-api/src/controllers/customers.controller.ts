import { Request, Response } from "express";
import createError from "http-errors";
import customerService from "../services/customers.service";

const findAllCustomer = async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const customers = await customerService.findAllCustomer(query);
    res.status(200).json(customers);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const findCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await customerService.findCustomerById(id);
    res.status(200).json(customer);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const createCustomer = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const customer = await customerService.createRecord(payload);
    res.status(201).json(customer);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const customer = await customerService.updateCustomer(id, payload);
    res.status(200).json(customer);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await customerService.deleteCustomer(id);
    res.status(200).json(customer);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const restoreCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await customerService.restoreCustomer(id);
    res.status(200).json(customer);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const toggleAccountStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await customerService.toggleAccountStatus(id);
    res.status(200).json(customer);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const updateAvatar = async (req: Request, res: Response) => {
  try {
    const id = res.locals.customer._id;
    const file = req.file;
    const customer = await customerService.updateAvatar(id, file);
    res.status(200).json({ avatar: customer.avatar });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await customerService.login(email, password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const googleLogin = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    const result = await customerService.googleLogin(email, name);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const refreshToken = async (req: Request, res: Response) => {
  try {
    const customer = res.locals.customer;
    const tokens = await customerService.getTokens(customer);
    res.status(200).json(tokens);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const profile = async (req: Request, res: Response) => {
  try {
    const id = res.locals.customer._id;
    const customer = await customerService.getProfile(id);
    res.status(200).json(customer);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export default {
  findAllCustomer,
  findCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  restoreCustomer,
  toggleAccountStatus,
  updateAvatar,
  login,
  googleLogin,
  refreshToken,
  profile,
};