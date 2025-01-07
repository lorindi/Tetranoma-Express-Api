import express from "express";
import { 
  getProfile, 
  updateProfile, 
  deleteProfile 
} from "../controllers/profile.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getProfile);
router.put("/update", verifyToken, updateProfile);
router.delete("/delete", verifyToken, deleteProfile);

export default router;