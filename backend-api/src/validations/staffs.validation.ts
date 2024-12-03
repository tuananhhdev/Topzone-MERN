import Joi from "joi";

const createRecord = {
  body: Joi.object().keys({
    avatar: Joi.string(),
    first_name: Joi.string()
      .min(2)
      .required()
      .label("First name should be at least 2 characters"),
    last_name: Joi.string()
      .min(2)
      .required()
      .label("Last name should be at least 2 characters"),
    phone: Joi.string().min(10).max(10).required(),
    email: Joi.string().email().required(),
    active: Joi.boolean().optional(),
    password: Joi.string().min(6).required(),
    role: Joi.number().required(),
  }),
};

const updateRecord = {
  body: Joi.object().keys({
    avatar: Joi.string(),
    first_name: Joi.string().min(2).label("First name phải có ít nhất 2 ký tự"),
    last_name: Joi.string().min(2).label("Last name phải có ít nhất 2 ký tự"),
    phone: Joi.string().min(10).max(10),
    email: Joi.string().email(),
    active: Joi.boolean().optional(),
    password: Joi.string().min(6),
    role: Joi.number().required(),
  }),
};
export default {
  createRecord,
  updateRecord,
};
