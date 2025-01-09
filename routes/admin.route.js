import express from "express";
import { 
  getAllUsersWithActivity,
  updateUserRole,
  createUser,
  updateUser,
  deleteUser,
  createFigureAdmin,
  updateFigureAdmin,
  deleteFigureAdmin,
  getAllOrders,
  updateOrderStatus,
  getAdminDashboardStats
} from "../controllers/admin.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { adminOnly } from "../middleware/adminOnly.js";

const router = express.Router();


router.put("/users/role", verifyToken, adminOnly, updateUserRole);
router.get("/users-with-activity", verifyToken, adminOnly, getAllUsersWithActivity);

router.post("/create-user", verifyToken, adminOnly, createUser);
router.put("/update-user/:userId", verifyToken, adminOnly, updateUser);
router.delete("/delete-user/:userId", verifyToken, adminOnly, deleteUser);

router.post("/create-figure", verifyToken, adminOnly, createFigureAdmin);
router.put("/update-figure/:id", verifyToken, adminOnly, updateFigureAdmin);
router.delete("/delete-figure/:id", verifyToken, adminOnly, deleteFigureAdmin);

router.get("/orders", verifyToken, adminOnly, getAllOrders);
router.put("/orders/:orderId/status", verifyToken, adminOnly, updateOrderStatus);

router.get("/dashboard-stats", verifyToken, adminOnly, getAdminDashboardStats);
export default router;