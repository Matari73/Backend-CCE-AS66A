import Participant from '../models/participant.js';
import { participantSchema } from '../schemas/participantSchema.js';

export const createParticipant = async (req, res) => {
  try {
    const validatedData = participantSchema.parse(req.body);
    const newParticipant = await Participant.create(validatedData);
    res.status(201).json(newParticipant);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: err.errors });
    }
    res.status(500).json({ error: 'Erro ao criar o participante: ' + err.message });
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
    const participant = await Participant.findOne({ where: { participant_id: req.params.participantId } });
    if (!participant) return res.status(404).json({ error: 'Participante não encontrado' });
    res.json(participant);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar o participante: ' + err.message });
  }
};

export const updateParticipant = async (req, res) => {
  try {
    const validatedData = participantSchema.parse(req.body);

    const [updated] = await Participant.update(validatedData, {
      where: { participant_id: req.params.participantId },
    });

    if (!updated) return res.status(404).json({ error: 'Participante não encontrado' });

    const updatedParticipant = await Participant.findOne({ where: { participant_id: req.params.participantId } });
    res.json(updatedParticipant);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: err.errors });
    }
    res.status(500).json({ error: 'Erro ao atualizar o participante: ' + err.message });
  }
};

export const deleteParticipant = async (req, res) => {
  try {
    const deleted = await Participant.destroy({
      where: { participant_id: req.params.participantId },
    });

    if (!deleted) return res.status(404).json({ error: 'Participante não encontrado' });

    res.status(200).json({ message: 'Participante excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir o participante: ' + err.message });
  }
};
