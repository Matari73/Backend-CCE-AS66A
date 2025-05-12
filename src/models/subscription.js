const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const Subscription = sequelize.define('Subscription', {
  subscription_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  championship_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'championships',
      key: 'championship_id',
    },
  },
  team_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teams',
      key: 'team_id',
    },
  },
  subscription_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'subscriptions',
  timestamps: false,
});

module.exports = Subscription;
