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

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/figures-db";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("DB connected successfully"))
  .catch((err) => console.log("DB connection error:", err));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
// Add detailed CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://tetranoma.vercel.app"
    ];
    
    console.log("Request origin:", origin);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

app.get("/", (req, res) => {
  console.log("Health check endpoint hit");
  res.status(200).json({ message: "API is running" });
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

