import express from 'express';
import {
    createParticipantStats,
    getAllParticipantStats,
    getParticipantStatsById,
    updateParticipantStats,
    deleteParticipantStats
} from '../controllers/participantStatisticsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { participantStatisticsSchema } from '../schemas/participantStatistic.schema.js';

const router = express.Router();

router.get('/', getAllParticipantStats);
router.get('/:statisticId', getParticipantStatsById);
router.post('/', authMiddleware, validateSchema(participantStatisticsSchema), createParticipantStats);
router.put('/:statisticId', authMiddleware, validateSchema(participantStatisticsSchema), updateParticipantStats);
router.delete('/:statisticId', authMiddleware, deleteParticipantStats);

export default router;
