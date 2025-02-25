require('dotenv').config();
const express = require('express'); // Make sure express is required first
const cors = require('cors');
const pool = require('./config/db'); // Import the database connection
const db = require('./models');

const Redis = require("ioredis");
const redisClient = new Redis(); // Default Redis connection on localhost:6379


const app = express(); // Now create the express app

const port = process.env.PORT || 5002;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Ensure form data can be parsed

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

redisClient.on("connect", () => {
  console.log("Connected to Redis successfully! 🔥");
});
redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});


// Sample route to test API
app.get('/', (req, res) => {
  res.send('Server is running! 🚀');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Check database connection
db.sequelize.authenticate()
  .then(() => console.log('Sequelize connected to the database successfully! 🎉'))
  .catch(err => console.error('Sequelize connection error:', err));
