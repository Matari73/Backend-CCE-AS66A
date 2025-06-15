import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
const isDevelopment = process.env.NODE_ENV === 'development';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'backend_cce',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: !isTest ? console.log : false,
    pool: {
      max: isTest ? 1 : 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

// Função para sincronizar banco apenas quando necessário
export const syncDatabase = async (force = false) => {
  try {
    if (isTest) {
      // Em testes, não sincronizar o banco real
      console.log('Test environment - skipping database sync');
      return;
    }

    // Apenas force sync em desenvolvimento quando explicitamente solicitado
    const shouldForce = isDevelopment && force;
    
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync({ force: shouldForce });
    console.log(`Database synced ${shouldForce ? 'with force' : 'successfully'}.`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize;
