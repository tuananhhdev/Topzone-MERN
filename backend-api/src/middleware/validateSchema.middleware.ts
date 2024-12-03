import Joi, { Schema } from 'joi';
import _ from 'lodash';
import { NextFunction, Request, Response } from 'express';

const validateSchema = (schema: Record<string, any>) => (req: Request, res: Response, next: NextFunction): void => {
  const pickSchema = _.pick(schema, ['params', 'body', 'query']);
  const object = _.pick(req, Object.keys(pickSchema));

  const { value, error } = Joi.compile(pickSchema)
    .prefs({
      errors: { label: 'key' },
      abortEarly: false,
    })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');

    // Trả về lỗi, không cần return Response
    res.status(400).json({
      status: 400,
      message: errorMessage,
      typeError: 'validateSchema',
    });
    return; // Chỉ cần return void tại đây
  }

  Object.assign(req, value);
  next(); // Tiếp tục xử lý nếu không có lỗi
};

export default validateSchema;