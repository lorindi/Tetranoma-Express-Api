import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoute from "./routes/auth.route.js";
import figureRoute from "./routes/figure.route.js";
import cartRoute from "./routes/cart.route.js";
import profileRoute from "./routes/profile.route.js";
import adminRoute from "./routes/admin.route.js";

const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/figures-db")
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
  origin: [
    "http://localhost:5173",
    "https://tetranoma.vercel.app/"
  ],
  credentials: true 
}));
// Root route handler
app.get("/", (req, res) => {
  console.log("Root route accessed");
  res.status(200).json({ 
    status: "success",
    message: "Tetranoma API is running",
    version: "1.0.0"
  });
});

app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/figures", figureRoute);
app.use("/api/cart", cartRoute);
app.use("/api/admin", adminRoute);
// 404 handler - add this after all other routes
app.use("*", (req, res) => {
  console.log("404 - Route not found:", req.originalUrl);
  res.status(404).json({ 
    status: "error",
    message: "Route not found" 
  });
});
app.listen(5000, () => {
  console.log("Restful server is listening on port 5000");
});
