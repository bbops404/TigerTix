const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Reservation = sequelize.define(
  "Reservation",
  {
    reservation_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
      defaultValue: 1,
    },
    reservation_status: {
      type: DataTypes.ENUM("pending", "claimed", "unclaimed", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    qr_code: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "Reservations",
    timestamps: true, // Enable Sequelize's automatic timestamps
  }
  
);

// Define associations
Reservation.associate = (models) => {
  Reservation.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "User",
    onDelete: "CASCADE",
  });

  Reservation.belongsTo(models.Event, {
    foreignKey: "event_id",
    as: "Event",
    onDelete: "CASCADE",
  });

  Reservation.belongsTo(models.ClaimingSlot, {
    foreignKey: "claiming_id",
    as: "ClaimingSlot",
    onDelete: "SET NULL",
  });

  Reservation.belongsTo(models.Ticket, {
    foreignKey: "ticket_id",
    as: "Ticket",
    onDelete: "CASCADE",
  });
};

module.exports = Reservation;

