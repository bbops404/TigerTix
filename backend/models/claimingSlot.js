// models/ClaimingSlot.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ClaimingSlot = sequelize.define(
  "ClaimingSlot",
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
    claiming_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    venue: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    max_claimers: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    current_claimers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Define associations
ClaimingSlot.associate = (models) => {
  ClaimingSlot.belongsTo(models.Event, {
    foreignKey: "event_id",
    as: "event",
  });
};

module.exports = ClaimingSlot;
