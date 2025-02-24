require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL successfully! 🎉'))
  .catch(err => console.error('Database connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Sample route to test API
app.get('/', (req, res) => {
  res.send('Server is running! 🚀');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
