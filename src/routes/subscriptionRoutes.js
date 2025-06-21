import express from 'express';
import {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription,
    getSubscriptionBySwitchingCode,
    updateSubscriptionScore
} from '../controllers/subscriptionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { subscriptionSchema } from '../schemas/subscription.schema.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Subscription:
 *       type: object
 *       required:
 *         - championship_id
 *         - team_id
 *       properties:
 *         subscription_id:
 *           type: integer
 *           description: ID único da inscrição
 *           example: 1
 *         championship_id:
 *           type: integer
 *           description: ID do campeonato
 *           example: 1
 *         team_id:
 *           type: integer
 *           description: ID da equipe
 *           example: 1
 *         subscription_date:
 *           type: string
 *           format: date-time
 *           description: Data da inscrição
 *           example: "2023-12-01T10:00:00.000Z"
 */

/**
 * @swagger
 * /subscriptions:
 *   get:
 *     summary: Lista todas as inscrições
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: Lista de inscrições retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 *       500:
 *         description: Erro interno do servidor
 *   post:
 *     summary: Criar nova inscrição
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subscription'
 *     responses:
 *       201:
 *         description: Inscrição criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /subscriptions/{subscriptionId}:
 *   get:
 *     summary: Obter inscrição por ID
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da inscrição
 *         example: 1
 *     responses:
 *       200:
 *         description: Inscrição encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       404:
 *         description: Inscrição não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Inscrição não encontrada"
 *                 details:
 *                   type: string
 *                   example: "ID 1 não existe"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Falha ao buscar inscrição"
 *                 details:
 *                   type: string
 *                   example: "Database connection failed"
 *   put:
 *     summary: Atualizar inscrição
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da inscrição
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               championship_id:
 *                 type: integer
 *                 description: ID do campeonato
 *                 example: 2
 *               team_id:
 *                 type: integer
 *                 description: ID da equipe
 *                 example: 3
 *               subscription_date:
 *                 type: string
 *                 format: date-time
 *                 description: Data da inscrição
 *                 example: "2023-12-15T10:00:00.000Z"
 *     responses:
 *       200:
 *         description: Inscrição atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Inscrição atualizada com sucesso"
 *                 subscription:
 *                   $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Dados inválidos ou time inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Novo time inválido"
 *                 details:
 *                   type: string
 *                   example: "Time não possui jogadores suficientes"
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Inscrição não encontrada
 *       500:
 *         description: Erro interno do servidor
 *   delete:
 *     summary: Deletar inscrição
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da inscrição
 *         example: 1
 *     responses:
 *       204:
 *         description: Inscrição deletada com sucesso
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Inscrição não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Inscrição não encontrada"
 *                 details:
 *                   type: string
 *                   example: "ID 1 não existe"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Falha ao remover inscrição"
 */

router.get('/', getAllSubscriptions);
router.get('/:subscriptionId', getSubscriptionById);
router.post('/', authMiddleware, validateSchema(subscriptionSchema), createSubscription);
router.put('/:subscriptionId', authMiddleware, validateSchema(subscriptionSchema), updateSubscription);
router.delete('/:subscriptionId', authMiddleware, deleteSubscription);

export default router;
