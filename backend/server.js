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
const { S3Client } = require("@aws-sdk/client-s3");
const port = process.env.PORT || 5002;
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;


const s3Client = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
});

// ========================================================
// REDIS DATABASE SETUP
// For caching and fast data retrieval
// ========================================================
const redisClient = require("./config/redis");

redisClient.on("connect", () =>
  console.log("✅ Connected to Redis successfully!")
);
redisClient.on("error", (err) =>
  console.error("⚠️ Redis connection error:", err)
);

// ========================================================
// SOCKET.IO REAL-TIME COMMUNICATION SETUP
// For pushing real-time updates to clients
// ========================================================
// Create HTTP server instance
const server = http.createServer(app);

// Use environment variable for frontend URL or fallback to localhost
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Initialize Socket.IO with dynamic CORS settings
const io = socketIo(server, {
  cors: {
    origin: [FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  path: "/socket.io", // Ensure this matches the client configuration
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
// AWS S3 SETUP
// ========================================================
app.use((req, res, next) => {
  req.s3Client = s3Client;
  next();
});


// ========================================================
// EXPRESS MIDDLEWARE CONFIGURATION
// ========================================================
// CORS middleware configuration
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    allowedHeaders: ["Content-Type", "Authorization", "withCredentials"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], // Allow these HTTP methods
  })
);

app.use(express.json());

// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

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

// User routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Private routes that require authentication
const privateroute = require("./routes/privateroute");
app.use("/privateroute", privateroute);

const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

const reservationRoutes = require("./routes/reservationRoutes");
app.use("/api", reservationRoutes);

const auditTrailsRoute = require("./routes/auditTrails");
app.use("/api/audit-trails", auditTrailsRoute);

// Root route
app.get("/", (req, res) => {
  res.send("Server is running! 🚀");
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Initialize scheduler
const schedulerJobs = initScheduler(io);
console.log("📅 Scheduler jobs initialized:", Object.keys(schedulerJobs));

// Add scheduler status endpoint with detailed logging
app.get('/api/scheduler/status', (req, res) => {
  const status = schedulerJobs.getSchedulerStatus();
  console.log("📊 Scheduler Status Check:", {
    timestamp: new Date().toISOString(),
    jobs: Object.keys(status.jobs),
    uptime: status.uptime,
    jobDetails: status.jobs
  });
  res.json(status);
});

// Add a test endpoint to manually trigger event status updates
app.post('/api/scheduler/test-update', async (req, res) => {
  try {
    console.log("🔄 Manually triggering event status update...");
    const updatedEvents = await autoStatusCheck.updateEventStatuses();
    console.log("✅ Manual update completed:", {
      updatedCount: updatedEvents?.length || 0,
      updatedEvents
    });
    res.json({
      success: true,
      message: "Manual update completed",
      updatedEvents
    });
  } catch (error) {
    console.error("❌ Error during manual update:", error);
    res.status(500).json({
      success: false,
      message: "Error during manual update",
      error: error.message
    });
  }
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

    try {
      // Use `alter: true` to update the schema without dropping tables
      await db.sync({ alter: true });
      console.log("Database tables synchronized successfully! 📊");
    } catch (syncError) {
      console.error("Error during database synchronization:", syncError);
      throw syncError;
    }

    // Initialize the scheduler with the io instance for event status updates
    const schedulerJobs = initScheduler(io);
    console.log("Scheduler initialized with jobs:", Object.keys(schedulerJobs));

    // Start HTTP server
    server.listen(port, () => {
      console.log(`Server running on port ${port} 🚀`);
    });

    // Handle various process signals for graceful shutdown
    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      
      // Stop all scheduler jobs
      Object.values(schedulerJobs).forEach(job => {
        try {
          job.stop();
          console.log(`Stopped scheduler job: ${job.name || 'unnamed'}`);
        } catch (error) {
          console.error('Error stopping scheduler job:', error);
        }
      });

      // Close server
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });

      // Force exit after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Handle different termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGHUP', () => shutdown('SIGHUP'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      shutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    console.error("Error during database sync or server startup:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
