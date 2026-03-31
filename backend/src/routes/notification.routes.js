import { Router } from "express";
import { getMyNotifications, markNotificationRead } from "../controllers/notification.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", getMyNotifications);
router.patch("/:id/read", markNotificationRead);

export default router;
