const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "student",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
    },
    violation_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

User.associate = (models) => {
  // Add this association
  User.hasMany(models.Reservation, {
    foreignKey: "user_id",
    as: "Reservations", // The reservations made by the user
    onDelete: "CASCADE", // Optional: Delete reservations if the user is deleted
  });
};

User.associate = (models) => {
  console.log("Associating User with models:", models);
  console.log("models.AuditTrail:", models.AuditTrail);
  User.hasMany(models.AuditTrail, {
    foreignKey: "user_id",
    as: "auditTrails",
  });
};


module.exports = User;
