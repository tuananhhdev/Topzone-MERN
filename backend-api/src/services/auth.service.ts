import createError from "http-errors"
import Staff from "../models/staffs.model"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import { ObjectId } from "mongoose";
import globalConfig from "../configs/globalConfig";


const getProfile = async(id: ObjectId) => {
    const staff = await Staff.findOne({
        _id: id
    })
    .select('-password -__v');
    if(!staff){
        throw createError(400, 'Staff Not Found')
    }
    return staff
}

const login = async (email: string, password: string) =>{
    // b1.Check xem tồn tại email
    const staff = await Staff.findOne({
        email: email
    })
    if(!staff){
        throw createError(400, "Invalid email or password")
    }
    if (!staff.active) {
        throw createError(400, "Invalid email or password");
    }
    const passwordHash = staff.password
    const isValid = await bcrypt.compareSync(password, passwordHash)
    if(!isValid){
        throw createError(400, "Invalid email or password")
    }
    console.log('Login thành công')

    // 3. Tạo token
    const access_token = jwt.sign(
        {
            _id: staff?._id,
            email: staff.email,
            //role: [] //phân quyền
        },
        globalConfig.JWT_SECRET as string,
        {
            expiresIn: '7days', //Xác định thời gian hết hạn của token
            //algorithm: 'RS256' //thuật toán mã hóa
        }
    )
    // fresh toke hết hạn lâu hơn 
    const refresh_token = jwt.sign(
        {
            _id: staff?._id,
            email: staff.email,
            //role: [] //phân quyền
        },
        globalConfig.JWT_SECRET as string,
        {
            expiresIn: '30days', //Xác định thời gian hết hạn của token
            //algorithm: 'RS256' //thuật toán mã hóa
        }
    )
    // 4.Trả token

    return {
        access_token,
        refresh_token 
    }
}

// Làm mới token
const getTokens = async (staff: {_id: ObjectId, email: string}) => {
    const access_token = jwt.sign(
        {
          _id: staff._id,
          email: staff.email
        },
        globalConfig.JWT_SECRET as string,
        {
          expiresIn: '7days', //Xác định thời gian hết hạn của token
          //algorithm: 'RS256' //thuật toán mã hóa
        }
    );
    const refresh_token = jwt.sign(
        {
          _id: staff?._id,
          email: staff.email,
          //role: staff.role,  //phân quyền
        },
        globalConfig.JWT_SECRET as string,
        {
          expiresIn: '30days', //Xác định thời gian hết hạn của token
          //algorithm: 'RS256' //thuật toán mã hóa
        }
      )
      return {access_token, refresh_token}
}


export default {
    getProfile,
    login,
    getTokens
}