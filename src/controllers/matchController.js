import Match from '../models/match.js';
import Team from '../models/team.js';
import Championship from '../models/championship.js';

// Criar partida
export const createMatch = async (req, res) => {
  try {
    const {
      championship_id,
      teamA_id,
      teamB_id,
      date,
      stage,
      winner_team_id,
      score,
      map
    } = req.body;

    const newMatch = await Match.create({
      championship_id,
      teamA_id,
      teamB_id,
      date,
      stage,
      winner_team_id,
      score,
      map
    });

    res.status(201).json({
      message: 'Partida criada com sucesso.',
      match: newMatch
    });
  } catch (error) {
    console.error('Erro ao criar partida:', error);
    res.status(500).json({ error: 'Erro ao criar a partida.' });
  }
};

// Listar todas as partidas
export const getAllMatches = async (req, res) => {
  try {
    const matches = await Match.findAll({
      include: [
        { model: Team, as: 'TeamA' },
        { model: Team, as: 'TeamB' },
        { model: Team, as: 'Winner' },
        { model: Championship }
      ]
    });

    res.status(200).json(matches);
  } catch (error) {
    console.error('Erro ao buscar partidas:', error);
    res.status(500).json({ error: 'Erro ao buscar as partidas.' });
  }
};

// Buscar partida por ID
export const getMatchById = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findByPk(matchId, {
      include: [
        { model: Team, as: 'TeamA' },
        { model: Team, as: 'TeamB' },
        { model: Team, as: 'Winner' },
        { model: Championship }
      ]
    });

    if (!match) {
      return res.status(404).json({ error: 'Partida não encontrada.' });
    }

    res.status(200).json(match);
  } catch (error) {
    console.error('Erro ao buscar partida:', error);
    res.status(500).json({ error: 'Erro ao buscar a partida.' });
  }
};

// Atualizar partida
export const updateMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Partida não encontrada.' });
    }

    await match.update(req.body);
    res.status(200).json({ message: 'Partida atualizada com sucesso.', match });
  } catch (error) {
    console.error('Erro ao atualizar partida:', error);
    res.status(500).json({ error: 'Erro ao atualizar a partida.' });
  }
};

// Deletar partida
export const deleteMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Partida não encontrada.' });
    }

    await match.destroy();
    res.status(200).json({ message: 'Partida removida com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar partida:', error);
    res.status(500).json({ error: 'Erro ao deletar a partida.' });
  }
};
