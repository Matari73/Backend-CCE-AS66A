import { DataTypes } from 'sequelize';
import { sequelize } from '../db/db.js';

const Match = sequelize.define('Match', {
  match_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  championship_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teamA_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teamB_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  stage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  winner_team_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  score: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  map: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'matches',
  timestamps: false,
});

export default Match;
