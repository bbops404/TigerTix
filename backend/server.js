// ========================================================
// SERVER INITIALIZATION AND CONFIGURATION
// ========================================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const Redis = require("ioredis");
const http = require("http");
const socketIo = require("socket.io");
const db = require("./models");
const pool = require("./config/db");
const { initScheduler } = require("./schedulerService");
const app = express();
const port = process.env.PORT || 5002;



// ========================================================
// REDIS DATABASE SETUP
// For caching and fast data retrieval
// ========================================================
const redisClient = new Redis();
redisClient.on("connect", () =>
  console.log("Connected to Redis successfully! 🔥")
);
redisClient.on("error", (err) => console.error("Redis connection error:", err));


// ========================================================
// SOCKET.IO REAL-TIME COMMUNICATION SETUP
// For pushing real-time updates to clients
// ========================================================
// Create HTTP server instance
const server = http.createServer(app);

// Initialize Socket.IO with appropriate CORS settings
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  path: "/socket.io", // Make sure path is consistent with client
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

// Socket connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Debug each socket event
  socket.onAny((event, ...args) => {
    console.log(`Socket Event: ${event}`, args);
  });

  // Handle connection errors
  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });

  socket.on("disconnect", (reason) => {
    console.log("Client disconnected:", socket.id, "Reason:", reason);
  });
});

// Socket.IO health check endpoint for debugging
app.get("/socket-health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Socket.IO server is running",
    socketStats: {
      connected: io.engine.clientsCount,
      rooms: Object.keys(io.sockets.adapter.rooms).length,
    },
  });
});

// Make io available globally and in request objects
global._io = io;

io.engine.on("connection_error", (err) => {
  console.error("Socket.IO connection error:", err);
});

// Make io available in request object for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ========================================================
// EXPRESS MIDDLEWARE CONFIGURATION
// ========================================================
// CORS configuration for cross-origin requests
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: "Content-Type,Authorization",
}));

// Parse cookies from request

app.use(cookieParser());

// HTTP request logging
app.use(morgan("dev"));


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

// URL-encoded request body parsing with size limit
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

// Debug incoming cookies in requests
app.use((req, res, next) => {
  console.log("🔍 Incoming Cookies:", req.cookies);
  next();
});

// Make Redis available in req

app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

// ========================================================
// STATIC FILES AND ROUTES SETUP
// ========================================================
// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Authentication routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Event management routes
const eventRoutes = require("./routes/eventRoutes");
app.use("/api", eventRoutes);

// Private routes that require authentication
const privateroute = require("./routes/privateroute");
app.use("/privateroute", privateroute);

const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

const reservationRoutes = require("./routes/reservationRoutes");
app.use("/api", reservationRoutes);



// Root route
app.get("/", (req, res) => {
  res.send("Server is running! 🚀");
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// ========================================================
// ERROR HANDLING
// ========================================================
// Global error handler middleware
app.use((err, req, res, next) => {
  console.error("Detailed error:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  // Handle payload size errors
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request payload too large. Maximum file size is 10MB.",
      error: "Payload Too Large",
    });
  }

  // Handle file upload errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
      error: err.name,
    });
  }

  // General error response
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Unexpected error occurred",
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ========================================================
// SERVER STARTUP PROCEDURE
// ========================================================
const startServer = async () => {
  try {
    // Connect to PostgreSQL database
    await db.sequelize.authenticate();
    console.log("Sequelize connected successfully! 🎉");


    await db.sequelize.sync({ alter: true }); // Automatically updates the database schema
    await db.sync({ force: false });

    console.log("Database tables synchronized successfully! 📊");

    // Initialize the scheduler with the io instance for event status updates
    initScheduler(io);

    // Start HTTP server
    server.listen(port, () => {
      console.log(`Server running on port ${port} 🚀`);
    });
  } catch (error) {
    console.error("Error during database sync or server startup:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
