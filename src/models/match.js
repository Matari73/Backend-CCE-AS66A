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
    references: {
      model: 'championships',
      key: 'championship_id'
    }
  },
  teamA_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teams',
      key: 'team_id'
    }
  },
  teamB_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teams',
      key: 'team_id'
    }
  },
  date: {
    type: DataTypes.STRING, // alterado de DATE para STRING
    allowNull: true
  },
  stage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bracket: {
    type: DataTypes.ENUM('upper', 'lower', 'final'),
    allowNull: true
  },
  winner_team_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teams',
      key: 'team_id'
    }
  },
  score: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  map: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pre-Agendada'
  }
}, {
  tableName: 'matches',
  timestamps: false,
});

// Função para atualizar o status com base na data e score
Match.beforeSave((match) => {
  if (match.date && match.score) {
    match.status = 'Encerrada';
  } else if (match.date && !match.score) {
    match.status = 'Agendada';
  } else {
    match.status = 'Pre-Agendada';
  }
});

export default Match;
