import { DataTypes } from 'sequelize';
import { sequelize } from '../db/db.js';

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
    allowNull: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'teams',
  timestamps: false,
});

export default Team;
