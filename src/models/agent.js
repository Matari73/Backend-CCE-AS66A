const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const Agent = sequelize.define('Agent', {
  agent_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'agents',
  timestamps: false,
});

module.exports = Agent;
