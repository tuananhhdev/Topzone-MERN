import express from "express";
import bannerController from "../../controllers/banner.controller";
const router = express.Router();

router.get("/", bannerController.findAll);
router.get("/id", bannerController.findById);
router.post("/", bannerController.createRecord);
router.put("/:id", bannerController.updateById);
router.delete("/:id", bannerController.deleteById);

export default router;
