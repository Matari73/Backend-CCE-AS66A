const User = require('./user');
const Team = require('./team');
const Participant = require('./participant');
const Championship = require('./championship');
const Match = require('./match');
const Subscription = require('./subscription');
const Agent = require('./agent');
const ParticipantStatistics = require('./participantStatistics');
const ChampionshipStatistics = require('./championshipStatistics');

/* ========== User Relations ========== */
User.hasMany(Championship, { foreignKey: 'user_id' });
Championship.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Team, { foreignKey: 'user_id' });
Team.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Participant, { foreignKey: 'user_id' });
Participant.belongsTo(User, { foreignKey: 'user_id' });

/* ========== Team Relations ========== */
Team.hasMany(Participant, { foreignKey: 'team_id' });
Participant.belongsTo(Team, { foreignKey: 'team_id' });

Team.hasMany(Subscription, { foreignKey: 'team_id' });
Subscription.belongsTo(Team, { foreignKey: 'team_id' });

/* ========== Championship Relations ========== */
Championship.hasMany(Match, { foreignKey: 'championship_id' });
Match.belongsTo(Championship, { foreignKey: 'championship_id' });

Championship.hasMany(Subscription, { foreignKey: 'championship_id' });
Subscription.belongsTo(Championship, { foreignKey: 'championship_id' });

Championship.hasMany(ChampionshipStatistics, { foreignKey: 'championship_id' });
ChampionshipStatistics.belongsTo(Championship, { foreignKey: 'championship_id' });

/* ========== Match Relations ========== */
Match.hasMany(ParticipantStatistics, { foreignKey: 'match_id' });
ParticipantStatistics.belongsTo(Match, { foreignKey: 'match_id' });

/* ========== Participant Relations ========== */
Participant.hasMany(ParticipantStatistics, { foreignKey: 'participant_id' });
ParticipantStatistics.belongsTo(Participant, { foreignKey: 'participant_id' });

Participant.hasMany(ChampionshipStatistics, { foreignKey: 'participant_id' });
ChampionshipStatistics.belongsTo(Participant, { foreignKey: 'participant_id' });

/* ========== Agent Relations ========== */
Agent.hasMany(ParticipantStatistics, { foreignKey: 'agent_id' });
ParticipantStatistics.belongsTo(Agent, { foreignKey: 'agent_id' });

/* ========== Team (again) in ChampionshipStatistics ========== */
Team.hasMany(ChampionshipStatistics, { foreignKey: 'team_id' });
ChampionshipStatistics.belongsTo(Team, { foreignKey: 'team_id' });

/* ========== Match — winner relation (self-reference to Team) ========== */
Team.hasMany(Match, { foreignKey: 'teamA_id', as: 'TeamA' });
Team.hasMany(Match, { foreignKey: 'teamB_id', as: 'TeamB' });
Team.hasMany(Match, { foreignKey: 'winner_team_id', as: 'WinnerTeam' });

Match.belongsTo(Team, { foreignKey: 'teamA_id', as: 'TeamA' });
Match.belongsTo(Team, { foreignKey: 'teamB_id', as: 'TeamB' });
Match.belongsTo(Team, { foreignKey: 'winner_team_id', as: 'WinnerTeam' });

module.exports = {
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
