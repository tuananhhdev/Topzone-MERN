import { Response, Request, NextFunction } from "express";
import { sendJsonSuccess } from "../helpers/responseHandler";
import specificationsService from "../services/specifications.service";

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const specification = await specificationsService.findAll();
    sendJsonSuccess(res)(specification);
  } catch (error) {
    next(error);
  }
};

const findById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const specification = await specificationsService.findById(id);
    sendJsonSuccess(res)(specification);
  } catch (error) {
    next(error);
  }
};

const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const specification = await specificationsService.updateById(id, req.body);
    sendJsonSuccess(res)(specification);
  } catch (error) {
    next(error);
  }
};

const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const specification = await specificationsService.deleteById(id);
    sendJsonSuccess(res)(specification);
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
    const specification = await specificationsService.createRecord(payload);
    sendJsonSuccess(res, "success", 201)(specification);
  } catch (error) {
    next(error);
  }
};

export default {
  findAll,
  findById,
  updateById,
  deleteById,
  createRecord,
};
