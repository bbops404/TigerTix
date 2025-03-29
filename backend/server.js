require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const db = require('./models/Users');
const cookieParser = require("cookie-parser");

const Redis = require("ioredis");
const redisClient = new Redis();

const app = express();
const port = process.env.PORT || 5002;

// ✅ Middleware (Order matters!)
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, // ✅ Ensures cookies are sent
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
}));

app.use(cookieParser()); // ✅ Allows reading cookies
app.use(express.json());  
app.use(express.urlencoded({ extended: true })); 

// ✅ Debugging Middleware (Place it here)
app.use((req, res, next) => {
  console.log("🔍 Incoming Cookies:", req.cookies); // Debug log
  next();
});

// Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const privateroute = require("./routes/privateroute");
app.use("/privateroute", privateroute);

redisClient.on("connect", () => console.log("Connected to Redis successfully! 🔥"));
redisClient.on("error", (err) => console.error("Redis connection error:", err));

app.get('/', (req, res) => res.send('Server is running! 🚀'));

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));

// Check database connection
db.sequelize.authenticate()
  .then(() => console.log('Sequelize connected successfully! 🎉'))
  .catch(err => console.error('Sequelize connection error:', err));
