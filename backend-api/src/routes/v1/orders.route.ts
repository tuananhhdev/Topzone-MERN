import express from "express";
import ordersController from "../../controllers/orders.controller";
import { checkCustomerToken } from "../../middleware/customer.middleware";


const router = express.Router();

router.get("", ordersController.findAll);
router.get("/:id", ordersController.findById);
router.post("", checkCustomerToken, ordersController.createRecord);
router.put("/:id", ordersController.updateById);
router.delete("/:id", ordersController.deleteById);

export default router;
