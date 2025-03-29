import express from "express";
import productsController from "../../controllers/products.controller";
// import { authenticateToken } from "../../middleware/auth.middleware";

const router = express.Router();

router.get("/slug/:slug", productsController.findProductBySlug);
router.get("/brand/:slug", productsController.getAllByBrandSlug);
router.get("/category/:slug", productsController.getAllByCategorySlug);
router.get("", productsController.findAllProduct);
// router.use(authenticateToken);
router.get("/:id", productsController.findOneProductId);
router.post("", productsController.createProduct);
router.put("/:id", productsController.updateProduct);
router.delete("/:id", productsController.deleteProduct);

export default router;
