const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Event = sequelize.define(
  "Event",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    event_start: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Start date and time of the event",
    },
    event_end: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "End date and time of the event",
    },
    venue: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    event_type: {
      type: DataTypes.ENUM("ticketed", "coming_soon", "free"),
      allowNull: true,
    },
    visibility: {
      type: DataTypes.ENUM("published", "unpublished", "archived"),
      defaultValue: "unpublished",
    },
    status: {
      type: DataTypes.ENUM("open", "closed", "draft", "cancelled", "scheduled"),
      defaultValue: "draft",
    },
    display_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    display_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    reservation_start: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reservation_end: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true, // For soft deletion
  }
);

// Define associations
Event.associate = (models) => {
  Event.hasMany(models.Ticket, {
    foreignKey: "event_id",
    as: "tickets",
    onDelete: "CASCADE",
  });

  Event.hasMany(models.ClaimingSlot, {
    foreignKey: "event_id",
    as: "claimingSlots",
    onDelete: "CASCADE",
  });
};

module.exports = Event;
