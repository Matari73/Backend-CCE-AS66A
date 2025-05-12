const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const Team = sequelize.define('Team', {
  team_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ranking: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id',
    },
  },
}, {
  tableName: 'teams',
  timestamps: false,
});

module.exports = Team;
