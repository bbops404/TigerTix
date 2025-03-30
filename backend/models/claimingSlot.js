module.exports = (sequelize, DataTypes) => {
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
      general_location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      specific_location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "claiming_slots",
      underscored: true,
      timestamps: false, // Only using created_at here
      createdAt: "created_at",
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
