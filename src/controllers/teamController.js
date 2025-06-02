import Team from '../models/team.js';
import Participant from '../models/participant.js';
import { sequelize } from '../db/db.js';
import { validateTeamComposition } from '../services/teamValidation.js';

// FUNÇÃO AUXILIAR:
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
    const team = await Team.create({
      name: req.body.name,
      user_id: req.user.user_id
    }, { transaction });

    await transaction.commit();
    res.status(201).json({
      message: 'Equipe criada com sucesso',
      team: {
        team_id: team.team_id,
        name: team.name,
        user_id: team.user_id
      }
    });
  } catch (error) {
    await transaction.rollback();
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
    const team = await verifyTeamManager(req.user.user_id, teamId, transaction);

    await team.update({
      name: req.body.name
    }, { transaction });

    await transaction.commit();
    res.status(200).json({
      message: 'Equipe atualizada com sucesso',
      team: {
        team_id: team.team_id,
        name: team.name
      }
    });
  } catch (error) {
    await transaction.rollback();
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
      attributes: { exclude: ['createdAt', 'updatedAt'] }
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
    const validation = await validateTeamComposition(req.params.teamId);
    res.status(validation.status).json({
      valid: validation.valid,
      message: validation.message
    });
    
  } catch (error) {
    res.status(500).json({
      valid: false,
      message: 'Erro interno ao validar equipe'
    });
  }
};