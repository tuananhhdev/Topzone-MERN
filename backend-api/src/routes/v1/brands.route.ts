import express from "express";
import brandsController from "../../controllers/brands.controller";

const router = express.Router();

router.get("/", brandsController.findAll);
router.get("/:id", brandsController.findById);
router.get("/slug/:slug", brandsController.findBrandBySlug);
router.post("/", brandsController.createRecord);
router.put("/:id", brandsController.updateById);
router.put("/slug/:slug", brandsController.updateBySlug);
router.delete("/:id", brandsController.deleteById);

export default router;
