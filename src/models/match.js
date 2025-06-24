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
    type: DataTypes.DATE,
    allowNull: true
  },
  stage: {
    type: DataTypes.STRING,
    allowNull: false
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
    type: DataTypes.ENUM('Planejada', 'Agendada', 'Finalizada'),
    allowNull: false,
    defaultValue: 'Planejada'
  },
  next_match_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'matches',
      key: 'match_id'
    }
  }
}, {
  tableName: 'matches',
  timestamps: false,
});

// Atualização automática de status e cálculo do vencedor
Match.beforeSave((match) => {
  const teamAScore = match.score?.teamA ?? 0;
  const teamBScore = match.score?.teamB ?? 0;

<<<<<<< HEAD
  // Atualiza status
  if (hasDate && hasScore) {
    match.status = 'Finalizada';

    const teamAScore = match.score?.teamA ?? 0;
    const teamBScore = match.score?.teamB ?? 0;

    if (!match.winner_team_id) {
      match.winner_team_id = teamAScore > teamBScore ? match.teamA_id : match.teamB_id;
    }

  } else if (hasDate && !hasScore) {
    match.status = 'Agendada';
  } else {
    match.status = 'Planejada';
=======
  if (!match.winner_team_id) {
    match.winner_team_id = teamAScore > teamBScore ? match.teamA_id : match.teamB_id;
>>>>>>> c9cb035 (Adding status update possibility)
  }
});

export default Match;
