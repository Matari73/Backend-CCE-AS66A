const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const ChampionshipStatistics = sequelize.define('ChampionshipStatistics', {
  championship_statistics_id: {
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
  participant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'participants',
      key: 'participant_id',
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
  kills: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assists: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  deaths: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  spike_plants: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  spike_defuses: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mvps: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  first_kills: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'championship_statistics',
  timestamps: false,
});

module.exports = ChampionshipStatistics;
