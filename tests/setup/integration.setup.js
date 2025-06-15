import './jest.setup.js';
import TestDatabase from './testDatabase.js';

let testDb;

beforeAll(async () => {
  console.log('🔧 Setting up integration test database...');
  testDb = new TestDatabase();
  await testDb.setup();
  global.testDb = testDb;
});

afterAll(async () => {
  console.log('🗑️ Cleaning up integration test database...');
  if (testDb) {
    await testDb.cleanup();
  }
});

beforeEach(async () => {
  if (testDb) {
    await testDb.reset();
  }
});
