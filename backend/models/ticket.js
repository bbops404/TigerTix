const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Ticket = sequelize.define(
  "Ticket",
  {
    ticket_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    seat_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: {
          args: [["free", "reserved"]],
          msg: "Seat type must be either 'free' or 'reserved'.",
        },
      },
    },
    ticket_type: {
      type: DataTypes.STRING(50),
      allowNull: true, // Only required if seat_type is 'reserved'
      validate: {
        checkReservedType(value) {
          if (this.seat_type === "reserved" && !value) {
            throw new Error("Ticket type is required for reserved seating.");
          }
        },
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        min: {
          args: [0],
          msg: "Price must be a non-negative value.",
        },
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      validate: {
        min: {
          args: [0],
          msg: "Quantity must be a non-negative value.",
        },
      },
    },
    tickets_sold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "Tickets sold cannot be negative.",
        },
      },
    },
  },
  {
    tableName: "tickets",
    underscored: true,
    timestamps: false,
    createdAt: "created_at",
  }
);

Ticket.associate = (models) => {
  Ticket.belongsTo(models.Event, { foreignKey: "event_id", as: "event" });
};

module.exports = Ticket;
