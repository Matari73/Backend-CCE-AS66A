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
} from '../controllers/participantStatisticsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { participantStatisticsSchema } from '../schemas/participantStatistic.schema.js';

const router = express.Router();

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
 *     summary: Retrieve all participant statistics
 *     tags: [ParticipantStatistics]
 *     responses:
 *       200:
 *         description: A list of participant statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ParticipantStatistic'
 */
router.get('/', getAllParticipantStats);

/**
 * @swagger
 * /participant-statistics/{statisticId}:
 *   get:
 *     summary: Retrieve participant statistics by ID
 *     tags: [ParticipantStatistics]
 *     parameters:
 *       - name: statisticId
 *         in: path
 *         required: true
 *         description: The ID of the participant statistic
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Participant statistic details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParticipantStatistic'
 *       404:
 *         description: Statistic not found
 */
router.get('/:statisticId', getParticipantStatsById);

/**
 * @swagger
 * /participant-statistics:
 *   post:
 *     summary: Create participant statistics
 *     tags: [ParticipantStatistics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParticipantStatisticInput'
 *     responses:
 *       201:
 *         description: Participant statistic created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', authMiddleware, validateSchema(participantStatisticsSchema), createParticipantStats);

/**
 * @swagger
 * /participant-statistics/{statisticId}:
 *   put:
 *     summary: Update participant statistics
 *     tags: [ParticipantStatistics]
 *     parameters:
 *       - name: statisticId
 *         in: path
 *         required: true
 *         description: The ID of the participant statistic
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParticipantStatisticInput'
 *     responses:
 *       200:
 *         description: Participant statistic updated successfully
 *       404:
 *         description: Statistic not found
 */
router.put('/:statisticId', authMiddleware, validateSchema(participantStatisticsSchema), updateParticipantStats);

/**
 * @swagger
 * /participant-statistics/{statisticId}:
 *   delete:
 *     summary: Delete participant statistics
 *     tags: [ParticipantStatistics]
 *     parameters:
 *       - name: statisticId
 *         in: path
 *         required: true
 *         description: The ID of the participant statistic
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Participant statistic deleted successfully
 *       404:
 *         description: Statistic not found
 */
router.delete('/:statisticId', authMiddleware, deleteParticipantStats);

/**
 * @swagger
 * /participant-statistics/player/{playerId}:
 *   get:
 *     summary: Retrieve statistics by player ID
 *     tags: [ParticipantStatistics]
 *     parameters:
 *       - name: playerId
 *         in: path
 *         required: true
 *         description: The ID of the player
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Player statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ParticipantStatistic'
 */
router.get('/player/:playerId', getStatsByPlayer);

/**
 * @swagger
 * /participant-statistics/match/{matchId}:
 *   get:
 *     summary: Retrieve statistics by match ID
 *     tags: [ParticipantStatistics]
 *     parameters:
 *       - name: matchId
 *         in: path
 *         required: true
 *         description: The ID of the match
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Match statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ParticipantStatistic'
 */
router.get('/match/:matchId', getStatsByMatch);

/**
 * @swagger
 * /participant-statistics/top-players/{championshipId}:
 *   get:
 *     summary: Retrieve top players by championship ID
 *     tags: [ParticipantStatistics]
 *     parameters:
 *       - name: championshipId
 *         in: path
 *         required: true
 *         description: The ID of the championship
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Top players statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ParticipantStatistic'
 */
router.get('/top-players/:championshipId', getTopPlayers);

/**
 * @swagger
 * /participant-statistics/team/{teamId}/stats:
 *   get:
 *     summary: Retrieve statistics by team ID
 *     tags: [ParticipantStatistics]
 *     parameters:
 *       - name: teamId
 *         in: path
 *         required: true
 *         description: The ID of the team
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ParticipantStatistic'
 */
router.get('/team/:teamId/stats', getStatsByTeam);

export default router;
