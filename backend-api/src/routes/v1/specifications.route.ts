import express from "express";
import specificationController from "../../controllers/specification.controller";

const router = express.Router();

router.get("", specificationController.findAll);
router.post("", specificationController.createRecord);
router.get("/:id", specificationController.findById);
router.put("/:id", specificationController.updateById);
router.delete("/:id", specificationController.deleteById);

export default router;
