import { Router } from "express";
import {
  createOrder,
  confirmOrderPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";

const router = Router();

router.post("/", createOrder);
router.post("/confirm-payment", confirmOrderPayment);

router.get("/my-orders", authenticate, getMyOrders);
// Declare list route before /:id so it is not captured as an id
router.get("/", authenticate, authorize("admin", "manager"), getAllOrders);
router.put("/:id/status", authenticate, authorize("admin", "manager"), updateOrderStatus);
router.get("/:id", authenticate, getOrderById);

export default router;
