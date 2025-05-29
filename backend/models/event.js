// models/Event.js
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
    event_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Date of the event",
    },
    event_time: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "Start time of the event",
    },
    event_end_time: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "End time of the event (optional)",
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
    display_start_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    display_end_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    reservation_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    reservation_start_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    reservation_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    reservation_end_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    venue_map: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "URL or path to the uploaded venue map",
    },
    venueMapS3Key: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "S3 key for the venue map",
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
    as: "Tickets",
    onDelete: "CASCADE",
  });

  Event.hasMany(models.ClaimingSlot, {
    foreignKey: "event_id",
    as: "ClaimingSlots",
    onDelete: "CASCADE",
  });

  Event.hasMany(models.Reservation, {
     as: "Reservations", 
     foreignKey: "event_id" ,
     onDelete: "CASCADE",

  });
};

module.exports = Event;
