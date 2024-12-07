const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
