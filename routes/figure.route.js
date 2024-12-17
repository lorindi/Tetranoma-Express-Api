import express from "express";
import {
  createFigure,
  updateFigure,
  listFigures,
  detailsFigure,
  deleteFigure,
} from "../controllers/figure.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { adminOnly } from "../middleware/adminOnly.js";

const router = express.Router();

router.post("/create", verifyToken, createFigure);
router.put("/update/:id", verifyToken, updateFigure);
router.get("/list", listFigures);
router.get("/detail/:id", detailsFigure);
router.delete("/delete/:id", verifyToken, deleteFigure);

export default router;
