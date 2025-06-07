import Participant from '../models/participant.js';
import Team from '../models/team.js';

export const validateTeamComposition = async (teamId) => {
  try {
    const team = await Team.findByPk(teamId);
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

    // Corrigindo o campo para minúsculas (is_coach)
    const coaches = teamMembers.filter(m => m.is_coach);
    const players = teamMembers.filter(m => !m.is_coach);

    if (coaches.length !== 1) {
      return {
        valid: false,
        status: 422, // Mudando para 422 (Unprocessable Entity)
        message: 'A equipe deve ter exatamente 1 técnico'
      };
    }

    if (players.length !== 5) {
      return {
        valid: false,
        status: 422,
        message: 'A equipe deve ter exatamente 5 jogadores'
      };
    }

    return {
      valid: true,
      status: 200,
      message: 'Equipe válida e completa'
    };

  } catch (error) {
    console.error('Erro na validação:', error);
    return {
      valid: false,
      status: 500,
      message: 'Erro interno ao validar equipe'
    };
  }
};