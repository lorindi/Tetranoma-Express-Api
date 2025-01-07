import express from "express";
import { addToCart, checkout, getCart, removeFromCart } from "../controllers/cart.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/add", verifyToken, addToCart);
router.post("/checkout", verifyToken, checkout);
router.get("/", verifyToken, getCart);
router.delete("/remove/:itemId", verifyToken, removeFromCart);

export default router;