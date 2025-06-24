import ParticipantStatistics from '../models/participantStatistics.js';
import Participant from '../models/participant.js';
import Match from '../models/match.js';
import Team from '../models/team.js';
import Agent from '../models/agent.js';
import Subscription from '../models/subscription.js';
import Championship from '../models/championship.js';
import { sequelize } from '../db/db.js';

// Funções Auxiliares
const calculateKDA = (kills, assists, deaths) => {
  return (kills + assists) / Math.max(1, deaths); // Evita divisão por zero
};

const calculateACS = (kills, assists, spike_plants, spike_defuses) => {
  return (kills * 150) + (assists * 50) + (spike_plants * 100) + (spike_defuses * 100);
};

const validateStatsCreation = async (participant_id, match_id) => {
  // Verifica se o participant é coach
  const participant = await Participant.findByPk(participant_id);
  if (participant?.is_coach) {
    throw new Error('Coaches não podem ter estatísticas de jogo.');
  }

  // Verifica se a partida está "Finalizada"
  const match = await Match.findByPk(match_id);
  if (match?.status !== 'Finalizada') {
    throw new Error('Estatísticas só podem ser criadas após o encerramento da partida (status: "Finalizada")');
  }

  return {
    team_id: participant.team_id, // Retorna team_id para uso no controller
    match_status: match.status,
  };
};

// CRUD Principal
export const createParticipantStats = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { participant_id, match_id, ...rest } = req.body;

    // Validações combinadas (coach + status da partida)
    const { team_id } = await validateStatsCreation(participant_id, match_id);
    if (!team_id) throw new Error('Jogador não está em um time.');

    // Cálculos automáticos
    const { kills, assists, deaths, spike_plants, spike_defuses } = rest;
    const statsData = {
      ...rest,
      participant_id,
      match_id,
      team_id, // Incluído automaticamente
      kda: calculateKDA(kills, assists, deaths),
      average_combat_score: calculateACS(kills, assists, spike_plants, spike_defuses),
    };

    const stats = await ParticipantStatistics.create(statsData, { transaction });
    await transaction.commit();
    res.status(201).json(stats);
  } catch (err) {
    await transaction.rollback();
    res.status(400).json({ 
      error: err.message.includes('Coaches') || err.message.includes('finished matches') 
        ? err.message 
        : 'Failed to create stats',
      details: err.message,
    });
  }
};

export const getAllParticipantStats = async (_req, res) => {
  try {
    const stats = await ParticipantStatistics.findAll();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch stats',
      details: err.message 
    });
  }
};

export const getParticipantStatsById = async (req, res) => {
  try {
    const stats = await ParticipantStatistics.findByPk(req.params.id);
    if (!stats) {
      return res.status(404).json({ error: 'Estatística não encontrada com este ID.' });
    }
    res.json(stats);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch stats',
      details: err.message 
    });
  }
};

export const updateParticipantStats = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const stats = await ParticipantStatistics.findByPk(req.params.id);
    if (!stats) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Estatística não encontrada com este ID.' });
    }

    const { kills, assists, deaths, spike_plants, spike_defuses } = req.body;
    const kda = calculateKDA(kills, assists, deaths);
    const average_combat_score = calculateACS(kills, assists, spike_plants, spike_defuses);

    const updatedData = {
      ...req.body,
      kda,
      average_combat_score,
      total_score: average_combat_score,
    };

    await stats.update(updatedData, { transaction });
    await transaction.commit();
    res.json(stats);
  } catch (err) {
    await transaction.rollback();
    res.status(400).json({ 
      error: 'Failed to update stats',
      details: err.message 
    });
  }
};

export const deleteParticipantStats = async (req, res) => {
  try {
    const stats = await ParticipantStatistics.findByPk(req.params.id);
    if (!stats) {
      return res.status(404).json({ error: 'Estatística não encontrada com este ID.' });
    }
    await stats.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to delete stats',
      details: err.message 
    });
  }
};

export const getStatsByPlayer = async (req, res) => {
  try {
    const stats = await ParticipantStatistics.findAll({ 
      where: { participant_id: req.params.playerId },
      order: [['match_id', 'DESC']] // Ordena por partida mais recente
    });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch player stats',
      details: err.message 
    });
  }
};

export const getStatsByMatch = async (req, res) => {
  try {
    const stats = await ParticipantStatistics.findAll({ 
      where: { match_id: req.params.matchId },
      order: [['kda', 'DESC']] // Ordena por melhor desempenho
    });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch match stats',
      details: err.message 
    });
  }
};

