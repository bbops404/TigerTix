const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
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
        references: {
          model: "events",
          key: "id",
        },
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
        defaultValue: 0,
      },
      current_claimers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "claiming_slots",
      timestamps: true,
    }
  );

  ClaimingSlot.associate = (models) => {
    ClaimingSlot.belongsTo(models.Event, {
      foreignKey: "event_id",
      as: "event",
    });
  };

  return ClaimingSlot;
};
