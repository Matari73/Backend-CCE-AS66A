import { Sequelize } from 'sequelize';

export const createTestDatabase = () => {
  return new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  });
};

export const setupTestData = async (sequelize) => {
  // Setup test data here
};

export const cleanupTestData = async (sequelize) => {
  // Cleanup test data here
};
