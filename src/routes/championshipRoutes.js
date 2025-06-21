import express from 'express';
import {
    createChampionship,
    getAllChampionships,
    getChampionshipById,
    updateChampionship,
    deleteChampionship
} from '../controllers/championshipController.js';
import { championshipSchema } from '../schemas/championship.schema.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Championship:
 *       type: object
 *       required:
 *         - name
 *         - start_date
 *         - end_date
 *       properties:
 *         championship_id:
 *           type: integer
 *           description: ID único do campeonato
 *           example: 1
 *         name:
 *           type: string
 *           description: Nome do campeonato
 *           example: "VCT Champions 2024"
 *         description:
 *           type: string
 *           description: Descrição do campeonato
 *           example: "Campeonato mundial de Valorant 2024"
 *         start_date:
 *           type: string
 *           format: date
 *           description: Data de início do campeonato
 *           example: "2024-01-15"
 *         end_date:
 *           type: string
 *           format: date
 *           description: Data de fim do campeonato
 *           example: "2024-02-15"
 *         status:
 *           type: string
 *           enum: [agendado, em andamento, encerrado]
 *           description: Status atual do campeonato
 *           example: "agendado"
 *         prize:
 *           type: number
 *           format: decimal
 *           description: Premiação total em reais
 *           example: 1000000.00
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação do campeonato
 *           example: "2023-12-01T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *           example: "2023-12-01T10:00:00.000Z"
 *     ChampionshipInput:
 *       type: object
 *       required:
 *         - name
 *         - start_date
 *         - end_date
 *       properties:
 *         name:
 *           type: string
 *           description: Nome do campeonato
 *           example: "VCT Champions 2024"
 *         description:
 *           type: string
 *           description: Descrição do campeonato
 *           example: "Campeonato mundial de Valorant 2024"
 *         start_date:
 *           type: string
 *           format: date
 *           description: Data de início do campeonato
 *           example: "2024-01-15"
 *         end_date:
 *           type: string
 *           format: date
 *           description: Data de fim do campeonato
 *           example: "2024-02-15"
 *         status:
 *           type: string
 *           enum: [agendado, em andamento, encerrado]
 *           description: Status atual do campeonato
 *           example: "agendado"
 *         prize:
 *           type: number
 *           format: decimal
 *           description: Premiação total em dólares
 *           example: 1000000.00
 *         format:
 *           type: string
 *           enum: [double, simple]
 *           description: Formato de chaveamento do campeonato
 *           example: "simple"
 *         user_id:
 *           type: integer
 *           description: ID do usuário que criou o campeonato
 *           example: 1
 *         location:
 *           type: string
 *           description: Localização do campeonato
 *           example: "São Paulo, Brasil"
 */

/**
 * @swagger
 * /championships:
 *   get:
 *     summary: Lista todos os campeonatos
 *     tags: [Championships]
 *     responses:
 *       200:
 *         description: Lista de campeonatos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Championship'
 *                 total:
 *                   type: integer
 *                   description: Total de campeonatos
 *                   example: 25
 *                 limit:
 *                   type: integer
 *                   description: Limite usado na consulta
 *                   example: 10
 *                 offset:
 *                   type: integer
 *                   description: Offset usado na consulta
 *                   example: 0
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro interno do servidor"
 *   post:
 *     summary: Criar novo campeonato
 *     tags: [Championships]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChampionshipInput'
 *     responses:
 *       201:
 *         description: Campeonato criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Championship'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Nome do campeonato é obrigatório"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "start_date"
 *                       message:
 *                         type: string
 *                         example: "Data de início é obrigatória"
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token não fornecido"
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /championships/{id}:
 *   get:
 *     summary: Obter campeonato por ID
 *     tags: [Championships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     responses:
 *       200:
 *         description: Campeonato encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Championship'
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
 *         description: Campeonato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Campeonato não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro interno do servidor"
 *                 details:
 *                   type: string
 *                   example: "Database connection failed"
 *   put:
 *     summary: Atualizar campeonato
 *     tags: [Championships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChampionshipInput'
 *     responses:
 *       200:
 *         description: Campeonato atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Championship'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Dados inválidos fornecidos"
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Campeonato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Campeonato não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *   delete:
 *     summary: Deletar campeonato
 *     tags: [Championships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     responses:
 *       204:
 *         description: Campeonato deletado com sucesso
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token não fornecido"
 *       404:
 *         description: Campeonato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Campeonato não encontrado"
 *       409:
 *         description: Conflito - Campeonato não pode ser deletado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Não é possível deletar campeonato com equipes inscritas"
 *       500:
 *         description: Erro interno do servidor
 */

router.get('/', getAllChampionships);
router.get('/:id', getChampionshipById);
router.post('/', authMiddleware, validateSchema(championshipSchema), createChampionship);
router.put('/:id', authMiddleware, validateSchema(championshipSchema), updateChampionship);
router.delete('/:id', authMiddleware, deleteChampionship);

export default router;
