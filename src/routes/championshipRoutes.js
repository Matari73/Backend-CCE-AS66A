import express from 'express';
import {
  createChampionship,
  getAllChampionships,
  getChampionshipById,
  updateChampionship,
  deleteChampionship
} from '../controllers/championshipController.js';

const router = express.Router();

router.post('/', createChampionship);
router.get('/', getAllChampionships);
router.get('/:id', getChampionshipById);
router.put('/:id', updateChampionship);
router.delete('/:id', deleteChampionship);

export default router;
