import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { jest } from '@jest/globals';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test environment variables before any imports
config({ path: join(__dirname, '../../.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(15000);

// Setup e cleanup globais
beforeAll(async () => {
  console.log('🧪 Setting up test environment...');
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
});