export const getTopPlayers = async (req, res) => {
  try {
    const { championshipId } = req.params; 
    
    const topPlayers = await ParticipantStatistics.findAll({
      attributes: [
        'participant_id',
        [sequelize.fn('AVG', sequelize.col('kda')), 'avg_kda'],
        [sequelize.fn('SUM', sequelize.col('kills')), 'total_kills'],
        [sequelize.fn('SUM', sequelize.col('assists')), 'total_assists'],
        [sequelize.fn('SUM', sequelize.col('deaths')), 'total_deaths'],
        [sequelize.fn('COUNT', sequelize.col('statistic_id')), 'matches_played']
      ],
      include: [
        {
          model: Match,
          where: { championship_id: championshipId },
          attributes: [],
          required: true
        },
        {
          model: Participant,
          attributes: ['participant_id', 'name', 'nickname']
        }
      ],
      group: ['ParticipantStatistics.participant_id', 'Participant.participant_id'],
      order: [[sequelize.literal('avg_kda'), 'DESC']],
      limit: 10
    });

    // Formatação da resposta
    const formattedPlayers = topPlayers.map(player => ({
      participant_id: player.participant_id,
      name: player.Participant.name,
      nickname: player.Participant.nickname,
      avg_kda: parseFloat(player.get('avg_kda')).toFixed(2),
      total_kills: player.get('total_kills'),
      total_assists: player.get('total_assists'),
      total_deaths: player.get('total_deaths'),
      matches_played: player.get('matches_played')
    }));

    res.json(formattedPlayers);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch top players',
      details: err.message 
    });
  }
};

export const getStatsByTeam = async (req, res) => {
  try {
    const stats = await ParticipantStatistics.findAll({
      where: { team_id: req.params.teamId },
      include: [{ model: Participant, attributes: ['name', 'nickname'] }], // Join com Participant
      order: [['kda', 'DESC']],
    });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch team stats',
      details: err.message,
    });
  }
};

export const getAllPlayersStats = async (req, res) => {
  try {
    const playersStats = await ParticipantStatistics.findAll({
      attributes: [
        'participant_id',
        [sequelize.fn('SUM', sequelize.col('kills')), 'total_kills'],
        [sequelize.fn('SUM', sequelize.col('deaths')), 'total_deaths'],
        [sequelize.fn('SUM', sequelize.col('assists')), 'total_assists'],
        [sequelize.fn('COUNT', sequelize.col('match_id')), 'total_matches'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN "MVPs" > 0 THEN 1 ELSE 0 END')), 'mvp_count'],
        [sequelize.fn('AVG', sequelize.col('kda')), 'kda_ratio'],
      ],
      include: [
        {
          model: Participant,
          attributes: ['name', 'nickname', 'team_id'],
          include: [
            {
              model: Team,
              attributes: ['name'],
            }
          ]
        }
      ],
      group: ['participant_id', 'Participant.participant_id', 'Participant.Team.team_id'],
      raw: false,
    });

    const formattedStats = playersStats.map(stat => ({
      participant_id: stat.participant_id,
      name: stat.Participant.name,
      nickname: stat.Participant.nickname,
      team_id: stat.Participant.team_id,
      team_name: stat.Participant.Team?.name || 'Sem equipe',
      total_kills: parseInt(stat.get('total_kills')) || 0,
      total_deaths: parseInt(stat.get('total_deaths')) || 0,
      total_assists: parseInt(stat.get('total_assists')) || 0,
      total_matches: parseInt(stat.get('total_matches')) || 0,
      mvp_count: parseInt(stat.get('mvp_count')) || 0,
      kda_ratio: parseFloat(stat.get('kda_ratio')).toFixed(2) || 0,
      win_rate: 0, // Placeholder: would require join with match results
    }));

    res.json(formattedStats);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch all players stats',
      details: err.message 
    });
  }
};

