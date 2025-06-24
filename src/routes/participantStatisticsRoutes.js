import express from 'express';
import {
    createParticipantStats,
    getAllParticipantStats,
    getParticipantStatsById,
    updateParticipantStats,
    deleteParticipantStats,
    getStatsByPlayer,
    getStatsByMatch,
    getTopPlayers,
    getStatsByTeam,
    getAllPlayersStats,
    getAllTeamsStats,
    getPlayerAgentStats,
    getPlayerMapStats,
    getTeamAgentStats,
    getTeamMapStats,
    getTeamChampionshipHistory
} from '../controllers/participantStatisticsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { participantStatisticsSchema } from '../schemas/participantStatistic.schema.js';
import { checkOwnership } from '../middlewares/ownershipMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ParticipantStatistic:
 *       type: object
 *       required:
 *         - participant_id
 *         - match_id
 *         - agent_id
 *         - kills
 *         - assists
 *         - deaths
 *       properties:
 *         statistic_id:
 *           type: integer
 *           description: ID único da estatística
 *           example: 1
 *         participant_id:
 *           type: integer
 *           description: ID do participante
 *           example: 1
 *         match_id:
 *           type: integer
 *           description: ID da partida
 *           example: 1
 *         agent_id:
 *           type: integer
 *           description: ID do agente usado
 *           example: 1
 *         kills:
 *           type: integer
 *           description: Número de kills
 *           example: 15
 *         assists:
 *           type: integer
 *           description: Número de assists
 *           example: 8
 *         deaths:
 *           type: integer
 *           description: Número de deaths
 *           example: 12
 *         spike_plants:
 *           type: integer
 *           description: Número de spike plants
 *           example: 3
 *         spike_defuses:
 *           type: integer
 *           description: Número de spike defuses
 *           example: 2
 *         MVPs:
 *           type: integer
 *           description: Número de MVPs
 *           example: 5
 *         first_kills:
 *           type: integer
 *           description: Número de first kills
 *           example: 4
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *           example: "2023-12-01T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *           example: "2023-12-01T10:00:00.000Z"
 *     ParticipantStatisticInput:
 *       type: object
 *       required:
 *         - participant_id
 *         - match_id
 *         - agent_id
 *         - kills
 *         - assists
 *         - deaths
 *       properties:
 *         participant_id:
 *           type: integer
 *           description: ID do participante
 *           example: 1
 *         match_id:
 *           type: integer
 *           description: ID da partida
 *           example: 1
 *         agent_id:
 *           type: integer
 *           description: ID do agente usado
 *           example: 1
 *         kills:
 *           type: integer
 *           description: Número de kills
 *           example: 15
 *         assists:
 *           type: integer
 *           description: Número de assists
 *           example: 8
 *         deaths:
 *           type: integer
 *           description: Número de deaths
 *           example: 12
 *         spike_plants:
 *           type: integer
 *           description: Número de spike plants
 *           example: 3
 *         spike_defuses:
 *           type: integer
 *           description: Número de spike defuses
 *           example: 2
 *         MVPs:
 *           type: integer
 *           description: Número de MVPs
 *           example: 5
 *         first_kills:
 *           type: integer
 *           description: Número de first kills
 *           example: 4
 */

/**
 * @swagger
 * tags:
 *   name: ParticipantStatistics
 *   description: Endpoints for managing participant statistics
 */

