import express from 'express';
import { sequelize, connectInDatabase } from './db/db.js';
import routes from './routes/index.js';
import './models/associations.js';

const app = express();
routes(app);

const startApp = async () => {
  try {
    console.log('🚀 Starting application...');
    await connectInDatabase();
    console.log('📦 Database connected');
    
    // Only sync in development or if explicitly requested
    if (process.env.NODE_ENV === 'development' || process.env.FORCE_DB_SYNC === 'true') {
      await sequelize.sync({ force: true });
      console.log('🔄 Database synchronized');
    }
  } catch (err) {
    console.error('❌ Erro ao iniciar a aplicação:', err);
    console.error('Stack trace:', err.stack);
    
    // Don't exit process during testing
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    } else {
      throw err; // Re-throw for test frameworks to handle
    }
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
  });
});

export default app;

// Only start the app if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startApp();
}

