import express from 'express';

import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import championshipRoutes from './championshipRoutes.js';
import teamRoutes from './teamRoutes.js';
import agentRoutes from './agentRoutes.js';
import matchRoutes from './matchRoutes.js';
import subscriptionRoutes from './subscriptionRoutes.js';
import participantRoutes from './participantRoutes.js';
import participantStatisticsRoutes from './participantStatisticsRoutes.js';
import championshipStatisticsRoutes from './championshipStatisticsRoutes.js';

const configureRoutes = (app) => {
    // Middlewares globais
    app.use(express.json());

    // Rota de teste
    app.get('/', (req, res) => {
        res.status(200).send('Certificadora de Competência Específica');
    });

    app.use('/auth', authRoutes);
    app.use('/users', userRoutes);
    app.use('/championships', championshipRoutes);
    app.use('/teams', teamRoutes);
    app.use('/agents', agentRoutes);
    app.use('/matches', matchRoutes);
    app.use('/subscriptions', subscriptionRoutes);
    app.use('/participants', participantRoutes);
    app.use('/participant-stats', participantStatisticsRoutes);
    app.use('/championship-stats', championshipStatisticsRoutes);
};

export default configureRoutes;
