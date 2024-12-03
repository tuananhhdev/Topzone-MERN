import { NextFunction, Request, Response } from "express";
import { sendJsonSuccess } from "../helpers/responseHandler";
import staffsService from "../services/staffs.service";

const allStaffs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const staffs = await staffsService.allStaffs(req.query);
    sendJsonSuccess(res, "success")(staffs);
  } catch (error) {
    next(error);
  }
};

const findStafftById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const staff = await staffsService.findStaffById(req.params.id);
    sendJsonSuccess(res, "success")(staff);
  } catch (error) {
    next(error);
  }
};

const createStaffRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const staff = await staffsService.createStaffRecord(req.body);
    sendJsonSuccess(res, "success", 201)(staff);
  } catch (error) {
    next(error);
  }
};

const updateStaffById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const staff = await staffsService.updateStaff(req.params.id, req.body);
    sendJsonSuccess(res, "success")(staff);
  } catch (error) {
    next(error);
  }
};

const deleteStaffbyId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const staff = await staffsService.deleteStaff(req.params.id);
    sendJsonSuccess(res, "success")(staff);
  } catch (error) {
    next(error);
  }
};

export default {
  allStaffs,
  findStafftById,
  createStaffRecord,
  updateStaffById,
  deleteStaffbyId,
};
