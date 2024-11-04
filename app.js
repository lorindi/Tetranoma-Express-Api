import express from "express";

const app = express();

app.get("/", (req, res) => {
  console.log("Restful service");
});

app.listen(5000, () => {
  console.log("Restful server is listening on port 5000");
});
