import {
  Championship,
  Team,
  Participant,
  User,
  Match,
  ParticipantStatistics,
  ChampionshipStatistics
} from '../models/associations.js';

export const checkOwnership = (entityType) => async (req, res, next) => {
  try {
    if (!req.user?.user_id) {
      return res.status(401).json({ 
        error: 'Acesso não autorizado',
        details: 'Token inválido ou usuário não autenticado'
      });
    }

    const entityId = req.params[`${entityType}Id`] || req.params.id;
    const userId = req.user.user_id;

    if (!entityId) {
      return res.status(400).json({ error: 'ID da entidade não fornecido' });
    }

    let entity, ownerId;

    switch(entityType.toLowerCase()) {
      case 'championship':
        entity = await Championship.findByPk(entityId);
        ownerId = entity?.user_id;
        break;

      case 'team':
        entity = await Team.findByPk(entityId);
        ownerId = entity?.user_id;
        break;

      case 'participant':
        entity = await Participant.findByPk(entityId, {
          include: [{
            model: User,
            attributes: ['user_id'],
            required: true
          }]
        });
        ownerId = entity?.User?.user_id;
        break;

      case 'match':
        entity = await Match.findByPk(entityId, {
          include: [{
            model: Championship,
            attributes: ['user_id'],
            required: true
          }]
        });
        ownerId = entity?.Championship?.user_id;
        break;

      case 'participantstatistics':
        entity = await ParticipantStatistics.findByPk(entityId, {
          include: [{
            model: Participant,
            include: [{
              model: Team,
              attributes: ['user_id'],
              required: true
            }]
          }]
        });
        ownerId = entity?.Participant?.Team?.user_id;
        break;

      case 'championshipstatistics':
        entity = await ChampionshipStatistics.findByPk(entityId, {
          include: [{
            model: Championship,
            attributes: ['user_id'],
            required: true
          }, {
            model: Team,
            attributes: ['user_id'],
            required: false
          }]
        });
        ownerId = entity?.Championship?.user_id || entity?.Team?.user_id;
        break;

      default:
        return res.status(400).json({ error: 'Tipo de entidade não suportado' });
    }

    if (!entity) {
      return res.status(404).json({ 
        error: 'Recurso não encontrado',
        details: `${entityType} com ID ${entityId} não existe`
      });
    }

    if (ownerId?.toString() !== userId.toString()) {
      return res.status(403).json({ 
        error: 'Acesso não autorizado',
        details: `O usuário ${userId} não tem permissão para acessar este recurso`
      });
    }

    // Injeta a entidade no request para uso nos controllers
    req[entityType] = entity;
    next();

  } catch (error) {
    console.error(`Erro no middleware de autorização:`, error);
    res.status(500).json({ 
      error: 'Erro interno no servidor',
      details: error.message,
      stack: error.stack 
    });
  }
};