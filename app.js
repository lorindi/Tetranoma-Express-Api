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
console.log("Starting server initialization...");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/figures-db";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("DB connected successfully to:", MONGODB_URI))
  .catch((err) => {
    console.log("DB connection error details:", {
      error: err.message,
      code: err.code,
      timestamp: new Date().toISOString()
    });
  });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
  origin: [
    "http://localhost:5173",
    "https://tetranoma.vercel.app"
  ],
  credentials: true 
}));

app.get("/", (req, res) => {
  console.log("Restful service");
});

app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/figures", figureRoute);
app.use("/api/cart", cartRoute);
app.use("/api/admin", adminRoute);

app.use((err, req, res, next) => {
  console.log("Global error handler:", {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server initialized and listening on port ${PORT}`);
});
export default app;