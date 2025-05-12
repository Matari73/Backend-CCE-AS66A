import { DataTypes } from 'sequelize';
import { sequelize } from '../db/db.js';

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

export default Agent;
