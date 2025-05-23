import { Team } from '../models/Team.js';
import { Participant } from '../models/Participant.js';
import { sequelize } from '../db/db.js';
import { teamSchema } from '../schemas/team.schema.js';
import { z } from 'zod';

// FUNÇÕES AUXILIARES:
const validateTeamComposition = async (teamId) => {
  const teamMembers = await Participant.findAll({
    where: { team_id: teamId }
  });

  const coaches = teamMembers.filter(m => m.is_COACH);
  const players = teamMembers.filter(m => !m.is_COACH);

  if (coaches.length > 1) {
    throw new Error('Uma equipe só pode ter 1 coach');
  }

  if (players.length > 5) {
    throw new Error('Uma equipe só pode ter 5 jogadores');
  }
};

const verifyTeamManager = async (userId, teamId, transaction) => {
  const team = await Team.findByPk(teamId, { transaction });
  
  if (!team) throw new Error('Equipe não encontrada');
  if (team.user_id !== userId) throw new Error('Ação permitida apenas para o gerente do campeonato');
  
  return team;
};

// CONTROLADORES PRINCIPAIS:
export const createTeam = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Validação dos dados de entrada com Zod
    const validatedData = teamSchema.parse({
      ...req.body,
      user_id: req.user.user_id // Adiciona o user_id do token JWT
    });

    const team = await Team.create(validatedData, { transaction });

    await transaction.commit();
    res.status(201).json({
      message: 'Equipe criada com sucesso',
      team: {
        team_id: team.team_id,
        name: team.name,
        ranking: team.ranking,
        user_id: team.user_id
      }
    });
  } catch (error) {
    await transaction.rollback();
    
    // Tratamento específico para erros do Zod
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    res.status(400).json({ message: error.message });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.teamId, {
      include: [{
        model: Participant,
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }],
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    if (!team) {
      return res.status(404).json({ message: 'Equipe não encontrada' });
    }

    try {
      await validateTeamComposition(team.team_id);
    } catch (compositionError) {
      console.warn('Atenção: Composição inválida -', compositionError.message);
    }

    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erro ao buscar equipe',
      error: error.message 
    });
  }
};

export const updateTeam = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { teamId } = req.params;

    const updateSchema = teamSchema.partial();
    const validatedData = updateSchema.parse(req.body);

    const team = await verifyTeamManager(req.user.user_id, teamId, transaction);

    await team.update(validatedData, { transaction });

    await transaction.commit();
    res.status(200).json({
      message: 'Equipe atualizada com sucesso',
      team: {
        team_id: team.team_id,
        name: team.name,
        ranking: team.ranking
      }
    });
  } catch (error) {
    await transaction.rollback();
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Dados de atualização inválidos',
        errors: error.errors
      });
    }
    
    const status = error.message.includes('não encontrada') ? 404 : 403;
    res.status(status).json({ message: error.message });
  }
};

export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.findAll({
      include: [{
        model: Participant,
        attributes: ['participant_id', 'name', 'nickname', 'is_coach']
      }],
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      order: [['ranking', 'DESC']] // Ordena por ranking
    });

    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erro ao listar equipes',
      error: error.message 
    });
  }
};

export const deleteTeam = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { teamId } = req.params;

    await verifyTeamManager(req.user.user_id, teamId, transaction);

    await Team.destroy({ 
      where: { team_id: teamId },
      transaction
    });

    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    const status = error.message.includes('não encontrada') ? 404 : 403;
    res.status(status).json({ message: error.message });
  }
};

export const validateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Equipe não encontrada' });
    }

    await validateTeamComposition(teamId);
    
    res.status(200).json({ 
      message: 'Composição da equipe é válida',
      valid: true
    });
  } catch (error) {
    res.status(400).json({ 
      message: error.message,
      valid: false
    });
  }
};