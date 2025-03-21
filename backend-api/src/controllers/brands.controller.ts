import { NextFunction, Request, Response } from "express";
import { sendJsonSuccess } from "../helpers/responseHandler";
import brandsService from "../services/brands.service";

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brands = await brandsService.findAll(req.query);
    sendJsonSuccess(res, "success")(brands);
  } catch (error) {
    next(error);
  }
};

const findById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const brand = await brandsService.findById(id);
    sendJsonSuccess(res, "success")(brand);
  } catch (error) {
    next(error);
  }
};

const findBrandBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const brand = await brandsService.findBrandBySlug(slug);
    return sendJsonSuccess(res, "success")(brand);
  } catch (error) {
    next(error);
  }
};

const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const brand = await brandsService.updateById(id, payload);
    sendJsonSuccess(res, "success")(brand);
  } catch (error) {
    next(error);
  }
};

const updateBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const payload = req.body;
    const brand = await brandsService.updateBySlug(slug, payload);
    sendJsonSuccess(res, "success")(brand);
  } catch (error) {
    next(error);
  }
};

const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const brand = await brandsService.deleteById(id);
    sendJsonSuccess(res)(brand);
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
    const brand = await brandsService.createRecord(req.body);
    sendJsonSuccess(res, "success", 201)(brand);
  } catch (error) {
    next(error);
  }
};

export default {
  findAll,
  findById,
  findBrandBySlug,
  createRecord,
  updateById,
  updateBySlug,
  deleteById,
};
