import express from "express";
import productsController from "../../controllers/products.controller";
import { authenticateToken } from "../../middleware/auth.middleware";

const router = express.Router();

router.get("/brand/:slug", productsController.getAllByBrandSlug);
router.get("/category/:slug", productsController.getAllByCategorySlug);
router.get("", productsController.findAllProduct);
router.use(authenticateToken);
router.get("/:id", productsController.findOneProductId);
router.post("", productsController.createDocument);
router.put("/:id", productsController.updateById);
router.delete("/:id", productsController.deleteById);

export default router;
