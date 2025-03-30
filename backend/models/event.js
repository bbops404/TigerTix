const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Event = sequelize.define(
  "Event",
  {
    event_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    event_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
    },
    event_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: {
          args: [["UAAP", "IPEA Event"]],
          msg: "Category must be either 'UAAP' or 'IPEA Event'.",
        },
      },
    },
    image: {
      type: DataTypes.TEXT,
    },
    venue: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    event_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: {
          args: [["free", "ticketed"]],
          msg: "Event type must be either 'free' or 'ticketed'.",
        },
      },
    },
    visibility: {
      type: DataTypes.STRING(20),
      defaultValue: "published",
      validate: {
        isIn: {
          args: [["published", "archived"]],
          msg: "Visibility must be either 'published' or 'archived'.",
        },
      },
    },
    reservation_start: {
      type: DataTypes.DATE,
      allowNull: true, // Allow null if reservations are not required
    },
    reservation_end: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isAfterReservationStart(value) {
          if (
            this.reservation_start &&
            value &&
            value <= this.reservation_start
          ) {
            throw new Error("Reservation end must be after reservation start.");
          }
        },
      },
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "scheduled",
      validate: {
        isIn: {
          args: [["scheduled", "open", "closed", "cancelled"]],
          msg: "Status must be one of 'scheduled', 'open', 'closed', or 'cancelled'.",
        },
      },
    },
  },
  {
    tableName: "events",
    underscored: true,
    timestamps: true, // Adds created_at and updated_at automatically
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Event.associate = (models) => {
  Event.hasMany(models.Ticket, { foreignKey: "event_id", as: "tickets" });
  Event.hasMany(models.ClaimingSlot, {
    foreignKey: "event_id",
    as: "claimingSlots",
  });
};

module.exports = Event;
