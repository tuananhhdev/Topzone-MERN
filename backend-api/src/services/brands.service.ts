import createError from "http-errors";
import Brand from "../models/brands.model";
import { IBrand } from "../types/model.types";

const findAll = async (query: any) => {
  let objSort: any = {};
  const sortBy = query.sort || "createdAt";
  const orderBy = query.order && query.order == "ASC" ? 1 : -1;
  objSort = { ...objSort, [sortBy]: orderBy };

  let objectFilters: any = {};
  if (query.keyword && query.keyword != "") {
    console.log("RegExp:", new RegExp(query.keyword, "i"));
    objectFilters = {
      brand_name: new RegExp(query.keyword, "i"),
    };
  }

  const page_str = query.page;
  const limit_str = query.limit;

  const page = page_str ? parseInt(page_str as string) : 1;
  const limit = limit_str ? parseInt(limit_str as string) : 10;

  const totalRecords = await Brand.countDocuments(objectFilters);
  const offset = (page - 1) * limit;

  const brands = await Brand.find(objectFilters)
    .select("-__v -id")
    .sort(objSort)
    .skip(offset)
    .limit(limit);
  return {
    brands_list: brands,
    sort: objSort,
    filters: {
      category_name: query.keyword || null,
    },
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
    },
  };
};

const findById = async (id: string) => {
  const brand = await Brand.findById(id);
  if (!brand) {
    throw createError(404, "Brand not found!");
  }
  return brand;
};

const findBrandBySlug = async (slug: string) => {
  const brand = await Brand.findOne({
    slug: slug,
  });
  if (!brand) {
    throw createError(400, "Brand Not Found!");
  }
  return brand;
};

const updateById = async (id: string, payload: IBrand) => {
  const brand = await findById(id);
  Object.assign(brand, payload);
  await brand.save();
  return brand;
};

const updateBySlug = async (slug: string, payload: Partial<IBrand>) => {
  // Tìm category theo slug
  const brand = await Brand.findOne({ slug });
  if (!brand) {
    throw createError(404, `Brand with slug "${slug}" not found`);
  }

  // Gán giá trị mới từ payload
  Object.assign(brand, payload);

  // Lưu lại vào database
  await brand.save();

  return brand;
};

const deleteById = async (id: string) => {
  const brand = await Brand.findByIdAndDelete(id);
  if (!brand) {
    throw createError(400, "Brand Not Found");
  }
  return brand;
};

const createRecord = async (payload: IBrand) => {
  const brand = await Brand.create(payload);
  return brand;
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
