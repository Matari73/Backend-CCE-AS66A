import { DataTypes } from 'sequelize';
import { sequelize } from '../db/db.js';

const Subscription = sequelize.define('Subscription', {
  subscription_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  championship_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  team_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subscription_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'subscriptions',
  timestamps: false,
});

export default Subscription;
