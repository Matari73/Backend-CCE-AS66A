const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const ParticipantStatistics = sequelize.define('ParticipantStatistics', {
  participant_statistics_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  match_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'matches',
      key: 'match_id',
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
  agent_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'agents',
      key: 'agent_id',
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
  mvp: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  first_kill: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  first_defuse: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
}, {
  tableName: 'participant_statistics',
  timestamps: false,
});

module.exports = ParticipantStatistics;
