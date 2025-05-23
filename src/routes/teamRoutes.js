import express from 'express';
import { 
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  validateTeam
} from '../controllers/teamController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllTeams);
router.get('/:teamId', getTeamById);
router.post('/', authMiddleware, createTeam);
router.put('/:teamId', authMiddleware, updateTeam);
router.delete('/:teamId', authMiddleware, deleteTeam);
router.get('/:teamId/validate', validateTeam)

export default router;