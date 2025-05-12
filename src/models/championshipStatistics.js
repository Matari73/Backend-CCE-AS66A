import { DataTypes } from 'sequelize';
import { sequelize } from '../db/db.js';

const ChampionshipStatistics = sequelize.define('ChampionshipStatistics', {
  statistic_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  championship_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  participant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  team_id: {
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
  MVPs: {
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

export default ChampionshipStatistics;
