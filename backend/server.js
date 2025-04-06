require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");
const cron = require("node-cron");
const cookieParser = require("cookie-parser");
const Redis = require("ioredis");

const db = require("./models");
const eventController = require("./controllers/eventController");
const pool = require("./config/db");

const app = express();
const port = process.env.PORT || 5002;

// Redis setup
const redisClient = new Redis();
redisClient.on("connect", () =>
  console.log("Connected to Redis successfully! 🔥")
);
redisClient.on("error", (err) => console.error("Redis connection error:", err));

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);
app.use(cookieParser());
app.use(morgan("dev"));


// Update the JSON and URL-encoded middleware with increased limits
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      if (buf.length > 10 * 1024 * 1024) {
        throw new Error("Request payload too large");
      }
    },
  })
);

app.use(
  express.urlencoded({
    limit: "10mb",
    extended: true,
    verify: (req, res, buf) => {
      if (buf.length > 10 * 1024 * 1024) {
        throw new Error("Request payload too large");
      }
    },
  })
);

// Debug incoming cookies
app.use((req, res, next) => {
  console.log("🔍 Incoming Cookies:", req.cookies);
  next();
});*/
// Make Redis available in req
app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const eventRoutes = require("./routes/eventRoutes");
app.use("/api", eventRoutes);

const privateroute = require("./routes/privateroute");
app.use("/privateroute", privateroute);

// Root route
app.get("/", (req, res) => {
  res.send("Server is running! 🚀");
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Cron job to update event statuses every hour
cron.schedule("* * * * *", () => {
  console.log("Running scheduled task: updating event statuses");
  eventController.updateEventStatuses();
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error("Detailed error:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request payload too large. Maximum file size is 10MB.",
      error: "Payload Too Large",
    });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
      error: err.name,
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Unexpected error occurred",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server and sync database
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("Sequelize connected successfully! 🎉");

    await db.sync({ force: false });
    console.log("Database tables synchronized successfully! 📊");

    app.listen(port, () => {
      console.log(`Server running on port ${port} 🚀`);
    });
  } catch (error) {
    console.error("Error during database sync or server startup:", error);
    process.exit(1);
  }
};

startServer();
