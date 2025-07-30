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
const poolRoutes = require("./routes/pool.js");

const app = express();

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json({
  limit: '100mb',
  extended: true,
  parameterLimit: 50000
}));

app.use(bodyParser.urlencoded({
  limit: '100mb',
  extended: true,
  parameterLimit: 50000
}));

// Also increase Express built-in limits
app.use(express.json({
  limit: '100mb',
  parameterLimit: 50000
}));

app.use(express.urlencoded({
  limit: '100mb',
  extended: true,
  parameterLimit: 50000
}));

// CORS configuration
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

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/region", regionRoutes);
app.use("/manager", managerRoutes);
app.use("/supplier", supplierRoutes);
app.use("/phone", phonesRoutes);
app.use("/model", modelRoutes);
app.use("/pool", poolRoutes);

// Start Server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);