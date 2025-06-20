import Championship from '../models/championship.js';
import Match from '../models/match.js';
import Team from '../models/team.js';
import { Op } from 'sequelize';
import { generateSingleEliminationBracket, generateDoubleEliminationBracket, handleSingleEliminationNextPhase, handleDoubleEliminationNextPhase } from '../services/championshipService.js';

export const createChampionship = async (req, res) => {
  try {
    const newChamp = await Championship.create(req.body);
    res.status(201).json(newChamp);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao criar o campeonato: ' + err.message });
  }
};

export const getAllChampionships = async (req, res) => {
  try {
    const championships = await Championship.findAll();
    res.json(championships);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar campeonatos: ' + err.message });
  }
};

export const getChampionshipById = async (req, res) => {
  try {
    const champ = await Championship.findByPk(req.params.id);
    if (!champ) return res.status(404).json({ error: 'Campeonato não encontrado' });
    res.json(champ);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar o campeonato: ' + err.message });
  }
};

export const updateChampionship = async (req, res) => {
  try {
    const [updated] = await Championship.update(req.body, {
      where: { championship_id: req.params.id },
    });

    if (!updated) return res.status(404).json({ error: 'Campeonato não encontrado' });

    const updatedChamp = await Championship.findByPk(req.params.id);
    res.json(updatedChamp);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao atualizar o campeonato: ' + err.message });
  }
};

export const deleteChampionship = async (req, res) => {
  try {
    const deleted = await Championship.destroy({
      where: { championship_id: req.params.id },
    });

    if (!deleted) return res.status(404).json({ error: 'Campeonato não encontrado' });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir o campeonato: ' + err.message });
  }
};

export const generateBracket = async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.body;

    if (!['single', 'double'].includes(format)) {
      return res.status(400).json({ message: 'Formato inválido. Use "single" ou "double"' });
    }

    let result;
    if (format === 'single') {
      result = await generateSingleEliminationBracket(id);
    } else {
      result = await generateDoubleEliminationBracket(id);
    }

    return res.status(201).json({
      message: `Chaveamento (${format}) gerado com sucesso!`,
      data: result
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


export const generateNextPhase = async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.body;

    if (!['single', 'double'].includes(format)) {
      return res.status(400).json({ message: 'Formato inválido. Use "single" ou "double"' });
    }

    const allMatches = await Match.findAll({
      where: { championship_id: parseInt(id) }
    });

    const pendingMatches = await Match.findAll({
      where: {
        championship_id: parseInt(id),
        winner_team_id: null
      }
    });

    if (pendingMatches.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Existem ${pendingMatches.length} partidas pendentes. Complete todas as partidas antes de gerar a próxima fase.`,
        pendingMatches: pendingMatches.map(m => ({
          match_id: m.match_id,
          stage: m.stage,
          teamA_id: m.teamA_id,
          teamB_id: m.teamB_id
        }))
      });
    }

    const completedMatches = await Match.findAll({
      where: {
        championship_id: parseInt(id),
        winner_team_id: { [Op.ne]: null }
      }
    });

    const winners = completedMatches.map(m => m.winner_team_id);

    if (completedMatches.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma partida foi finalizada ainda.',
        details: {
          totalMatches: allMatches.length,
          completedMatches: 0,
          pendingMatches: pendingMatches.length
        }
      });
    }

    let result;
    if (format === 'single') {
      result = await handleSingleEliminationNextPhase(id);
    } else {
      result = await handleDoubleEliminationNextPhase(id);
    }

    return res.status(201).json({
      success: true,
      message: `Próxima fase (${format}) gerada com sucesso!`,
      data: result,
      details: {
        winnersAdvanced: winners.length,
        newMatchesGenerated: result?.matches?.length || 0
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      details: 'Verifique se todas as partidas foram finalizadas e se há vencedores suficientes.'
    });
  }
};

export const getChampionshipMatches = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.query;

    const whereClause = { championship_id: parseInt(id) };
    if (stage) {
      whereClause.stage = stage;
    }

    const matches = await Match.findAll({
      where: whereClause,
      order: [['date', 'ASC']]
    });

    if (matches.length === 0) {
      return res.json({
        success: true,
        message: 'No matches found. Generate bracket first.',
        data: [],
        total: 0
      });
    }

    // Buscar times separadamente para evitar erro de associação
    const matchesWithTeams = await Promise.all(
      matches.map(async (match) => {
        const teamA = await Team.findByPk(match.teamA_id, { attributes: ['team_id', 'name'] });
        const teamB = await Team.findByPk(match.teamB_id, { attributes: ['team_id', 'name'] });
        const winnerTeam = match.winner_team_id ?
          await Team.findByPk(match.winner_team_id, { attributes: ['team_id', 'name'] }) : null;

        return {
          ...match.toJSON(),
          TeamA: teamA,
          TeamB: teamB,
          WinnerTeam: winnerTeam
        };
      })
    );

    res.json({
      success: true,
      data: matchesWithTeams,
      total: matches.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch matches',
      details: error.message
    });
  }
};

export const bulkUpdateMatches = async (req, res) => {
  try {
    const { id } = req.params;
    const { matches } = req.body;

    if (!Array.isArray(matches) || matches.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Matches array is required'
      });
    }

    const results = [];

    for (const matchData of matches) {
      const { match_id, score, map, date } = matchData;

      const match = await Match.findOne({
        where: {
          match_id,
          championship_id: parseInt(id)
        }
      });

      if (!match) {
        results.push({ match_id, success: false, error: 'Match not found in this championship' });
        continue;
      }

      const updateData = {};

      // Atualiza score se enviado
      if (score) {
        if (
          typeof score !== 'object' ||
          typeof score.teamA !== 'number' ||
          typeof score.teamB !== 'number'
        ) {
          results.push({ match_id, success: false, error: 'Invalid score format' });
          continue;
        }

        updateData.score = score;

        if (score.teamA > score.teamB) {
          updateData.winner_team_id = match.teamA_id;
        } else if (score.teamB > score.teamA) {
          updateData.winner_team_id = match.teamB_id;
        } else {
          updateData.winner_team_id = null; // empate ou não definido
        }
      }

      // Atualiza mapa se enviado
      if (map) updateData.map = map;

      // Atualiza data se enviada e válida
      if (date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          results.push({ match_id, success: false, error: 'Invalid date format' });
          continue;
        }
        updateData.date = parsedDate;
      }

      await match.update(updateData);
      results.push({
        match_id,
        success: true,
        message: 'Updated successfully',
        ...(score && {
          winner_team_id: updateData.winner_team_id,
          score_details: `TeamA: ${score.teamA} x ${score.teamB} :TeamB`
        }),
        ...(date && { new_date: updateData.date.toISOString() })
      });
    }

    res.json({
      success: true,
      message: 'Bulk update completed',
      results
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update matches',
      details: error.message
    });
  }
};
