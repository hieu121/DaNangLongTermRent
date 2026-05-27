const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => {
  res.json({ success: true, message: "healthy" });
});

app.use("/api", routes);
app.use(errorMiddleware);

module.exports = app;
