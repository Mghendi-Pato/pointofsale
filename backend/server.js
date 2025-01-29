const express = require("express");
const { Sequelize } = require("sequelize");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth.js");
const adminRoutes = require("./routes/admin.js");
const regionRoutes = require("./routes/region.js");
const managerRoutes = require("./routes/manager.js");
const supplierRoutes = require("./routes/supplier.js");
const phonesRoutes = require("./routes/phone.js");
const modelRoutes = require("./routes/model");

const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());

// Register middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  }
);

sequelize
  .authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.error("Error connecting to the database:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/region", regionRoutes);
app.use("/manager", managerRoutes);
app.use("/supplier", supplierRoutes);
app.use("/phone", phonesRoutes);
app.use("/model", modelRoutes);

// Start Server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
