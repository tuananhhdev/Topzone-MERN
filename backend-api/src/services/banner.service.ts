import Banner from "../models/banner.model";
import createError from "http-errors";
import { IBanner } from "../types/model.types";

const findAll = async () => {
  const banner = await Banner.find();
  return banner;
};

const findById = async (id: string) => {
  const banner = await Banner.findById(id);
  if (!banner) {
    throw createError(404, "Banner Not Found!");
  }
  return banner;
};

const updateById = async (id: string, payload: IBanner) => {
  const banner = await Banner.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!banner) {
    throw createError(400, "Banner Not Found");
  }
  return banner;
};

const deleteById = async (id: string) => {
  const banner = await Banner.findByIdAndDelete(id);
  if (!banner) {
    throw createError(400, "Banner Not Found");
  }
  return banner;
};

const createRecord = async (payload: IBanner) => {
  const banner = await Banner.create(payload);
  return banner;
};

export default {
  findAll,
  findById,
  createRecord,
  updateById,
  deleteById,
};
