import { Router } from "express";
import {
  getCustomers,
  getDashboard,
  getOrders,
  getSupportRequests,
  updateOrderActivation,
  updateSupportRequest,
  upsertAdmin
} from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/bootstrap-admin", upsertAdmin);
router.use(authenticate, authorize("admin"));
router.get("/dashboard", getDashboard);
router.get("/customers", getCustomers);
router.get("/orders", getOrders);
router.patch("/orders/:id/activate", updateOrderActivation);
router.get("/support-requests", getSupportRequests);
router.patch("/support-requests/:id", updateSupportRequest);

export default router;
