import express from 'express';
import {
    createChampionship,
    getAllChampionships,
    getChampionshipById,
    updateChampionship,
    deleteChampionship,
    generateBracket,
    generateNextPhase,
    getChampionshipMatches,
    bulkUpdateMatches
} from '../controllers/championshipController.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { championshipSchema } from '../schemas/championship.schema.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const app = express();

app.use(express.json());

app.post('/championships', authMiddleware, validateSchema(championshipSchema), createChampionship);
app.get('/championships', getAllChampionships);
app.get('/championships/:id', getChampionshipById);
app.put('/championships/:id', authMiddleware, validateSchema(championshipSchema), updateChampionship);
app.delete('/championships/:id', authMiddleware, deleteChampionship);
app.post('/championships/:id/generate-bracket', authMiddleware, generateBracket);
app.post('/championships/:id/generate-next-phase', authMiddleware, generateNextPhase);
app.get('/championships/:id/matches', getChampionshipMatches);
app.put('/championships/:id/matches/bulk-update', authMiddleware, bulkUpdateMatches);

export default app;
