import express from "express";
import brandsController from "../../controllers/brands.controller";
const router = express.Router();

router.get("/", brandsController.findAll);
router.get("/id", brandsController.findById);
router.post("/", brandsController.createRecord);
router.patch("/:id", brandsController.updateById);
router.delete("/:id", brandsController.deleteById);

export default router;
