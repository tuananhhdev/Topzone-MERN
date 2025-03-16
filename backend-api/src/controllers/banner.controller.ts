import { NextFunction, Request, Response } from "express";
import { sendJsonSuccess } from "../helpers/responseHandler";
import bannerService from "../services/banner.service";

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await bannerService.findAll();
    sendJsonSuccess(res)(banner);
  } catch (error) {
    next(error);
  }
};

const findById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const banner = await bannerService.findById(id);
    sendJsonSuccess(res)(banner);
  } catch (error) {
    next(error);
  }
};

const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const banner = await bannerService.updateById(id, req.body);
    sendJsonSuccess(res)(banner);
  } catch (error) {
    next(error);
  }
};

const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const banner = await bannerService.deleteById(id);
    sendJsonSuccess(res)(banner);
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
    const banner = await bannerService.createRecord(req.body);
    sendJsonSuccess(res, "success", 201)(banner);
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
