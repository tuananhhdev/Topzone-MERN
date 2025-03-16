import { Response, Request, NextFunction } from "express";
import { sendJsonSuccess } from "../helpers/responseHandler";
import productsService from "../services/products.service";

const findProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const product = await productsService.findProductBySlug(slug);
    sendJsonSuccess(res)(product);
  } catch (error) {
    next(error);
  }
};
// Lấy sản phẩm theo thương hiệu
const getAllByBrandSlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const products = await productsService.getAllByBrandSlug(slug, req.query);
    sendJsonSuccess(res)(products);
  } catch (error) {
    next(error);
  }
};

// Lấy sản phẩm theo danh mục
const getAllByCategorySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const products = await productsService.getAllByCategorySlug(
      slug,
      req.query
    );
    sendJsonSuccess(res)(products);
  } catch (error) {
    next(error);
  }
};

/* get All Product Controller */
const findAllProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await productsService.findAllProduct(req.query);
    sendJsonSuccess(res)(products);
  } catch (error) {
    next(error);
  }
};
const findOneProductId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const product = await productsService.findOneProductId(id);
    sendJsonSuccess(res)(product);
  } catch (error) {
    next(error);
  }
};
const createDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;
    const product = await productsService.createNewProduct(payload);
    sendJsonSuccess(res, "success", 201)(product);
  } catch (error) {
    next(error);
  }
};
const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await productsService.updateProductById(id, req.body);
    sendJsonSuccess(res)(product);
  } catch (error) {
    next(error);
  }
};

const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await productsService.deleteProductById(id);
    sendJsonSuccess(res)(product);
  } catch (error) {
    next(error);
  }
};
export default {
  getAllByBrandSlug,
  getAllByCategorySlug,
  findAllProduct,
  findProductBySlug,
  findOneProductId,
  createDocument,
  updateById,
  deleteById,
};
