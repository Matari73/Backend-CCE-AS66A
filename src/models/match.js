import { DataTypes } from 'sequelize';
import { sequelize } from '../db/db.js';

const mapOptions = [
  'Bind', 'Ascent', 'Icebox', 'Haven', 'Lotus',
  'Sunset', 'Abyss', 'Breeze', 'Fracture', 'Pearl', 'Split'
];

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
    allowNull: false,
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
    allowNull: true,
  },
  map: {
    type: DataTypes.ENUM(...mapOptions),
    allowNull: false,
  },
}, {
  tableName: 'matches',
  timestamps: false,
});

export default Match;
