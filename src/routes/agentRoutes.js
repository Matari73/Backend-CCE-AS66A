import express from 'express';
import {
    createAgent,
    getAllAgents,
    getAgentById,
    updateAgent,
    deleteAgent
} from '../controllers/agentController.js';
import { agentSchema } from '../schemas/agent.schema.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllAgents);
router.get('/:agentId', getAgentById);
router.post('/', authMiddleware, validateSchema(agentSchema), createAgent);
router.put('/:agentId', authMiddleware, validateSchema(agentSchema), updateAgent);
router.delete('/:agentId', authMiddleware, deleteAgent);

export default router;
