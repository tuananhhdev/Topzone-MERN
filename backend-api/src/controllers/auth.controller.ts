import { NextFunction, Request, Response } from "express";
import authServices from '../services/auth.service'
import { sendJsonSuccess } from "../helpers/responseHandler";

const login = async (req: Request, res: Response, next: NextFunction)=>{
    try {
      const {email, password} = req.body;
  
      const tokens = await authServices.login(email, password);
      sendJsonSuccess(res)(tokens);
  
    } catch (error) {
      next(error)
    }
}
const getProfile = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const {_id} = res.locals.staff;
        const result = await authServices.getProfile(_id)
        sendJsonSuccess(res)(result);
    } catch (error) {
        next(error)
    }
}

const refreshToken = async (req: Request, res: Response, next: NextFunction)=>{
try {
    const staff = res.locals.staff;
    console.log(`req.staff`,res.locals.staff);

    const tokens = await authServices.getTokens(staff)

    //tạo cặp token mới
    sendJsonSuccess(res)(tokens);

    } catch (error) {
        next(error)
    }
}

export default {
    login,
    getProfile,
    refreshToken
}