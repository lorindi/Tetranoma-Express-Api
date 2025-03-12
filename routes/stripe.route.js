import express from "express";
import { createPaymentIntent, confirmPayment, handleWebhook } from "../controllers/stripe.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Маршрут за създаване на Payment Intent
router.post("/create-payment-intent", verifyToken, createPaymentIntent);

// Маршрут за потвърждаване на плащане
router.post("/confirm-payment", verifyToken, confirmPayment);

// Webhook маршрут (не изисква автентикация)
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

export default router;