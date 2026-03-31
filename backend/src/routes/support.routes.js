import { Router } from "express";
import { createSupportRequest } from "../controllers/support.controller.js";

const router = Router();

router.post("/", createSupportRequest);

export default router;
