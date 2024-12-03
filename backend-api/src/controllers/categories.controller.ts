import { NextFunction, Request, Response } from "express";
import { sendJsonSuccess } from "../helpers/responseHandler";
import categoriesService from "../services/categories.service";

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoriesService.findAll(req.query);
    sendJsonSuccess(res, "success")(categories);
  } catch (error) {
    next(error);
  }
};

const findById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    console.log("getCategoryById", id);
    const category = await categoriesService.findById(id);
    sendJsonSuccess(res, "success")(category);
  } catch (error) {
    next(error);
  }
};

const findCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const brand = await categoriesService.findCategoryBySlug(slug);
    return sendJsonSuccess(res, "success")(brand);
  } catch (error) {
    next(error);
  }
};

const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const category = await categoriesService.updateById(id, payload);
    sendJsonSuccess(res, "success")(category);
  } catch (error) {
    next(error);
  }
};

const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await categoriesService.deleteById(id);
    sendJsonSuccess(res, "success")(category);
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
    const payload = req.body;
    const brand = await categoriesService.createRecord(payload);
    sendJsonSuccess(res, "success", 201)(brand);
  } catch (error) {
    next(error);
  }
};

export default {
  findAll,
  findById,
  findCategoryBySlug,
  createRecord,
  updateById,
  deleteById,
};
