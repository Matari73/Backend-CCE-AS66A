import express from 'express';
import {
    createChampionshipStats,
    getAllChampionshipStats,
    getChampionshipStatsById,
    updateChampionshipStats,
    deleteChampionshipStats
} from '../controllers/championshipStatisticsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { championshipStatisticsSchema } from '../schemas/championshipStatistic.schema.js';

const router = express.Router();

router.get('/', getAllChampionshipStats);
router.get('/:statisticId', getChampionshipStatsById);
router.post('/', authMiddleware, validateSchema(championshipStatisticsSchema), createChampionshipStats);
router.put('/:statisticId', authMiddleware, validateSchema(championshipStatisticsSchema), updateChampionshipStats);
router.delete('/:statisticId', authMiddleware, deleteChampionshipStats);

export default router;