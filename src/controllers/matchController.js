import Match from '../models/match.js';

export const createMatch = async (req, res) => {
    try {
        const match = await Match.create(req.body);
        res.status(201).json(match);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getAllMatches = async (_req, res) => {
    try {
        const matches = await Match.findAll();
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMatchById = async (req, res) => {
    try {
        const match = await Match.findByPk(req.params.matchId);
        if (!match) {
            return res.status(404).json({ error: 'Partida não encontrada' });
        }
        res.json(match);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateMatch = async (req, res) => {
    try {
        const match = await Match.findByPk(req.params.matchId);
        if (!match) {
            return res.status(404).json({ error: 'Partida não encontrada' });
        }
        await match.update(req.body);
        res.json(match);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteMatch = async (req, res) => {
    try {
        const match = await Match.findByPk(req.params.matchId);
        if (!match) {
            return res.status(404).json({ error: 'Partida não encontrada' });
        }
        await match.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
