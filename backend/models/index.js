const { Sequelize } = require("sequelize");
const sequelize = require("../config/db");

// Import all models
const User = require("./Users");
const Event = require("./Event");
const Ticket = require("./Ticket");
const ClaimingSlot = require("./ClaimingSlot");
const Reservation = require("./reservation");
const AuditTrail = require("./AuditTrail"); // Import the AuditTrail model

// Initialize db object
const db = {};
db.sequelize = sequelize;

// Add models to db object
db.User = User;
db.Event = Event;
db.Ticket = Ticket;
db.ClaimingSlot = ClaimingSlot;
db.Reservation = Reservation;
db.AuditTrail = AuditTrail; // Add AuditTrail to the db object



Object.keys(db).forEach((modelName) => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db); // Pass the `db` object containing all models
  }
});

db.sync = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log("All models synchronized with database.");
    return true;
  } catch (error) {
    console.error("Error synchronizing models with database:", error);
    throw error;
  }
};

module.exports = db;
