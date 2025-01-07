import express from "express";
import {
  createFigure,
  updateFigure,
  listFigures,
  detailsFigure,
  deleteFigure,
  rateFigure,
  toggleFavorite,
  getFavorites,
  getMyFigures,
} from "../controllers/figure.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { adminOnly } from "../middleware/adminOnly.js";

const router = express.Router();
router.get("/my-figures", verifyToken, getMyFigures);
router.get("/favorites", verifyToken, getFavorites);
router.post("/create", verifyToken, createFigure);
router.get("/list", listFigures);
router.put("/update/:id", verifyToken, updateFigure);
router.get("/:id", detailsFigure);
router.delete("/delete/:id", verifyToken, deleteFigure);
router.post("/rate/:id", verifyToken, rateFigure);
router.post("/favorite/:id", verifyToken, toggleFavorite);

export default router;
