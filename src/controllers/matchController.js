import Match from '../models/match.js';
import Team from '../models/team.js';
import Championship from '../models/championship.js';
import { handleSingleEliminationNextPhase, handleDoubleEliminationNextPhase } from '../services/championshipService.js';


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

export const getAllMatches = async (req, res) => {
    try {
        const { championship_id, stage, status } = req.query;

        const whereClause = {};
        if (championship_id) whereClause.championship_id = parseInt(championship_id);
        if (stage) whereClause.stage = stage;

        const matches = await Match.findAll({
            where: whereClause,
            order: [['date', 'ASC']]
        });

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
            error: 'Failed to fetch matches'
        });
    }
};


export const getMatchById = async (req, res) => {
    try {
        const { id } = req.params;

        const match = await Match.findByPk(id);
        if (!match) {
            return res.status(404).json({
                success: false,
                error: 'Match not found'
            });
        }

        const teamA = await Team.findByPk(match.teamA_id, { attributes: ['team_id', 'name'] });
        const teamB = await Team.findByPk(match.teamB_id, { attributes: ['team_id', 'name'] });
        const winnerTeam = match.winner_team_id ?
            await Team.findByPk(match.winner_team_id, { attributes: ['team_id', 'name'] }) : null;

        res.json({
            success: true,
            data: {
                ...match.toJSON(),
                TeamA: teamA,
                TeamB: teamB,
                WinnerTeam: winnerTeam
            }
        });

    } catch (error) {
        console.error('Error fetching match:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch match'
        });
    }

    res.status(200).json(match);
};

export const getChampionshipMatches = async (req, res) => {
    try {
        const { championshipId } = req.params;
        const { stage } = req.query;

        const whereClause = { championship_id: parseInt(championshipId) };
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
        console.error('Error fetching championship matches:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch championship matches'
        });
    }
};

export const generateNextRound = async (req, res) => {
    try {
        const { championshipId } = req.params;

        // Get championship to determine format
        const championship = await Championship.findByPk(championshipId);
        if (!championship) {
            return res.status(404).json({
                success: false,
                error: 'Championship not found'
            });
        }

        const currentMatches = await Match.findAll({
            where: {
                championship_id: parseInt(championshipId),
                winner_team_id: null
            }
        });

        if (currentMatches.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Existem ${currentMatches.length} partidas pendentes. Complete todas as partidas antes de gerar a próxima fase.`,
                pendingMatches: currentMatches.map(match => ({
                    match_id: match.match_id,
                    stage: match.stage,
                    teamA_id: match.teamA_id,
                    teamB_id: match.teamB_id
                }))
            });
        }

        let result;
        if (championship.format === 'single') {
            result = await handleSingleEliminationNextPhase(championshipId);
        } else if (championship.format === 'double') {
            result = await handleDoubleEliminationNextPhase(championshipId);
        } else {
            return res.status(400).json({
                success: false,
                error: 'Formato inválido. Use "single" ou "double"'
            });
        }

        res.json({
            success: true,
            message: `Próxima fase (${championship.format}) gerada com sucesso!`,
            data: result
        });

    } catch (error) {
        console.error('Error generating next round:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate next round'
        });
    }

    await match.destroy();
    res.status(200).json({ message: 'Partida removida com sucesso.' });
};
