import { Router } from "express";
import { createOrder, getMyAccessibleProducts, getMyOrders, getMyPayments } from "../controllers/order.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate, authorize("customer"));
router.post("/", createOrder);
router.get("/mine", getMyOrders);
router.get("/payments", getMyPayments);
router.get("/accessible-products", getMyAccessibleProducts);

export default router;
