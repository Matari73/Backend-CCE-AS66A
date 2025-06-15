import express from 'express';
import {
  getAllMatches,
  getMatchById,
  bulkUpdateMatches
} from '../controllers/matchController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllMatches);
router.get('/:id', getMatchById);
router.put('/bulk-update', authMiddleware, bulkUpdateMatches);

export default router;
