import Participant from '../models/participant.js';
import Team from '../models/team.js';

/**
 * Valida completamente uma equipe (existência e composição)
 * @param {number} teamId - ID da equipe
 * @returns {Promise<{valid: boolean, message: string}>} Resultado da validação
 */
export const validateTeamComposition = async (teamId) => {
  try {
    console.log(`Validando equipe ID: ${teamId}`);

    const team = await Team.findByPk(teamId);
    console.log('Resultado da busca pela equipe:', team);

    if (!team) {
      return {
        valid: false,
        status: 404,
        message: 'Equipe não encontrada'
      };
    }

    const teamMembers = await Participant.findAll({ 
      where: { team_id: teamId }
    });
    console.log('Membros encontrados:', teamMembers);

    const coaches = teamMembers.filter(m => m.is_COACH);
    const players = teamMembers.filter(m => !m.is_COACH);

    if (coaches.length !== 1 || players.length !== 5) {
      return {
        valid: false,
        status: 200, // Equipe existe, mas é inválida
        message: 'Equipe incompleta: 1 coach e 5 jogadores necessários'
      };
    }

    return {
      valid: true,
      status: 200,
      message: 'Equipe válida e completa'
    };

  } catch (error) {
    // Erros inesperados são relançados para tratamento no controller
    console.error('Erro detalhado na validação:', error);
    throw new Error('Falha na validação: ' + error.message);
  }
};