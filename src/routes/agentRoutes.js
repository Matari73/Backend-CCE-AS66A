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

/**
 * @swagger
 * components:
 *   schemas:
 *     Agent:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         agent_id:
 *           type: integer
 *           description: ID único do agente
 *           example: 1
 *         name:
 *           type: string
 *           description: Nome do agente Valorant
 *           example: "Jett"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação do agente
 *           example: "2023-12-01T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *           example: "2023-12-01T10:00:00.000Z"
 *     AgentInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Nome do agente Valorant
 *           example: "Jett"
 */

/**
 * @swagger
 * /agents:
 *   get:
 *     summary: Lista todos os agentes
 *     tags: [Agents]
 *     responses:
 *       200:
 *         description: Lista de agentes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Agent'
 *       500:
 *         description: Erro interno do servidor
 *   post:
 *     summary: Criar novo agente
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgentInput'
 *     responses:
 *       201:
 *         description: Agente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agent'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "O nome do agente é obrigatório"
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /agents/{id}:
 *   get:
 *     summary: Obter agente por ID
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do agente
 *         example: 1
 *     responses:
 *       200:
 *         description: Agente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agent'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID inválido. Deve ser um número."
 *       404:
 *         description: Agente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Agente não encontrado."
 *       500:
 *         description: Erro interno do servidor
 *   put:
 *     summary: Atualizar agente
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do agente
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgentInput'
 *     responses:
 *       200:
 *         description: Agente atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agent'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Agente não encontrado
 *       500:
 *         description: Erro interno do servidor
 *   delete:
 *     summary: Deletar agente
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do agente
 *         example: 1
 *     responses:
 *       204:
 *         description: Agente deletado com sucesso
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID inválido. Deve ser um número."
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Agente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Agente não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro interno no servidor."
 *                 details:
 *                   type: string
 *                   example: "Database connection failed"
 */

router.get('/', getAllAgents);
router.get('/:id', getAgentById);
router.post('/', authMiddleware, validateSchema(agentSchema), createAgent);
router.put('/:id', authMiddleware, validateSchema(agentSchema), updateAgent);
router.delete('/:id', authMiddleware, deleteAgent);

export default router;
