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
    type: DataTypes.ENUM('Planejado', 'Ativo', 'Finalizado'),
    allowNull: false,
  },
  prize: {
    type: DataTypes.STRING,
    allowNull: true,  
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
}, {
  tableName: 'championships',
  timestamps: false,
});

export default Championship;
