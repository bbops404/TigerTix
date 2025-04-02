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
      allowNull: true, // Allow null for drafts
    },
    image: {
      type: DataTypes.STRING, // To store the file path
      allowNull: true,
    },
    event_date: {
      type: DataTypes.DATEONLY,
      allowNull: true, // Allow null for drafts
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true, // Already allowed null
    },
    event_time: {
      type: DataTypes.TIME,
      allowNull: true, // Allow null for drafts
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true, // Allow null for drafts
      validate: {
        isIn: {
          args: [["UAAP Event", "IPEA Event"]],
          msg: "Category must be either 'UAAP Event' or 'IPEA Event'.",
        },
      },
    },
    event_venue: {
      type: DataTypes.STRING(255),
      allowNull: true, // Allow null for drafts
    },
    event_type: {
      type: DataTypes.STRING(50),
      allowNull: true, // Allow null for drafts
      validate: {
        isIn: {
          args: [["ticketed", "coming soon", "free/promotional"]],
          msg: "Event type must be one of 'ticketed', 'coming soon', or 'free/promotional'.",
        },
      },
    },
    display_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isValidDisplayDate(value) {
          if (value) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const displayStart = new Date(value);

            if (displayStart < today) {
              throw new Error("Display start date cannot be in the past");
            }
          }
        },
      },
    },
    display_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isValidDisplayDate(value) {
          if (value && this.display_start_date) {
            const displayStart = new Date(this.display_start_date);
            const displayEnd = new Date(value);

            if (displayEnd <= displayStart) {
              throw new Error(
                "Display end date must be after display start date"
              );
            }
          }
        },
      },
    },
    visibility: {
      type: DataTypes.STRING(20),
      defaultValue: "unpublished", // Changed default to unpublished for drafts
      allowNull: false,
      validate: {
        isIn: {
          args: [["published", "unpublished", "archived"]],
          msg: "Visibility must be either 'published', 'unpublished', or 'archived'.",
        },
      },
    },
    reservation_start: {
      type: DataTypes.DATE,
      allowNull: true,
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
      defaultValue: "draft",
      allowNull: false,
      validate: {
        isIn: {
          args: [["draft", "scheduled", "open", "closed", "cancelled"]],
          msg: "Status must be one of 'draft', 'scheduled', 'open', 'closed', or 'cancelled'.",
        },
        validateStatus(value) {
          // Ensure 'cancelled' status is only for published events
          if (value === "cancelled" && this.visibility !== "published") {
            throw new Error(
              "Cancelled status is only valid for published events."
            );
          }
        },
      },
    },
    is_permanent_delete_allowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: "Indicates if the event can be permanently deleted from archive",
    },
  },
  {
    tableName: "events",
    underscored: true, // This converts camelCase attributes to snake_case column names
    timestamps: true, // This enables createdAt and updatedAt

    // Hooks for automatic state management
    hooks: {
      beforeCreate: (event) => {
        // Ensure draft events start as unpublished
        if (event.status === "draft") {
          event.visibility = "unpublished";
        }
      },
      beforeUpdate: (event) => {
        // Automatically manage visibility and status
        if (event.status === "draft") {
          event.visibility = "unpublished";
        }

        // Manage cancellation status
        if (event.status === "cancelled" && event.visibility !== "published") {
          throw new Error(
            "Cancelled status is only valid for published events."
          );
        }

        // Manage deletion to archive
        if (event.visibility === "archived") {
          event.status = "closed";
          event.is_permanent_delete_allowed = true;
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

module.exports = Event;
