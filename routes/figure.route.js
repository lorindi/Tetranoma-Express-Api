import express from "express";
import {
  createFigure,
  updateFigure,
  listFigures,
  detailsFigure,
} from "../controllers/figure.controller.js";
const router = express.Router();

router.post("/create", createFigure);
router.post("/update/:id", updateFigure);
router.get("/list", listFigures);
router.get("/detail/:id", detailsFigure);

export default router;
