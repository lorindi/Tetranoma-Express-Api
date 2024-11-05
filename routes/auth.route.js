import express from "express";
import { createAccount, signIn, logout } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/create-account", createAccount);
router.post("/signIn", signIn);
router.post("/logout", logout);

export default router