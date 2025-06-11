import express from 'express';
import { sequelize, connectInDatabase } from './db/db.js';
import routes from './routes/index.js';
//import seed from './scripts/seed.js';
import './models/associations.js';

const app = express();
routes(app);

const startApp = async () => {
  try {
    console.log('🚀 Starting application...');

    await connectInDatabase();
    console.log('📦 Database connected');

    await sequelize.sync({ force: true }); // Sincronização das tabelas
    console.log('🔄 Database synchronized');

  } catch (err) {
    console.error('❌ Erro ao iniciar a aplicação:', err);
    console.error('Stack trace:', err.stack);
    process.exit(1); // Exit process on critical error
  }
};

startApp();

export default app;
