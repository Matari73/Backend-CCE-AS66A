import express from 'express';
import authRoutes from './authRoutes.js';

const configureRoutes = (app) => {
    // Middlewares globais
    app.use(express.json());

    // Rota de teste
    app.get('/', (req, res) => {
        res.status(200).send('Certificadora de Competência Específica');
    });

    app.use('/auth', authRoutes); 

};

export default configureRoutes;