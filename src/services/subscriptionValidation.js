import { Op } from 'sequelize';
import Subscription from '../models/subscription.js';
import Team from '../models/team.js';
import Participant from '../models/participant.js';

export const validateSubscription = async (championship_id, team_id) => {
  try {
    // Verifica inscriçao duplicada do time no campeonato
    const existingSubscription = await Subscription.findOne({
      where: {
        championship_id,
        team_id
      }
    });

    if (existingSubscription) {
      return {
        valid: false,
        status: 409,
        message: 'Time já inscrito',
        details: 'Este time já está inscrito no campeonato'
      };
    }

    const team = await Team.findByPk(team_id, {
      include: [{
        model: Participant,
        attributes: ['participant_id', 'nickname', 'user_id']
      }]
    });

    if (!team) {
      return {
        valid: false,
        status: 404,
        message: 'Time não encontrado'
      };
    }

    const errors = [];

    for (const participant of team.Participants) {
      // Verifica se o nickname já existe em OUTROS times do mesmo campeonato
      const nicknameConflict = await Participant.findOne({
        include: [{
          model: Team,
          include: [{
            model: Subscription,
            where: { 
              championship_id,
              team_id: { [Op.ne]: team_id } // Ignora o time atual
            }
          }]
        }],
        where: { 
          nickname: participant.nickname,
          participant_id: { [Op.ne]: participant.participant_id } // Ignora o próprio participante
        }
      });

      if (nicknameConflict) {
        errors.push({
          type: 'NICKNAME_CONFLICT',
          message: `O nickname "${participant.nickname}" já está em uso por outro jogador no campeonato`,
          participant_id: participant.participant_id
        });
      }

      // Verifica se o usuário já está em OUTRO time do mesmo campeonato (se tiver user_id)
      if (participant.user_id) {
        const userConflict = await Participant.findOne({
          include: [{
            model: Team,
            include: [{
              model: Subscription,
              where: { 
                championship_id,
                team_id: { [Op.ne]: team_id }
              }
            }]
          }],
          where: { 
            user_id: participant.user_id,
            participant_id: { [Op.ne]: participant.participant_id }
          }
        });

        if (userConflict) {
          errors.push({
            type: 'USER_CONFLICT',
            message: `O jogador já está participando do campeonato por outro time`,
            participant_id: participant.participant_id,
            conflicting_team_id: userConflict.Team.team_id
          });
        }
      }
    }

    // Resultados
    if (errors.length > 0) {
      return {
        valid: false,
        status: 422, // Unprocessable Entity
        message: 'Conflitos encontrados na inscrição',
        details: errors
      };
    }

    return {
      valid: true,
      status: 200,
      message: 'Time válido para inscrição'
    };

  } catch (error) {
    console.error('Erro na validação de inscrição:', error);
    return {
      valid: false,
      status: 500,
      message: 'Erro interno durante validação',
      details: error.message
    };
  }
};

// Função auxiliar para validar alterações em inscrições existentes
export const validateSubscriptionUpdate = async (subscriptionId, newChampionshipId, newTeamId) => {
  try {
    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) {
      return {
        valid: false,
        status: 404,
        message: 'Inscrição não encontrada'
      };
    }

    // Verificaçao de mudança relevante
    const championshipChanged = newChampionshipId && newChampionshipId !== subscription.championship_id;
    const teamChanged = newTeamId && newTeamId !== subscription.team_id;

    if (!championshipChanged && !teamChanged) {
      return { valid: true };
    }

    // Valida com os novos dados
    return await validateSubscription(
      championshipChanged ? newChampionshipId : subscription.championship_id,
      teamChanged ? newTeamId : subscription.team_id
    );

  } catch (error) {
    console.error('Erro na validação de atualização:', error);
    return {
      valid: false,
      status: 500,
      message: 'Erro interno durante validação',
      details: error.message
    };
  }
};