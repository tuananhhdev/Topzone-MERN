import createError from "http-errors";
import Brand from "../models/brands.model";
import { IBrand } from "../types/model.types";

const findAll = async () => {
  const brands = await Brand.find();
  return brands;
};

const findById = async (id: string) => {
  const brand = await Brand.findById(id);
  if (!brand) {
    throw createError(400, "Brand Not Found!");
  }
  return brand;
};

const updateById = async (id: string, payload: IBrand) => {
  const brand = await Brand.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!brand) {
    throw createError(400, "Brand Not Found");
  }
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
    createRecord,
    updateById,
    deleteById
  }