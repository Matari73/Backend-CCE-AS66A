import express from 'express';
import { 
  createParticipant,
  getAllParticipants,
  getParticipantById,
  updateParticipant,
  deleteParticipant
} from '../controllers/participantController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas padrão
router.get('/', getAllParticipants);
router.get('/:participantId', getParticipantById);
router.post('/', authMiddleware, createParticipant);
router.put('/:participantId', authMiddleware, updateParticipant);
router.delete('/:participantId', authMiddleware, deleteParticipant);

export default router;
