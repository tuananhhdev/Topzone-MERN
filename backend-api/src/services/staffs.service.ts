import createError from "http-errors";
import Staff from "../models/staffs.model";
import { IStaff } from "../types/model.types";

// 1.Get all Staffs
const allStaffs = async (query: any) => {
    let objSort: any = {};
    const sortBy  = query.sort || 'createdAt'; // Mặc dịnh sắp xếp thep ngày giảm dần
    const orderBy = query.order && query.order == 'ASC' ? 1 : -1
    objSort = { ...objSort,[sortBy]: orderBy }

    // Lọc theo tên nhân viên
    let objectFilters: any = {};
    if(query.keyword && query.keyword !=''){
        objectFilters = { ...objectFilters, first_name: new RegExp(query.keyword, 'i')}
    }
    if(query.email && query.email !=''){
        objectFilters = { ...objectFilters, email: new RegExp(query.email, 'i')}
    }
    if(query.phone && query.phone !=''){
        objectFilters = { ...objectFilters, phone: new RegExp(query.phone, 'i')}
    }
    

    const page_str = query.page
    const limit_str = query.limit
    const page = page_str ? parseInt(page_str as string) : 1
    const limit = limit_str ? parseInt(limit_str as string) : 10

    const totalRecords = await Staff.countDocuments(objectFilters);
    const offset = (page - 1 ) * limit

    const staffs = await Staff
    .find({
        ...objectFilters
    })
    .select('-__v -id -password -createdAt -updatedAt')
    .sort(objSort)
    .skip(offset)
    .limit(limit)
    return {
        staffs_list: staffs,
        sort: objSort,
        filters: {
            first_name: query.keyword || null,
            email: query.email || null,
            phone: query.phone || null
        },
        pagination: {
            page,
            limit,
            totalPages: Math.ceil(totalRecords / limit),
            totalRecords
        }
    }
}
// 2.Find Staff by Id
const findStaffById = async(id: string)=>{
    const staff = await Staff.findById(id).select('-__v -id -password')
    if(!staff){
        throw createError(400, 'Staff Not Found')
    }
    return staff
}

// 3. Create new staff
const createStaffRecord = async(payload: IStaff) =>{
    const staff = await Staff.create(payload)
    return staff
}

// 4. update Staff
const updateStaff = async(id:string, payload:IStaff) =>{
    const staff = await findStaffById(id)
    Object.assign(staff, payload);
    await staff.save()
    return staff
}

const deleteStaff = async(id: string) =>{
    const staff = await findStaffById(id)
    await staff.deleteOne({ _id: staff._id });
    return staff
}


export default {
    allStaffs,
    findStaffById,
    createStaffRecord,
    updateStaff,
    deleteStaff
}