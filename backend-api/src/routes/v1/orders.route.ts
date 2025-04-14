import express from "express";
import ordersController from "../../controllers/orders.controller";
import verifyToken from "../../middleware/auth.middleware";


const router = express.Router();

router.get("/customer", verifyToken, ordersController.getOrdersByCustomer);
router.get("", verifyToken,ordersController.findAll);
router.get("/:id",ordersController.findById);
router.post("",verifyToken, ordersController.createRecord);
router.post("/cancel/:id", verifyToken, ordersController.cancelOrder); 
router.patch("/status/:id", verifyToken, ordersController.updateOrderStatus); // Route mới
router.put("/:id",verifyToken, ordersController.updateById);
router.delete("/:id",verifyToken, ordersController.deleteById);

export default router;
