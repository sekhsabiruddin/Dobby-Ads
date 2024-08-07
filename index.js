const express = require("express");
const app = express();
require("dotenv").config();
const dbConnect = require("./db/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const ErrorHander = require("./middlewares/error");
const authRoutes = require("./controller/auth");
const imageRoutes = require("./controller/images");
const folderRoutes = require("./controller/folders");
const searchRoutes = require("./controller/search");

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use("/", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// All the routers
app.use("/api/auth", authRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/search", searchRoutes);

// Database connection
dbConnect();

//It Golbal error handling middleware
app.use(ErrorHander);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
