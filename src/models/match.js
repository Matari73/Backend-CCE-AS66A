const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const Match = sequelize.define('Match', {
  match_id: {
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
  teamA_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teams',
      key: 'team_id',
    },
  },
  teamB_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teams',
      key: 'team_id',
    },
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  stage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  winning_team_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teams',
      key: 'team_id',
    },
  },
  score: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  map: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'matches',
  timestamps: false,
});

module.exports = Match;
