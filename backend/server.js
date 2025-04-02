require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path"); // Add path module for file paths
const fs = require("fs"); // Add fs module for directory creation
const db = require("./models");

const Redis = require("ioredis");
const redisClient = new Redis(); // Default Redis connection on localhost:6379

const app = express();
const port = process.env.PORT || 5002;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Uploads directory created successfully! 📁");
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);
const eventRoutes = require("./routes/eventRoutes");
app.use("/api", eventRoutes);

// Redis setup
redisClient.on("connect", () => {
  console.log("Connected to Redis successfully! 🔥");
});
redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

// Sample route to test API
app.get("/", (req, res) => {
  res.send("Server is running! 🚀");
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

// Start server and sync database
const startServer = async () => {
  try {
    // Sync database tables
    await db.sync({ force: false });
    console.log("Database tables synchronized successfully! 📊");

    // Start server after database sync
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Error during database sync or server startup:", error);
    process.exit(1);
  }
};

// Initialize the server
startServer();
