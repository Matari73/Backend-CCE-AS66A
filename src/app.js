import express from 'express';
import { sequelize, connectInDatabase } from './db/db.js';
import routes from './routes/index.js';
import enhancedSeed from './scripts/enhanced_seed.js';
import './models/associations.js';
import cors from 'cors';

const app = express();

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      // Add your production domains here
    ];

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Handle preflight requests
app.options('*', cors());

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
