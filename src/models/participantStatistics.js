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
    references: {
      model: 'matches',
      key: 'match_id'
    }
  },
  team_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: {
    model: 'teams',
    key: 'team_id'
  }
},
  participant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'participants',
      key: 'participant_id'
    }
  },
  agent_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'agents',
      key: 'agent_id'
    }
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
  kda: {
  type: DataTypes.FLOAT,
  allowNull: false,
  defaultValue: 0.0,
  },
  average_combat_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  total_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'participant_statistics',
  timestamps: false,
});

export default ParticipantStatistics;
