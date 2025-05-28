// src/controllers/participantStatisticsController.js
import ParticipantStatistics from '../models/participantStatistics.js';

export const createParticipantStats = async (req, res) => {
  try {
    const stats = await ParticipantStatistics.create(req.body);
    res.status(201).json(stats);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllParticipantStats = async (_req, res) => {
  try {
    const stats = await ParticipantStatistics.findAll();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getParticipantStatsById = async (req, res) => {
  try {
    const stats = await ParticipantStatistics.findByPk(req.params.id);
    if (!stats) return res.status(404).json({ error: 'Stats not found' });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateParticipantStats = async (req, res) => {
  try {
    const stats = await ParticipantStatistics.findByPk(req.params.id);
    if (!stats) return res.status(404).json({ error: 'Stats not found' });
    await stats.update(req.body);
    res.json(stats);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteParticipantStats = async (req, res) => {
  try {
    const stats = await ParticipantStatistics.findByPk(req.params.id);
    if (!stats) return res.status(404).json({ error: 'Stats not found' });
    await stats.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
