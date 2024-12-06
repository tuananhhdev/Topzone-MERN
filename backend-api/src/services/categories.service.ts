import createError from "http-errors";
import Category from "../models/categories.model";
import { ICategory } from "../types/model.types";

const findAll = async (query: any) => {
  let objSort: any = {};
  const sortBy = query.sort || "createdAt"; // Mặc dịnh sắp xếp thep ngày giảm dần
  const orderBy = query.order && query.order == "ASC" ? 1 : -1;
  objSort = { ...objSort, [sortBy]: orderBy };

  let objectFilters: any = {};
  if (query.keyword && query.keyword != "") {
    objectFilters = {
      ...objectFilters,
      category_name: new RegExp(query.keyword, "i"),
    };
  }

  const page_str = query.page;
  const limit_str = query.limit;

  const page = page_str ? parseInt(page_str as string) : 1;
  const limit = limit_str ? parseInt(limit_str as string) : 5;

  const totalRecords = await Category.countDocuments();
  const offset = (page - 1) * limit;

  const categories = await Category.find({
    ...objectFilters,
  })
    .select("-__v -id")
    .sort(objSort)
    .skip(offset)
    .limit(limit);
  return {
    categories_list: categories,
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
  const category = await Category.findById(id);
  if (!category) {
    throw createError(404, `Category not found`);
  }
  return category;
};

const findCategoryBySlug = async (slug: string) => {
  const category = await Category.findOne({
    slug: slug,
  });
  if (!category) {
    throw createError(400, "Category Not Found!");
  }
  return category;
};

const updateById = async (id: string, payload: ICategory) => {
  const category = await findById(id);
  Object.assign(category, payload);
  await category.save();
  return category;
};

const updateBySlug = async (slug: string, payload: Partial<ICategory>) => {
  // Tìm category theo slug
  const category = await Category.findOne({ slug });
  if (!category) {
    throw createError(404, `Category with slug "${slug}" not found`);
  }

  // Gán giá trị mới từ payload
  Object.assign(category, payload);

  // Lưu lại vào database
  await category.save();

  return category;
};

const deleteById = async (id: string) => {
  const category = await findById(id);
  await category.deleteOne({ _id: category._id });
  return category;
};

const deleteBySlug = async (slug: string) => {
  const category = await Category.findOneAndDelete({ slug: slug });
  if (!category) {
    throw createError(404, "Category not found!");
  }
  return category;
};

const createRecord = async (payload: ICategory) => {
  const result = await Category.create(payload);
  return result;
};

export default {
  findAll,
  findById,
  findCategoryBySlug,
  updateById,
  updateBySlug,
  deleteById,
  deleteBySlug,
  createRecord,
};
