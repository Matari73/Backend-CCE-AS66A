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

export const generateBracketNextPhase = async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.body;

    if (!['single', 'double'].includes(format)) {
      return res.status(400).json({ message: 'Formato inválido. Use "single" ou "double"' });
    }

    let result;
    if (format === 'single') {
      result = handleSingleEliminationNextPhase(id);
    } else {
      result = handleDoubleEliminationNextPhase(id);
    }

    return res.status(201).json({
      message: `Chaveamento (${format}) gerado com sucesso!`,
      data: result
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
      const { match_id, score, map } = matchData;

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

      if (!score || typeof score !== 'object' || !score.teamA || !score.teamB) {
        results.push({ match_id, success: false, error: 'Invalid score format' });
        continue;
      }

      let winner_team_id = null;
      if (score.teamA > score.teamB) {
        winner_team_id = match.teamA_id;
      } else if (score.teamB > score.teamA) {
        winner_team_id = match.teamB_id;
      }

      const updateData = { winner_team_id, score };
      if (map) updateData.map = map;

      await match.update(updateData);
      results.push({
        match_id,
        success: true,
        message: 'Updated successfully',
        winner_team_id,
        score_details: `TeamA: ${score.teamA} x ${score.teamB} :TeamB`
      });
    }

    res.json({
      success: true,
      message: 'Bulk update completed',
      results
    });

  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update matches'
    });
  }
};

export const generateNextPhase = async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.body;

    console.log(`🔄 Generating next phase for championship ${id} with format ${format}`);

    if (!['single', 'double'].includes(format)) {
      return res.status(400).json({ message: 'Formato inválido. Use "single" ou "double"' });
    }

    // Buscar TODAS as partidas do campeonato
    const allMatches = await Match.findAll({
      where: { championship_id: parseInt(id) }
    });

    console.log(`📊 Total matches in championship: ${allMatches.length}`);

    const pendingMatches = await Match.findAll({
      where: {
        championship_id: parseInt(id),
        winner_team_id: null
      }
    });

    console.log(`⏳ Pending matches: ${pendingMatches.length}`);

    if (pendingMatches.length > 0) {
      console.log('❌ Found pending matches:', pendingMatches.map(m => ({
        match_id: m.match_id,
        stage: m.stage,
        teamA_id: m.teamA_id,
        teamB_id: m.teamB_id
      })));

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

    console.log(`✅ Completed matches: ${completedMatches.length}`);
    console.log('🏆 Winners and match details:');
    completedMatches.forEach(m => {
      const loser = m.winner_team_id === m.teamA_id ? m.teamB_id : m.teamA_id;
      console.log(`  Match ${m.match_id}: Stage=${m.stage}, Bracket=${m.bracket}, TeamA=${m.teamA_id}, TeamB=${m.teamB_id}, Winner=${m.winner_team_id}, Loser=${loser}`);
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

    console.log(`🏆 Winners advancing: ${winners.length}`);

    let result;
    if (format === 'single') {
      result = await handleSingleEliminationNextPhase(id);
    } else {
      result = await handleDoubleEliminationNextPhase(id);
    }

    console.log('🎉 Next phase generated successfully:', result);

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
    console.error('❌ Error generating next phase:', err);
    console.error('Stack:', err.stack);
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

    console.log(`Fetching matches for championship ${id}`);

    const whereClause = { championship_id: parseInt(id) };
    if (stage) {
      whereClause.stage = stage;
    }

    const matches = await Match.findAll({
      where: whereClause,
      order: [['date', 'ASC']]
    });

    console.log(`Found ${matches.length} matches`);

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
    console.error('Error fetching matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch matches',
      details: error.message
    });
  }
};