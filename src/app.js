import express from 'express';
import { sequelize, connectInDatabase } from './db/db.js';
import routes from './routes/index.js';
//import seed from './scripts/seed.js';
import './models/associations.js';

const app = express();
routes(app);

const startApp = async () => {
  try {
    await connectInDatabase();
    //await sequelize.sync({ force: true }); // Sincronização das tabelas
    await sequelize.sync(); // Sincroniza sem apagar dados existentes

    console.log('Banco de dados sincronizado. Rodando seed...');
    //await seed(); // só roda o seed depois que as tabelas foram criadas

    console.log('Seed finalizado. Aplicação pronta.');
  } catch (err) {
    console.error('Erro ao iniciar a aplicação:', err);
  }
};

startApp();

export default app;
