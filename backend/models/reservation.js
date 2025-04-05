const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Reservation = sequelize.define(
    "Reservation",
    {
      reservation_id: {
        type: DataTypes.INTEGER, // Change to INTEGER
        autoIncrement: true, // Enable auto-increment
        primaryKey: true, // Set as the primary
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      event_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      claiming_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      
      ticket_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1, // Each reservation is for 1 ticket
      },
      reservation_status: {
        type: DataTypes.ENUM("pending", "claimed", "unclaimed", "cancelled"),
        allowNull: false,
        defaultValue: "pending", // Default status when a reservation is created
      },
      qr_code: {
        type: DataTypes.TEXT, // Store the QR code as a base64 string or URL
        allowNull: true, // Optional field
      },
    },
    {
        timestamps: true,
    });


    // Define associations
Reservation.associate = (models) => {
    Reservation.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user", // The reserver (middleman)
      onDelete: "CASCADE",
    });
  
    Reservation.belongsTo(models.Event, {
      foreignKey: "event_id",
      as: "event",
      onDelete: "CASCADE",
    });
  
    Reservation.belongsTo(models.ClaimingSlot, {
      foreignKey: "claiming_id",
      as: "claimingSlot",
      onDelete: "SET NULL",
    });
  
    Reservation.belongsTo(models.Ticket, {
      foreignKey: "ticket_id",
      as: "tickets",
      onDelete: "CASCADE",
    });
  };

  module.exports = Reservation;
  
