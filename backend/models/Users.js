const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Ensure correct import of sequelize

const User = sequelize.define('User', {
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
    unique: true,
    validate: { isEmail: true },
    set(value) {
      this.setDataValue("email", value.toLowerCase());
    }
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue("username", value.toLowerCase());
    }
  },  
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'student',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
  },
  violation_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at' // Map to created_at in DB
  },
  updatedAt: {  
    type: DataTypes.DATE,
    field: 'updated_at' // Map to updated_at in DB
  }
}, {
  tableName: 'users',  // ✅ Sequelize will use this instead of "Users"
  timestamps: true,    // ✅ Enables created_at and updated_at
  underscored: true,   // ✅ Uses snake_case instead of camelCase
});

User.sync({ alter: true })
  .then(() => console.log('User model synchronized with the database (alter mode).'))
  .catch((err) => console.error('Error syncing User model:', err));

module.exports = User;
