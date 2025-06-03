import { DataTypes } from 'sequelize';
import { sequelize } from '../db/db.js';

const Championship = sequelize.define('Championship', {
  championship_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  format: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // nome da tabela no banco (não o nome do model)
      key: 'user_id'  // campo da chave primária na tabela users
    }
  },
}, {
  tableName: 'championships',
  timestamps: false,
});

export default Championship;
