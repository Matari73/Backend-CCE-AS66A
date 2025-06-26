import express from 'express';
import { sequelize, connectInDatabase } from './db/db.js';
import routes from './routes/index.js';
import enhancedSeed from './scripts/enhanced_seed.js';
import './models/associations.js';
import cors from 'cors';

const app = express();

// CORS configuration - Allow all origins
const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: false // Set to false when using origin: '*'
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

routes(app);

const startApp = async () => {
  try {
    console.log('🚀 Starting application...');

    await connectInDatabase();
    console.log('📦 Database connected');

    await sequelize.sync({ force: true });
    console.log('🔄 Database synchronized');

    console.log('🌱 Running enhanced database seed...');
    await enhancedSeed();
    console.log('✅ Enhanced database seed completed');

  } catch (err) {
    console.error('❌ Erro ao iniciar a aplicação:', err);
    console.error('Stack trace:', err.stack);
    process.exit(1);
  }
};

startApp();

export default app;
