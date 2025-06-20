import ChampionshipStatistics from '../models/championshipStatistics.js';
import Participant from '../models/participant.js';
import Team from '../models/team.js';

export const getChampionshipOverview = async (req, res) => {
    const { id } = req.params;

    try {
        const stats = await ChampionshipStatistics.findAll({
            where: { championship_id: id },
            include: [
                { model: Participant, attributes: ['name', 'nickname'] },
                { model: Team, attributes: ['name'] }
            ]
        });

        if (!stats.length) {
            return res.status(404).json({ message: 'Nenhuma estatística encontrada para este campeonato.' });
        }

        const topPlayers = stats
            .map(stat => ({
                participant_id: stat.participant_id,
                name: stat.Participant.name,
                nickname: stat.Participant.nickname,
                team: stat.Team.name,
                kills: stat.kills,
                MVPs: stat.MVPs,
                first_kills: stat.first_kills
            }))
            .sort((a, b) => b.kills - a.kills)
            .slice(0, 5);

        const totalParticipants = new Set(stats.map(s => s.participant_id)).size;
        const totalKills = stats.reduce((sum, s) => sum + s.kills, 0);
        const totalMVPs = stats.reduce((sum, s) => sum + s.MVPs, 0);

        res.json({
            championship_id: id,
            summary: {
                totalParticipants,
                totalKills,
                totalMVPs
            },
            topPlayers
        });

    } catch (err) {
        res.status(500).json({ error: 'Erro ao gerar estatísticas do campeonato: ' + err.message });
    }
};

export const getTeamStatistics = async (req, res) => {
    const { id } = req.params;

    try {
        const stats = await ChampionshipStatistics.findAll({
            where: { championship_id: id },
            include: [{ model: Team, attributes: ['name'] }]
        });

        if (!stats.length) {
            return res.status(404).json({ message: 'Nenhuma estatística encontrada para este campeonato.' });
        }

        const teamStatsMap = {};

        for (const stat of stats) {
            const teamId = stat.team_id;
            if (!teamStatsMap[teamId]) {
                teamStatsMap[teamId] = {
                    team_id: teamId,
                    team_name: stat.Team.name,
                    total_kills: 0,
                    total_assists: 0,
                    total_deaths: 0,
                    total_MVPs: 0
                };
            }
            teamStatsMap[teamId].total_kills += stat.kills;
            teamStatsMap[teamId].total_assists += stat.assists;
            teamStatsMap[teamId].total_deaths += stat.deaths;
            teamStatsMap[teamId].total_MVPs += stat.MVPs;
        }

        const teamStats = Object.values(teamStatsMap);

        res.json(teamStats);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar estatísticas por time: ' + err.message });
    }
};

export const getAllPlayerStatsInChampionship = async (req, res) => {
    const { id } = req.params;

    try {
        const stats = await ChampionshipStatistics.findAll({
            where: { championship_id: id },
            include: [
                { model: Participant, attributes: ['name', 'nickname'] },
                { model: Team, attributes: ['name'] }
            ]
        });

        if (!stats.length) {
            return res.status(404).json({ message: 'Nenhuma estatística encontrada para este campeonato.' });
        }

        const players = stats.map(stat => ({
            participant_id: stat.participant_id,
            name: stat.Participant.name,
            nickname: stat.Participant.nickname,
            team: stat.Team.name,
            kills: stat.kills,
            assists: stat.assists,
            deaths: stat.deaths,
            MVPs: stat.MVPs,
            spike_plants: stat.spike_plants,
            spike_defuses: stat.spike_defuses,
            first_kills: stat.first_kills
        }));

        res.json(players);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar estatísticas dos jogadores: ' + err.message });
    }
};

export const getStatsByPlayerId = async (req, res) => {
    const { playerId } = req.params;

    try {
        const stats = await ChampionshipStatistics.findAll({
            where: { participant_id: playerId },
            include: [
                { model: Participant, attributes: ['name', 'nickname'] },
                { model: Team, attributes: ['name'] }
            ]
        });

        if (!stats.length) {
            return res.status(404).json({ message: 'Nenhuma estatística encontrada para este jogador.' });
        }

        const playerStats = stats.map(stat => ({
            championship_id: stat.championship_id,
            kills: stat.kills,
            assists: stat.assists,
            deaths: stat.deaths,
            MVPs: stat.MVPs,
            first_kills: stat.first_kills,
            spike_plants: stat.spike_plants,
            spike_defuses: stat.spike_defuses,
            team: stat.Team.name
        }));

        res.json({
            participant_id: playerId,
            name: stats[0].Participant.name,
            nickname: stats[0].Participant.nickname,
            stats: playerStats
        });

    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar estatísticas do jogador: ' + err.message });
    }
};


export const createChampionshipStats = async (req, res) => {
    try {
        const stats = await ChampionshipStatistics.create(req.body);
        res.status(201).json(stats);
    } catch (err) {
        res.status(400).json({ error: 'Erro ao criar estatísticas: ' + err.message });
    }
};

export const getAllChampionshipStats = async (_req, res) => {
    try {
        const stats = await ChampionshipStatistics.findAll();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar estatísticas: ' + err.message });
    }
};

export const getChampionshipStatsById = async (req, res) => {
    try {
        const stats = await ChampionshipStatistics.findByPk(req.params.id);
        if (!stats) return res.status(404).json({ error: 'Estatísticas não encontradas.' });
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar estatísticas por ID: ' + err.message });
    }
};

export const updateChampionshipStats = async (req, res) => {
    try {
        const stats = await ChampionshipStatistics.findByPk(req.params.id);
        if (!stats) return res.status(404).json({ error: 'Estatísticas não encontradas.' });
        await stats.update(req.body);
        res.json(stats);
    } catch (err) {
        res.status(400).json({ error: 'Erro ao atualizar estatísticas: ' + err.message });
    }
};

export const deleteChampionshipStats = async (req, res) => {
    try {
        const stats = await ChampionshipStatistics.findByPk(req.params.id);
        if (!stats) return res.status(404).json({ error: 'Estatísticas não encontradas.' });
        await stats.destroy();
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar estatísticas: ' + err.message });
    }
};