export const getAllTeamsStats = async (req, res) => {
  try {
    const teamsStats = await ParticipantStatistics.findAll({
      attributes: [
        'team_id',
        [sequelize.fn('SUM', sequelize.col('kills')), 'total_kills'],
        [sequelize.fn('SUM', sequelize.col('deaths')), 'total_deaths'],
        [sequelize.fn('SUM', sequelize.col('assists')), 'total_assists'],
        [sequelize.fn('COUNT', sequelize.literal('DISTINCT match_id')), 'total_matches'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN "MVPs" > 0 THEN 1 ELSE 0 END')), 'mvp_count'],
        [sequelize.fn('AVG', sequelize.col('average_combat_score')), 'avg_match_score'],
      ],
      include: [
        {
          model: Team,
          attributes: ['name'],
        }
      ],
      group: ['team_id', 'Team.team_id'],
      raw: false,
    });

    const formattedStats = teamsStats.map(stat => ({
      team_id: stat.team_id,
      team_name: stat.Team.name,
      total_kills: parseInt(stat.get('total_kills')) || 0,
      total_deaths: parseInt(stat.get('total_deaths')) || 0,
      total_assists: parseInt(stat.get('total_assists')) || 0,
      total_matches: parseInt(stat.get('total_matches')) || 0,
      wins: 0, // Placeholder: would require calculation from match results
      losses: 0, // Placeholder: would require calculation from match results
      win_rate: 0, // Placeholder: would require calculation from match results
      mvp_count: parseInt(stat.get('mvp_count')) || 0,
      avg_match_score: parseFloat(stat.get('avg_match_score')).toFixed(2) || 0,
    }));

    res.json(formattedStats);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch all teams stats',
      details: err.message 
    });
  }
};

export const getPlayerAgentStats = async (req, res) => {
  try {
    const { playerId } = req.params;
    
    const agentStats = await ParticipantStatistics.findAll({
      where: { participant_id: playerId },
      attributes: [
        'agent_id',
        [sequelize.fn('COUNT', sequelize.col('match_id')), 'matches_played'],
        [sequelize.fn('AVG', sequelize.col('kills')), 'avg_kills'],
        [sequelize.fn('AVG', sequelize.col('deaths')), 'avg_deaths'],
        [sequelize.fn('AVG', sequelize.col('assists')), 'avg_assists'],
        [sequelize.fn('AVG', sequelize.col('kda')), 'kda_ratio'],
      ],
      include: [
        {
          model: Agent,
          attributes: ['name'],
        }
      ],
      group: ['agent_id', 'Agent.agent_id'],
      raw: false,
    });

    const formattedStats = agentStats.map(stat => ({
      agent_id: stat.agent_id,
      agent_name: stat.Agent?.name || 'Unknown Agent',
      matches_played: parseInt(stat.get('matches_played')) || 0,
      win_rate: 0, // Placeholder: would require calculation from match results
      avg_kills: parseFloat(stat.get('avg_kills')).toFixed(2) || 0,
      avg_deaths: parseFloat(stat.get('avg_deaths')).toFixed(2) || 0,
      avg_assists: parseFloat(stat.get('avg_assists')).toFixed(2) || 0,
      kda_ratio: parseFloat(stat.get('kda_ratio')).toFixed(2) || 0,
    }));

    res.json(formattedStats);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch player agent stats',
      details: err.message 
    });
  }
};

export const getPlayerMapStats = async (req, res) => {
  try {
    const { playerId } = req.params;
    
    const mapStats = await ParticipantStatistics.findAll({
      where: { participant_id: playerId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('ParticipantStatistics.match_id')), 'matches_played'],
        [sequelize.fn('SUM', sequelize.col('kills')), 'total_kills'],
        [sequelize.fn('SUM', sequelize.col('deaths')), 'total_deaths'],
        [sequelize.fn('AVG', sequelize.col('average_combat_score')), 'avg_score'],
      ],
      include: [
        {
          model: Match,
          attributes: ['map'],
        }
      ],
      group: ['Match.map'],
      raw: false,
    });

    const formattedStats = mapStats.map(stat => ({
      map_name: stat.Match?.map || 'Unknown Map',
      matches_played: parseInt(stat.get('matches_played')) || 0,
      wins: 0, // Placeholder: would require calculation from match results
      losses: 0, // Placeholder: would require calculation from match results
      win_rate: 0, // Placeholder: would require calculation from match results
      avg_score: parseFloat(stat.get('avg_score')).toFixed(2) || 0,
      total_kills: parseInt(stat.get('total_kills')) || 0,
      total_deaths: parseInt(stat.get('total_deaths')) || 0,
    }));

    res.json(formattedStats);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch player map stats',
      details: err.message 
    });
  }
};

