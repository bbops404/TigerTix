require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");
const cron = require("node-cron");
const db = require("./models");
const eventController = require("./controllers/eventController");

const Redis = require("ioredis");
const redisClient = new Redis(); // Default Redis connection on localhost:6379

const app = express();
const port = process.env.PORT || 5002;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
const eventsUploadsDir = path.join(__dirname, "uploads/events");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Uploads directory created successfully! 📁");
}
if (!fs.existsSync(eventsUploadsDir)) {
  fs.mkdirSync(eventsUploadsDir, { recursive: true });
  console.log("Events uploads directory created successfully! 📁");
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Redis setup
redisClient.on("connect", () => {
  console.log("Connected to Redis successfully! 🔥");
});
redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

// Make Redis client available to all routes
app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

// Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);
const eventRoutes = require("./routes/eventRoutes");
app.use("/api", eventRoutes);

// Sample route to test API
app.get("/", (req, res) => {
  res.send("Server is running! 🚀");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Schedule cron job to update event statuses (runs every hour)
cron.schedule("0 * * * *", () => {
  console.log("Running scheduled task: updating event statuses");
  eventController.updateEventStatuses();
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Handle Multer errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  // Handle other errors
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server and sync database
const startServer = async () => {
  try {
    // Sync database tables
    await db.sync({ force: false });
    console.log("Database tables synchronized successfully! 📊");

    // Start server after database sync
    app.listen(port, () => {
      console.log(`Server running on port ${port} 🚀`);
    });
  } catch (error) {
    console.error("Error during database sync or server startup:", error);
    process.exit(1);
  }
};

// Initialize the server
startServer();
