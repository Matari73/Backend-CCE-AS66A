import Participant from '../models/participant.js';

export const createParticipant = async (req, res) => {
  try {
    const newParticipant = await Participant.create(req.body);
    res.status(201).json(newParticipant);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao criar o participante: ' + err.message });
  }
};

export const getAllParticipants = async (req, res) => {
  try {
    const participants = await Participant.findAll();
    res.json(participants);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar participantes: ' + err.message });
  }
};

export const getParticipantById = async (req, res) => {
  try {
    const participant = await Participant.findByPk(req.params.id);
    if (!participant) return res.status(404).json({ error: 'Participante não encontrado' });
    res.json(participant);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar o participante: ' + err.message });
  }
};

export const updateParticipant = async (req, res) => {
  try {
    const [updated] = await Participant.update(req.body, {
      where: { participant_id: req.params.id },
    });

    if (!updated) return res.status(404).json({ error: 'Participante não encontrado' });

    const updatedParticipant = await Participant.findByPk(req.params.id);
    res.json(updatedParticipant);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao atualizar o participante: ' + err.message });
  }
};

export const deleteParticipant = async (req, res) => {
  try {
    const deleted = await Participant.destroy({
      where: { participant_id: req.params.id },
    });

    if (!deleted) return res.status(404).json({ error: 'Participante não encontrado' });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir o participante: ' + err.message });
  }
};