export const getTeamAgentStats = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const agentStats = await ParticipantStatistics.findAll({
      where: { team_id: teamId },
      attributes: [
        'agent_id',
        [sequelize.fn('COUNT', sequelize.col('match_id')), 'matches_played'],
        [sequelize.fn('SUM', sequelize.col('kills')), 'total_kills'],
        [sequelize.fn('SUM', sequelize.col('deaths')), 'total_deaths'],
        [sequelize.fn('SUM', sequelize.col('assists')), 'total_assists'],
        [sequelize.fn('AVG', sequelize.col('kda')), 'avg_kda'],
      ],
      include: [
        {
          model: Agent,
          attributes: ['name'],
        }
      ],
      group: ['agent_id', 'Agent.agent_id'],
      raw: false,
    });

    const formattedStats = agentStats.map(stat => ({
      agent_id: stat.agent_id,
      agent_name: stat.Agent?.name || 'Unknown Agent',
      matches_played: parseInt(stat.get('matches_played')) || 0,
      total_kills: parseInt(stat.get('total_kills')) || 0,
      total_deaths: parseInt(stat.get('total_deaths')) || 0,
      total_assists: parseInt(stat.get('total_assists')) || 0,
      avg_kda: parseFloat(stat.get('avg_kda')).toFixed(2) || 0,
      win_rate: 0, // Placeholder: would require calculation from match results
    }));

    res.json(formattedStats);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch team agent stats',
      details: err.message 
    });
  }
};

export const getTeamMapStats = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const mapStats = await ParticipantStatistics.findAll({
      where: { team_id: teamId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('ParticipantStatistics.match_id')), 'total_matches'],
        [sequelize.fn('SUM', sequelize.col('kills')), 'total_kills'],
        [sequelize.fn('SUM', sequelize.col('deaths')), 'total_deaths'],
        [sequelize.fn('SUM', sequelize.col('assists')), 'total_assists'],
        [sequelize.fn('AVG', sequelize.col('average_combat_score')), 'avg_combat_score'],
      ],
      include: [
        {
          model: Match,
          attributes: ['map'],
        }
      ],
      group: ['Match.map'],
      raw: false,
    });

    const formattedStats = mapStats.map(stat => ({
      map_name: stat.Match?.map || 'Unknown Map',
      total_matches: parseInt(stat.get('total_matches')) || 0,
      wins: 0, // Placeholder: would require calculation from match results
      losses: 0, // Placeholder: would require calculation from match results
      win_rate: 0, // Placeholder: would require calculation from match results
      total_kills: parseInt(stat.get('total_kills')) || 0,
      total_deaths: parseInt(stat.get('total_deaths')) || 0,
      total_assists: parseInt(stat.get('total_assists')) || 0,
      avg_combat_score: parseFloat(stat.get('avg_combat_score')).toFixed(2) || 0,
    }));

    res.json(formattedStats);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch team map stats',
      details: err.message 
    });
  }
};

export const getTeamChampionshipHistory = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const history = await Subscription.findAll({
      where: { team_id: teamId },
      include: [
        {
          model: Championship,
          attributes: ['championship_id', 'name', 'status', 'start_date', 'end_date'],
        }
      ],
      order: [['subscription_date', 'DESC']],
    });

    const formattedHistory = await Promise.all(
      history.map(async (sub) => {
        // Get match statistics for this team in this championship
        const matchStats = await ParticipantStatistics.findAll({
          where: { team_id: teamId },
          include: [
            {
              model: Match,
              where: { championship_id: sub.Championship.championship_id },
              attributes: ['winner_team_id'],
            }
          ],
        });

        const matches_played = matchStats.length;
        const matches_won = matchStats.filter(m => m.Match.winner_team_id === parseInt(teamId)).length;
        const matches_lost = matches_played - matches_won;
        const total_kills = matchStats.reduce((sum, m) => sum + m.kills, 0);
        const total_deaths = matchStats.reduce((sum, m) => sum + m.deaths, 0);

        return {
          championship_id: sub.Championship.championship_id,
          championship_name: sub.Championship.name,
          status: sub.Championship.status === 'ongoing' ? 'Em andamento' : 
                 sub.Championship.status === 'completed' ? 'Finalizado' : 'Próximo',
          matches_played,
          matches_won,
          matches_lost,
          total_kills,
          total_deaths,
          placement: null, // Placeholder: would require additional calculation
          prize_money: 0,  // Placeholder: would require additional data
          start_date: sub.Championship.start_date,
          end_date: sub.Championship.end_date,
        };
      })
    );

    res.json(formattedHistory);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch team championship history',
      details: err.message 
    });
  }
};