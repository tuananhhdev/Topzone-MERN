import createError from "http-errors";
import Specification from "../models/specifications.model";

const findAll = async () => {
  const specifications = await Specification.find({});
  return specifications;
};

const findById = async (id: string) => {
  const specification = await Specification.findById(id)
    
  if (!specification) {
    throw createError(400, "Specification not found!");
  }
  return specification;
};

const updateById = async (id: string, payload: any) => {
  const specification = await findById(id);
  Object.assign(specification, payload);
  await specification.save();
  return specification;
};

const deleteById = async (id: string) => {
  const specification = await findById(id);
  await Specification.deleteOne({ _id: specification._id });
  return specification;
};

const createRecord = async (body: any) => {
  const payloads = {
    origin: body.origin,
    release_date: body.release_date,
    warranty: body.warranty,
    dimensions: body.dimensions,
    weight: body.weight,
    water_resistance: body.water_resistance,
    material: body.material,
    cpu_version: body.cpu_version,
    cpu_type: body.cpu_type,
    cpu_cores: body.cpu_cores,
    ram: body.ram,
    screen_size: body.screen_size,
    screen_type: body.screen_type, // Đã sửa ở đây
    screen_resolution: body.screen_resolution, // Đã sửa ở đây
    glass_material: body.glass_material,
    touch_type: body.touch_type,
    brightness: body.brightness,
    contrast_ratio: body.contrast_ratio,
    gpu: body.gpu,
    storage: body.storage,
    expandable_memory: body.expandable_memory,
    rear_camera: body.rear_camera,
    video_quality: body.video_quality,
    selfie_camera: body.selfie_camera,
    sensors: body.sensors,
    security: body.security,
    sim: body.sim,
    connectivity: body.connectivity,
    battery: body.battery,
    more_info: body.more_info,
    os: body.os,
    os_version: body.os_version,
    accessories: body.accessories,
  };

  const specification = await Specification.create(payloads);
  return specification;
};

export default {
  findAll,
  findById,
  updateById,
  deleteById,
  createRecord,
};
