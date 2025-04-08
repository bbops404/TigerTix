const { Sequelize } = require("sequelize");
require("dotenv").config();

// Sequelize setup
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // Set to true for debugging SQL queries
});

sequelize
  .authenticate()
  .then(() => console.log("Sequelize connected to PostgreSQL successfully! 🚀"))
  .catch((err) => console.error("Sequelize connection error:", err));

module.exports = sequelize; // Export only Sequelize
