import express from 'express';
import { conectaNaDatabase } from './db/db.js';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).send('Certificadora de Competência Específica');
});

const startApp = async () => {
    await conectaNaDatabase();
};

startApp();

export default app;
