// models/Ticket.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Ticket = sequelize.define(
  "Ticket",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    seat_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ticket_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    total_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    remaining_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    max_per_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Define associations
Ticket.associate = (models) => {
  Ticket.belongsTo(models.Event, {
    foreignKey: "event_id",
    as: "event",
  });
};

module.exports = Ticket;
