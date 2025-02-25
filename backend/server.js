require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db'); // Import the database connection
const db = require('./models');

const app = express();
const port = process.env.PORT || 5002;

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

db.sequelize.authenticate()
  .then(() => console.log('Sequelize connected to the database successfully! 🎉'))
  .catch(err => console.error('Sequelize connection error:', err));
