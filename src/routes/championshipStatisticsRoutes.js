import express from 'express';
import {
    createChampionshipStats,
    getAllChampionshipStats,
    getChampionshipStatsById,
    updateChampionshipStats,
    deleteChampionshipStats,
    getChampionshipOverview,
    getTeamStatistics,
    getAllPlayerStatsInChampionship,
    getStatsByPlayerId
} from '../controllers/championshipStatisticsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { championshipStatisticsSchema } from '../schemas/championshipStatistic.schema.js';
import { checkOwnership } from '../middlewares/ownershipMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /championship-statistics/overview/{id}:
 *   get:
 *     summary: Obter visão geral do campeonato
 *     tags: [ChampionshipStatistics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     responses:
 *       200:
 *         description: Visão geral do campeonato encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                   description: Visão geral do campeonato
 *       404:
 *         description: Campeonato não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /championship-statistics/overview/{id}/teams:
 *   get:
 *     summary: Obter estatísticas das equipes do campeonato
 *     tags: [ChampionshipStatistics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     responses:
 *       200:
 *         description: Estatísticas das equipes encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: Campeonato não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /championship-statistics/overview/{id}/players:
 *   get:
 *     summary: Obter estatísticas dos jogadores do campeonato
 *     tags: [ChampionshipStatistics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     responses:
 *       200:
 *         description: Estatísticas dos jogadores encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: Campeonato não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /championship-statistics/player/{playerId}:
 *   get:
 *     summary: Obter estatísticas do jogador por ID
 *     tags: [ChampionshipStatistics]
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do jogador
 *         example: 1
 *     responses:
 *       200:
 *         description: Estatísticas do jogador encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Jogador não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ChampionshipStatistics:
 *       type: object
 *       required:
 *         - championship_id
 *         - participant_id
 *         - team_id
 *         - kills
 *         - assists
 *         - deaths
 *         - spike_plants
 *         - spike_defuses
 *         - MVPs
 *         - first_kills
 *       properties:
 *         championship_id:
 *           type: integer
 *           description: ID do campeonato
 *           example: 1
 *         participant_id:
 *           type: integer
 *           description: ID do participante
 *           example: 1
 *         team_id:
 *           type: integer
 *           description: ID da equipe
 *           example: 1
 *         kills:
 *           type: integer
 *           description: Número de kills
 *           example: 10
 *         assists:
 *           type: integer
 *           description: Número de assists
 *           example: 5
 *         deaths:
 *           type: integer
 *           description: Número de deaths
 *           example: 2
 *         spike_plants:
 *           type: integer
 *           description: Número de spike plants
 *           example: 3
 *         spike_defuses:
 *           type: integer
 *           description: Número de spike defuses
 *           example: 1
 *         MVPs:
 *           type: integer
 *           description: Número de MVPs
 *           example: 4
 *         first_kills:
 *           type: integer
 *           description: Número de first kills
 *           example: 6
 */

/**
 * @swagger
 * /championship-statistics:
 *   post:
 *     summary: Criar novas estatísticas do campeonato
 *     tags: [ChampionshipStatistics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChampionshipStatistics'
 *     responses:
 *       201:
 *         description: Estatísticas criadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChampionshipStatistics'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /championship-statistics:
 *   get:
 *     summary: Lista todas as estatísticas do campeonato
 *     tags: [ChampionshipStatistics]
 *     responses:
 *       200:
 *         description: Lista de estatísticas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChampionshipStatistics'
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /championship-statistics/{statisticId}:
 *   get:
 *     summary: Obter estatísticas do campeonato por ID
 *     tags: [ChampionshipStatistics]
 *     parameters:
 *       - in: path
 *         name: statisticId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID das estatísticas do campeonato
 *         example: 1
 *     responses:
 *       200:
 *         description: Estatísticas encontradas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChampionshipStatistics'
 *       404:
 *         description: Estatísticas não encontradas
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /championship-statistics/{statisticId}:
 *   put:
 *     summary: Atualizar estatísticas do campeonato
 *     tags: [ChampionshipStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: statisticId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID das estatísticas do campeonato
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChampionshipStatistics'
 *     responses:
 *       200:
 *         description: Estatísticas atualizadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChampionshipStatistics'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Estatísticas não encontradas
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /championship-statistics/{statisticId}:
 *   delete:
 *     summary: Deletar estatísticas do campeonato
 *     tags: [ChampionshipStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: statisticId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID das estatísticas do campeonato
 *         example: 1
 *     responses:
 *       204:
 *         description: Estatísticas deletadas com sucesso
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Estatísticas não encontradas
 *       500:
 *         description: Erro interno do servidor
 */

router.get('/overview/:id', getChampionshipOverview);
router.get('/overview/:id/teams', getTeamStatistics);
router.get('/overview/:id/players', getAllPlayerStatsInChampionship);
router.get('/player/:playerId', getStatsByPlayerId);
router.post('/', authMiddleware, validateSchema(championshipStatisticsSchema), createChampionshipStats);
router.get('/', getAllChampionshipStats);
router.get('/:statisticId', getChampionshipStatsById);
router.put('/:statisticId', authMiddleware, checkOwnership('championshipstatistics'), validateSchema(championshipStatisticsSchema), updateChampionshipStats);
router.delete('/:statisticId', authMiddleware, checkOwnership('championshipstatistics'), deleteChampionshipStats);

export default router;