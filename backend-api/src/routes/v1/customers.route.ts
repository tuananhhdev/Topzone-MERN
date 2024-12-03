import express from "express";
import customersController from "../../controllers/customers.controller";
import { checkCustomerToken } from "../../middleware/customer.middleware";

const router = express.Router();

router.post("/login", customersController.login);
router.get("/profile", checkCustomerToken, customersController.profile);
router.post("/refresh-token", customersController.refreshToken);
router.get("", customersController.findAll);
router.get("/:id", customersController.findById);
router.post("", customersController.createCustomer);
router.put("/:id", customersController.updateById);
router.delete("/:id", customersController.deleteById);

export default router