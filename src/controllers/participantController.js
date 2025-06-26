import Participant from '../models/participant.js';
import { participantSchema } from '../schemas/participant.schema.js';
import { Op } from 'sequelize';

export const createParticipant = async (req, res) => {
  try {
    const validatedData = participantSchema.parse(req.body);
    
    // Verificar nickname único no time (se tiver team_id)
    if (validatedData.team_id) {
      const existingNickname = await Participant.findOne({
        where: {
          team_id: validatedData.team_id,
          nickname: validatedData.nickname,
          participant_id: { [Op.not]: null } 
        }
      });

      if (existingNickname) {
        return res.status(422).json({
          error: 'Nickname duplicado',
          details: 'Já existe um participante com este nickname no time'
        });
      }
    }

    const newParticipant = await Participant.create(validatedData);
    res.status(201).json(newParticipant);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: err.errors 
      });
    }
    res.status(500).json({ 
      error: 'Erro ao criar participante: ' + err.message 
    });
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

export const getParticipantsByUser = async (req, res) => {
  try {
    // Obtém o user_id do token através do middleware authMiddleware
    const userId = req.user.user_id;
    
    const participants = await Participant.findAll({
      where: { user_id: userId }
    });

    res.json(participants);
  } catch (err) {
    res.status(500).json({ 
      error: 'Erro ao buscar participantes do usuário: ' + err.message 
    });
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
  if (!req.participant) {
    return res.status(404).json({ error: 'Participante não carregado pelo middleware' });
  }
  try {
    const participantId = req.params.participantId;
    const validatedData = participantSchema.parse(req.body);

    // Verificar nickname único no time
    if (validatedData.team_id) {
      const existingNickname = await Participant.findOne({
        where: {
          team_id: validatedData.team_id,
          nickname: validatedData.nickname,
          participant_id: { [Op.ne]: participantId } // Ignora o próprio participante
        }
      });

      if (existingNickname) {
        return res.status(422).json({
          error: 'Nickname duplicado',
          details: 'Já existe um participante com este nickname no time'
        });
      }
    }

    const [updated] = await Participant.update(validatedData, {
      where: { participant_id: participantId }
    });

    if (!updated) {
      return res.status(404).json({ error: 'Participante não encontrado' });
    }

    const updatedParticipant = await Participant.findByPk(participantId);
    res.json(updatedParticipant);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: err.errors 
      });
    }
    res.status(500).json({ 
      error: 'Erro ao atualizar participante: ' + err.message 
    });
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