import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoute from "./routes/auth.route.js";
import figureRoute from "./routes/figure.route.js";
import cartRoute from "./routes/cart.route.js";
import profileRoute from "./routes/profile.route.js";
import adminRoute from "./routes/admin.route.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/figures-db";

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("DB connected successfully");
  } catch (err) {
    console.log("DB connection error:", err);
    process.exit(1);
  }
};

await connectDB();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://tetranoma.vercel.app/"
];

app.use(cors({ 
  origin: function(origin, callback) {
    console.log("Request origin:", origin);
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true 
}));


app.get("/", (req, res) => {
  console.log("Restful service is running");
  res.status(200).json({ message: "Tetranoma API is running" });
});

app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/figures", figureRoute);
app.use("/api/cart", cartRoute);
app.use("/api/admin", adminRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
