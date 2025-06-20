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

const router = express.Router();



router.get('/overview/:id', getChampionshipOverview);
router.get('/overview/:id/teams', getTeamStatistics);
router.get('/overview/:id/players', getAllPlayerStatsInChampionship);
router.get('/player/:playerId', getStatsByPlayerId);

router.post('/', authMiddleware, validateSchema(championshipStatisticsSchema), createChampionshipStats);
router.get('/', getAllChampionshipStats);
router.get('/:statisticId', getChampionshipStatsById);


router.put('/:statisticId', authMiddleware, validateSchema(championshipStatisticsSchema), updateChampionshipStats);
router.delete('/:statisticId', authMiddleware, deleteChampionshipStats);


export default router;