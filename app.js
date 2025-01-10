import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import figureRoute from "./routes/figure.route.js";
import cartRoute from "./routes/cart.route.js";
import profileRoute from "./routes/profile.route.js";
import adminRoute from "./routes/admin.route.js";

dotenv.config();

const app = express();

console.log("Starting server initialization");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/figures-db";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("DB connected successfully"))
  .catch((err) => console.log("DB connection error:", err));

// Middleware настройки
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// CORS конфигурация
const allowedOrigins = [
  "http://localhost:5173",
  "https://tetranoma.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {
    console.log("Incoming request from origin:", origin);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// CORS preflight настройки
app.options("*", cors());

// Health check endpoint
app.get("/", (req, res) => {
  console.log("Health check endpoint hit");
  res.status(200).json({ message: "API is running" });
});

// Рутове
app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/figures", figureRoute);
app.use("/api/cart", cartRoute);
app.use("/api/admin", adminRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.log("Error occurred:", err);
  res.status(500).json({ 
    message: "Something went wrong!", 
    error: err.message 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;