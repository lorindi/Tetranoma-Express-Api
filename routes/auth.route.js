import express from "express";
import { createAccount, signIn, logout, createInitialAdmin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/create-admin", createInitialAdmin);
router.post("/create-account", createAccount);
router.post("/sign-in", signIn);
router.post("/logout", logout);


export default router