/**
 * @swagger
 * /participant-statistics:
 *   get:
 *     summary: Lista todas as estatísticas dos participantes
 *     tags: [ParticipantStatistics]
 *     responses:
 *       200:
 *         description: Lista de estatísticas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ParticipantStatistic'
 *       500:
 *         description: Erro interno do servidor
 *   post:
 *     summary: Criar nova estatística de participante
 *     tags: [ParticipantStatistics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParticipantStatisticInput'
 *     responses:
 *       201:
 *         description: Estatística criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParticipantStatistic'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /participant-statistics/{statisticId}:
 *   get:
 *     summary: Obter estatística do participante por ID
 *     tags: [ParticipantStatistics]
 *     parameters:
 *       - name: statisticId
 *         in: path
 *         required: true
 *         description: ID da estatística do participante
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Estatística encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParticipantStatistic'
 *       404:
 *         description: Estatística não encontrada
 *       500:
 *         description: Erro interno do servidor
 *   put:
 *     summary: Atualizar estatística do participante
 *     tags: [ParticipantStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: statisticId
 *         in: path
 *         required: true
 *         description: ID da estatística do participante
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParticipantStatisticInput'
 *     responses:
 *       200:
 *         description: Estatística atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParticipantStatistic'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Estatística não encontrada
 *       500:
 *         description: Erro interno do servidor
 *   delete:
 *     summary: Deletar estatística do participante
 *     tags: [ParticipantStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: statisticId
 *         in: path
 *         required: true
 *         description: ID da estatística do participante
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       204:
 *         description: Estatística deletada com sucesso
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Estatística não encontrada
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /participant-statistics/player/{playerId}:
 *   get:
 *     summary: Obter estatísticas por ID do jogador
 *     tags: [ParticipantStatistics]
 *     parameters:
 *       - name: playerId
 *         in: path
 *         required: true
 *         description: ID do jogador
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Estatísticas do jogador
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ParticipantStatistic'
 *       404:
 *         description: Jogador não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /participant-statistics/match/{matchId}:
 *   get:
 *     summary: Obter estatísticas por ID da partida
 *     tags: [ParticipantStatistics]
 *     parameters:
 *       - name: matchId
 *         in: path
 *         required: true
 *         description: ID da partida
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Estatísticas da partida
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ParticipantStatistic'
 *       404:
 *         description: Partida não encontrada
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /participant-statistics/top-players/{championshipId}:
 *   get:
 *     summary: Obter top jogadores por ID do campeonato
 *     tags: [ParticipantStatistics]
 *     parameters:
 *       - name: championshipId
 *         in: path
 *         required: true
 *         description: ID do campeonato
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Estatísticas dos melhores jogadores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ParticipantStatistic'
 *       404:
 *         description: Campeonato não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /participant-statistics/team/{teamId}/stats:
 *   get:
 *     summary: Obter estatísticas por ID da equipe
 *     tags: [ParticipantStatistics]
 *     parameters:
 *       - name: teamId
 *         in: path
 *         required: true
 *         description: ID da equipe
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Estatísticas da equipe
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ParticipantStatistic'
 *       404:
 *         description: Equipe não encontrada
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /participant-statistics/all-players:
 *   get:
 *     summary: Obter estatísticas resumidas de todos os jogadores
 *     tags: [ParticipantStatistics]
 *     responses:
 *       200:
 *         description: Lista de estatísticas de todos os jogadores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   participant_id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "João Silva"
 *                   nickname:
 *                     type: string
 *                     example: "joaoplayer"
 *                   team_id:
 *                     type: integer
 *                     example: 2
 *                   team_name:
 *                     type: string
 *                     example: "Team Alpha"
 *                   total_kills:
 *                     type: integer
 *                     example: 120
 *                   total_deaths:
 *                     type: integer
 *                     example: 80
 *                   total_assists:
 *                     type: integer
 *                     example: 95
 *                   total_matches:
 *                     type: integer
 *                     example: 15
 *                   mvp_count:
 *                     type: integer
 *                     example: 3
 *                   kda_ratio:
 *                     type: number
 *                     format: float
 *                     example: 2.7
 *       500:
 *         description: Erro interno do servidor
 *
 * /participant-statistics/all-teams:
 *   get:
 *     summary: Obter estatísticas resumidas de todas as equipes
 *     tags: [ParticipantStatistics]
 *     responses:
 *       200:
 *         description: Lista de estatísticas de todas as equipes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   team_id:
 *                     type: integer
 *                     example: 1
 *                   team_name:
 *                     type: string
 *                     example: "Team Alpha"
 *                   total_kills:
 *                     type: integer
 *                     example: 450
 *                   total_deaths:
 *                     type: integer
 *                     example: 380
 *                   total_assists:
 *                     type: integer
 *                     example: 320
 *                   total_matches:
 *                     type: integer
 *                     example: 25
 *                   wins:
 *                     type: integer
 *                     example: 15
 *                   losses:
 *                     type: integer
 *                     example: 10
 *                   win_rate:
 *                     type: number
 *                     format: float
 *                     example: 60.0
 *                   mvp_count:
 *                     type: integer
 *                     example: 12
 *                   avg_match_score:
 *                     type: number
 *                     format: float
 *                     example: 254.8
 *       500:
 *         description: Erro interno do servidor
 *
 * /participant-statistics/player/{playerId}/agents:
 *   get:
 *     summary: Obter estatísticas de agentes usados por um jogador específico
 *     tags: [ParticipantStatistics]
 *     parameters:
 *       - name: playerId
 *         in: path
 *         required: true
 *         description: ID do jogador
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estatísticas de agentes do jogador
 *       500:
 *         description: Erro interno do servidor
 *
 * /participant-statistics/player/{playerId}/maps:
 *   get:
 *     summary: Obter estatísticas de desempenho por mapa para um jogador específico
 *     tags: [ParticipantStatistics]
 *     parameters:
 *       - name: playerId
 *         in: path
 *         required: true
 *         description: ID do jogador
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estatísticas de mapas do jogador
 *       500:
 *         description: Erro interno do servidor
 *
 * /participant-statistics/team/{teamId}/agents:
 *   get:
 *     summary: Obter estatísticas de agentes usados por uma equipe específica
 *     tags: [ParticipantStatistics]
 *     parameters:
 *       - name: teamId
 *         in: path
 *         required: true
 *         description: ID da equipe
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estatísticas de agentes da equipe
 *       500:
 *         description: Erro interno do servidor
 *
 * /participant-statistics/team/{teamId}/maps:
 *   get:
 *     summary: Obter estatísticas de desempenho por mapa para uma equipe específica
 *     tags: [ParticipantStatistics]
 *     parameters:
 *       - name: teamId
 *         in: path
 *         required: true
 *         description: ID da equipe
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estatísticas de mapas da equipe
 *       500:
 *         description: Erro interno do servidor
 *
 * /participant-statistics/team/{teamId}/championships:
 *   get:
 *     summary: Obter histórico de participação em campeonatos de uma equipe
 *     tags: [ParticipantStatistics]
 *     parameters:
 *       - name: teamId
 *         in: path
 *         required: true
 *         description: ID da equipe
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Histórico de participação em campeonatos
 *       500:
 *         description: Erro interno do servidor
 */

router.get('/', getAllParticipantStats);
router.get('/:statisticId', getParticipantStatsById);
router.post('/', authMiddleware, validateSchema(participantStatisticsSchema), createParticipantStats);
router.put('/:statisticId', authMiddleware, checkOwnership('participantstatistics'), validateSchema(participantStatisticsSchema), updateParticipantStats);
router.delete('/:statisticId', authMiddleware, checkOwnership('participantstatistics'), deleteParticipantStats);
router.get('/player/:playerId', getStatsByPlayer);
router.get('/match/:matchId', getStatsByMatch);
router.get('/top-players/:championshipId', getTopPlayers);
router.get('/team/:teamId/stats', getStatsByTeam);
router.get('/all-players', getAllPlayersStats);
router.get('/all-teams', getAllTeamsStats);
router.get('/player/:playerId/agents', getPlayerAgentStats);
router.get('/player/:playerId/maps', getPlayerMapStats);
router.get('/team/:teamId/agents', getTeamAgentStats);
router.get('/team/:teamId/maps', getTeamMapStats);
router.get('/team/:teamId/championships', getTeamChampionshipHistory);

export default router;
