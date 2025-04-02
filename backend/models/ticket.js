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
      allowNull: true, // Allow null for drafts
      references: {
        model: "events", // References the 'events' table
        key: "event_id", // References the 'event_id' column in the 'events' table
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    seat_type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isIn: {
          args: [["Free", "Ticketed"]],
          msg: "Seat type must be either 'Free' or 'Ticketed'.",
        },
      },
    },
    ticket_type: {
      type: DataTypes.STRING(50),
      allowNull: true, // Only required if seat_type is 'Ticketed'
      validate: {
        checkReservedType(value) {
          if (this.seat_type === "Ticketed" && !value) {
            throw new Error("Ticket type is required for ticketed seating.");
          }
        },
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      validate: {
        min: {
          args: [0],
          msg: "Price must be a non-negative value.",
        },
      },
    },
    total_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [1],
          msg: "Total quantity must be at least 1.",
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
        max(value) {
          if (value > this.total_quantity) {
            throw new Error("Tickets sold cannot exceed total quantity.");
          }
        },
      },
    },
    max_per_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      validate: {
        min: {
          args: [1],
          msg: "Maximum tickets per user must be at least 1.",
        },
      },
    },
    allow_multiple_reservations: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    require_emails: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    tableName: "tickets",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Ticket.associate = (models) => {
  Ticket.belongsTo(models.Event, { foreignKey: "event_id", as: "event" });
};

module.exports = Ticket;
