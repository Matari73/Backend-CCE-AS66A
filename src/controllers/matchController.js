import Match from '../models/match.js';
import Team from '../models/team.js';
import Championship from '../models/championship.js';
import { handleSingleEliminationNextPhase, handleDoubleEliminationNextPhase } from '../services/championshipService.js';

export const createMatch = async (req, res) => {
    try {
        const match = await Match.create(req.body);
        res.status(201).json(match);
    } catch (error) {
        res.status(400).json({ error: error.message });
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
};

export const bulkUpdateMatches = async (req, res) => {
    try {
        const { matches } = req.body;

        if (!Array.isArray(matches) || matches.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Matches array is required'
            });
        }

        const results = [];

        for (const matchData of matches) {
            const { match_id, score } = matchData;

            const match = await Match.findByPk(match_id);
            if (!match) {
                results.push({ match_id, success: false, error: 'Match not found' });
                continue;
            }

            // Determine winner based on score
            let winner_team_id = null;
            let score_details = null;

            if (score && typeof score === 'object' && score.teamA !== undefined && score.teamB !== undefined) {
                if (score.teamA > score.teamB) {
                    winner_team_id = match.teamA_id;
                } else if (score.teamB > score.teamA) {
                    winner_team_id = match.teamB_id;
                }
                score_details = `TeamA: ${score.teamA} x ${score.teamB} :TeamB`;
            }

            await match.update({
                winner_team_id,
                score: score,
                score_details
            });

            results.push({
                match_id,
                success: true,
                message: 'Updated successfully',
                winner_team_id,
                score_details
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
};
