import User from './user.js';
import Team from './team.js';
import Participant from './participant.js';
import Championship from './championship.js';
import Match from './match.js';
import Subscription from './subscription.js';
import Agent from './agent.js';
import ParticipantStatistics from './participantStatistics.js';
import ChampionshipStatistics from './championshipStatistics.js';

// --------------------
// User relations
// --------------------

User.hasMany(Championship, { foreignKey: 'user_id' });
Championship.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Team, { foreignKey: 'user_id' });
Team.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Participant, { foreignKey: 'user_id' });
Participant.belongsTo(User, { foreignKey: 'user_id' });

// --------------------
// Team relations
// --------------------

Team.hasMany(Participant, { foreignKey: 'team_id' });
Participant.belongsTo(Team, { foreignKey: 'team_id' });

Team.hasMany(Subscription, { foreignKey: 'team_id' });
Subscription.belongsTo(Team, { foreignKey: 'team_id' });

Team.hasMany(ChampionshipStatistics, { foreignKey: 'team_id' });
ChampionshipStatistics.belongsTo(Team, { foreignKey: 'team_id' });

// --------------------
// Championship relations
// --------------------

Championship.hasMany(Match, { foreignKey: 'championship_id' });
Match.belongsTo(Championship, { foreignKey: 'championship_id' });

Championship.hasMany(Subscription, { foreignKey: 'championship_id' });
Subscription.belongsTo(Championship, { foreignKey: 'championship_id' });

Championship.hasMany(ChampionshipStatistics, { foreignKey: 'championship_id' });
ChampionshipStatistics.belongsTo(Championship, { foreignKey: 'championship_id' });

// Many-to-Many: Championship <-> Team via Subscription
Championship.belongsToMany(Team, {
  through: Subscription,
  foreignKey: 'championship_id'
});
Team.belongsToMany(Championship, {
  through: Subscription,
  foreignKey: 'team_id'
});

// --------------------
// Match relations
// --------------------

// Relacionamentos nomeados com Team
Match.belongsTo(Team, { as: 'TeamA', foreignKey: 'teamA_id' });
Match.belongsTo(Team, { as: 'TeamB', foreignKey: 'teamB_id' });
Match.belongsTo(Team, { as: 'Winner', foreignKey: 'winner_team_id' });

Match.hasMany(ParticipantStatistics, { foreignKey: 'match_id' });
ParticipantStatistics.belongsTo(Match, { foreignKey: 'match_id' });

// --------------------
// Participant relations
// --------------------

Participant.hasMany(ParticipantStatistics, { foreignKey: 'participant_id' });
ParticipantStatistics.belongsTo(Participant, { foreignKey: 'participant_id' });

Participant.hasMany(ChampionshipStatistics, { foreignKey: 'participant_id' });
ChampionshipStatistics.belongsTo(Participant, { foreignKey: 'participant_id' });

// --------------------
// Agent relations
// --------------------

Agent.hasMany(ParticipantStatistics, { foreignKey: 'agent_id' });
ParticipantStatistics.belongsTo(Agent, { foreignKey: 'agent_id' });

// --------------------
// Export models
// --------------------

export {
  User,
  Team,
  Participant,
  Championship,
  Match,
  Subscription,
  Agent,
  ParticipantStatistics,
  ChampionshipStatistics,
};
