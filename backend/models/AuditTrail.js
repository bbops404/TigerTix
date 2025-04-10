const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AuditTrail = sequelize.define(
  "AuditTrail",
  {
    audit_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    affectedEntity: {
        type: String,
        type: DataTypes.ENUM("Reservation", "User", "Event", "Report"),
        allowNull: false,
      },
  },
  {
    tableName: "audit_trails",
    timestamps: true,
    underscored: true,
  }
);


AuditTrail.associate = (models) => {
  console.log("Associating AuditTrail with models:", models);
  AuditTrail.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "User",
  });
};


console.log("AuditTrail model initialized:", AuditTrail);

module.exports = AuditTrail;