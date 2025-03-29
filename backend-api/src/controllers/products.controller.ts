import { Response, Request, NextFunction } from "express";
import { sendJsonSuccess } from "../helpers/responseHandler";
import productsService from "../services/products.service";

class ProductsController {
  async findProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const product = await productsService.findProductBySlug(slug);
      sendJsonSuccess(res)(product);
    } catch (error) {
      next(error);
    }
  }

  async getAllByBrandSlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const products = await productsService.getAllByBrandSlug(slug, req.query);
      sendJsonSuccess(res)(products);
    } catch (error) {
      next(error);
    }
  }

  async getAllByCategorySlug(req: Request, res: Response, next: NextFunction) {
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
  }

  async findAllProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productsService.findAllProduct(req.query);
      sendJsonSuccess(res)(products);
    } catch (error) {
      next(error);
    }
  }

  async findOneProductId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productsService.findOneProductId(id);
      sendJsonSuccess(res)(product);
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productsService.createProduct(req.body);
      sendJsonSuccess(res, "success", 201)(product);
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productsService.updateProduct(id, req.body);
      sendJsonSuccess(res)(product);
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productsService.deleteProduct(id);
      sendJsonSuccess(res)(product);
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductsController();
