const { Sequelize } = require("sequelize");
require("dotenv").config();

// Sequelize setup
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // Enable SQL query logging for debugging
});

sequelize
  .authenticate()
  .then(() => console.log("Sequelize connected to PostgreSQL successfully! 🚀"))
  .catch((err) => console.error("Sequelize connection error:", err));

module.exports = sequelize; // Export only Sequelize
