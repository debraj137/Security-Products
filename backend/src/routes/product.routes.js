import { Router } from "express";
import { createProduct, deleteProduct, getProducts, getPublicProducts, updateProduct } from "../controllers/product.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/public", getPublicProducts);
router.get("/", authenticate, authorize("admin"), getProducts);
router.post("/", authenticate, authorize("admin"), createProduct);
router.patch("/:id", authenticate, authorize("admin"), updateProduct);
router.delete("/:id", authenticate, authorize("admin"), deleteProduct);

export default router;
