import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.get("/", (req, res) => {
  console.log("Restful service");
});

app.listen(5000, () => {
  console.log("Restful server is listening on port 5000");
});
