import express from 'express';
import { sequelize, connectInDatabase } from './db/db.js';
import routes from './routes/index.js';

const app = express();
routes(app);

const startApp = async () => {
    await connectInDatabase();
    await sequelize.sync({ force: true }); // recria todas as tabelas
  console.log('Banco de dados sincronizado');
};

startApp();

export default app;
