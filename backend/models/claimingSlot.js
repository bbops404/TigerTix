const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ClaimingSlot = sequelize.define(
  "ClaimingSlot",
  {
    claiming_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    claiming_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true,
      validate: {
        isAfterStartTime(value) {
          if (this.start_time && value && value <= this.start_time) {
            throw new Error("End time must be after start time.");
          }
        },
      },
    },
    max_claimers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: "Max claimers must be a non-negative value.",
        },
      },
    },
    venue: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    current_claimers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "Current claimers cannot be negative.",
        },
      },
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "active",
      validate: {
        isIn: {
          args: [["active", "full", "closed"]],
          msg: "Status must be one of 'active', 'full', or 'closed'.",
        },
      },
    },
  },
  {
    tableName: "claiming_slots",
    underscored: true,
    timestamps: true, // Changed to true to support created_at
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

ClaimingSlot.associate = (models) => {
  ClaimingSlot.belongsTo(models.Event, {
    foreignKey: "event_id",
    as: "event",
  });
};

module.exports = ClaimingSlot;
