import ParticipantStatistics from '../models/participantStatistics.js';
import Participant from '../models/participant.js';
import Match from '../models/match.js';
import { sequelize } from '../db/db.js';

// Funções Auxiliares
const calculateKDA = (kills, assists, deaths) => {
  return (kills + assists) / Math.max(1, deaths);
};

const calculateACS = (kills, assists, spike_plants, spike_defuses) => {
  return (kills * 150) + (assists * 50) + (spike_plants * 100) + (spike_defuses * 100);
};

const validateStatsCreation = async (participant_id, match_id) => {
  const participant = await Participant.findByPk(participant_id);
  if (participant?.is_coach) {
    throw new Error('Coaches não podem ter estatísticas de jogo.');
  }

  const match = await Match.findByPk(match_id);
  if (match?.status !== 'Finalizado') {
    throw new Error('Estatísticas só podem ser criadas após a finalização da partida (status: "finalizado")');
  }

  return {
    team_id: participant.team_id,
    match_status: match.status,
  };
};

export const createParticipantStats = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { participant_id, match_id, ...rest } = req.body;

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
          attributes: ['name', 'nickname'],
          required: true
        }
      ],
      group: ['participant_id', 'Participant.participant_id'],
      order: [[sequelize.literal('avg_kda'), 'DESC']],
      limit: 10,
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