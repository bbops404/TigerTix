const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
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
      event_date: {
        type: DataTypes.DATEONLY,
        allowNull: true, // Can be null for draft events or coming soon
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      event_time: {
        type: DataTypes.STRING, // Store as string format (e.g., "10:00 AM - 2:00 PM")
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      venue: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING, // URL to image
        allowNull: true,
      },
      event_type: {
        type: DataTypes.ENUM("ticketed", "free", "coming_soon"),
        allowNull: false,
        defaultValue: "ticketed",
      },
      status: {
        type: DataTypes.ENUM(
          "closed",
          "open",
          "draft",
          "cancelled",
          "scheduled"
        ),
        allowNull: false,
        defaultValue: "draft",
      },
      visibility: {
        type: DataTypes.ENUM("published", "unpublished", "archived"),
        allowNull: false,
        defaultValue: "unpublished",
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
      // Tracking fields
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      tableName: "events",
      timestamps: true,
      paranoid: true, // Soft delete support
      hooks: {
        beforeCreate: (event) => {
          // Set default statuses based on event type
          if (event.event_type === "coming_soon") {
            event.status = "scheduled";
            event.visibility = "published";
          } else if (event.event_type === "free") {
            event.status = "closed";
            event.visibility = "published";
          } else if (event.status === "draft") {
            event.visibility = "unpublished";
          }
        },
      },
    }
  );

  Event.associate = (models) => {
    Event.hasMany(models.Ticket, { foreignKey: "event_id", as: "tickets" });
    Event.hasMany(models.ClaimingSlot, {
      foreignKey: "event_id",
      as: "claimingSlots",
    });
  };

  return Event;
};
