import Championship from '../models/championship.js';
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