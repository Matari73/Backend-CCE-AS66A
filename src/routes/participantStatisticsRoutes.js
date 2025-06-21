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
import { checkOwnership } from '../middlewares/ownershipMiddleware.js';

const router = express.Router();

router.get('/', getAllParticipantStats);
router.get('/:statisticId', getParticipantStatsById);
router.post('/', authMiddleware, validateSchema(participantStatisticsSchema), createParticipantStats);
router.put('/:statisticId', authMiddleware, checkOwnership('participantstatistics'), validateSchema(participantStatisticsSchema), updateParticipantStats);
router.delete('/:statisticId', authMiddleware, checkOwnership('participantstatistics'), deleteParticipantStats);
router.get('/player/:playerId', getStatsByPlayer);
router.get('/match/:matchId', getStatsByMatch);
router.get('/top-players/:championshipId', getTopPlayers);
router.get('/team/:teamId/stats', getStatsByTeam);

export default router;
