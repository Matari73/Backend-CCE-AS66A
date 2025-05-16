import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import championshipRoutes from './championshipRoutes.js';

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

};

export default configureRoutes;