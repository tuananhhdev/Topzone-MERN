import express from "express";
import categoriesController from "../../controllers/categories.controller";

const router = express.Router();

router.get("/", categoriesController.findAll);
router.get("/:id", categoriesController.findById);
router.get("/slug/:slug", categoriesController.findCategoryBySlug);
router.post("/", categoriesController.createRecord);
router.put("/:id", categoriesController.updateById);
router.put("/slug/:slug", categoriesController.updateBySlug);
router.delete("/:id", categoriesController.deleteById);
router.delete("/slug/:slug", categoriesController.deleteBySlug);

export default router;
