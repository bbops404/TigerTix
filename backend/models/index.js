const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

const User = require('./Users'); // Ensure proper file import

const db = {};
db.sequelize = sequelize;
db.User = User;

module.exports = db;
