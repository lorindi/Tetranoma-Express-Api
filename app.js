import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import authRoute from "./routes/auth.route.js";
import figureRoute from "./routes/figure.route.js";

const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/figures-db")
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.get("/", (req, res) => {
  console.log("Restful service");
});

app.use("/api/auth", authRoute);
app.use("/api/figures", figureRoute);

app.listen(5000, () => {
  console.log("Restful server is listening on port 5000");
});
