import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.send('Certificadora Específica - Back-end');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});