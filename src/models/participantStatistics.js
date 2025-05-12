import { DataTypes } from 'sequelize';
import { sequelize } from '../db/db.js';

const ParticipantStatistics = sequelize.define('ParticipantStatistics', {
  statistic_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  match_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  participant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  agent_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  MVP: {
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

export default ParticipantStatistics;
