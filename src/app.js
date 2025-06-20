import express from 'express';
import { sequelize, connectInDatabase } from './db/db.js';
import routes from './routes/index.js';
import seed from './scripts/seed.js';
import './models/associations.js';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

routes(app);

const startApp = async () => {
  try {
    console.log('🚀 Starting application...');

    await connectInDatabase();
    console.log('📦 Database connected');

    await sequelize.sync({ force: true });
    console.log('🔄 Database synchronized');

    console.log('🌱 Running database seed...');
    await seed();
    console.log('✅ Database seed completed');

  } catch (err) {
    console.error('❌ Erro ao iniciar a aplicação:', err);
    console.error('Stack trace:', err.stack);
    process.exit(1);
  }
};

startApp();

export default app;
