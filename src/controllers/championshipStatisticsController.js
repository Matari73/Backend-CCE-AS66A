import ChampionshipStatistics from '../models/championshipStatistics.js';

export const createChampionshipStats = async (req, res) => {
    try {
        const stats = await ChampionshipStatistics.create(req.body);
        res.status(201).json(stats);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getAllChampionshipStats = async (_req, res) => {
    try {
        const stats = await ChampionshipStatistics.findAll();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getChampionshipStatsById = async (req, res) => {
    try {
        const stats = await ChampionshipStatistics.findByPk(req.params.id);
        if (!stats) return res.status(404).json({ error: 'Stats not found' });
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateChampionshipStats = async (req, res) => {
    try {
        const stats = await ChampionshipStatistics.findByPk(req.params.id);
        if (!stats) return res.status(404).json({ error: 'Stats not found' });
        await stats.update(req.body);
        res.json(stats);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteChampionshipStats = async (req, res) => {
    try {
        const stats = await ChampionshipStatistics.findByPk(req.params.id);
        if (!stats) return res.status(404).json({ error: 'Stats not found' });
        await stats.destroy();
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
