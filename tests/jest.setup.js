import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { jest } from '@jest/globals';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test environment variables before any imports
config({ path: join(__dirname, '../.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(10000);

// Mock completo do Sequelize
const mockTransaction = {
  commit: jest.fn().mockResolvedValue(),
  rollback: jest.fn().mockResolvedValue(),
  ISOLATION_LEVELS: {
    READ_UNCOMMITTED: 'READ_UNCOMMITTED',
    READ_COMMITTED: 'READ_COMMITTED',
    REPEATABLE_READ: 'REPEATABLE_READ',
    SERIALIZABLE: 'SERIALIZABLE'
  }
};

// Mock para modelos com métodos de associação
const createMockModel = (name) => ({
  // Métodos de query
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  findByPk: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue([1]),
  destroy: jest.fn().mockResolvedValue(1),
  sync: jest.fn().mockResolvedValue(),
  bulkCreate: jest.fn().mockResolvedValue([]),
  
  // Métodos de associação
  hasMany: jest.fn().mockReturnThis(),
  hasOne: jest.fn().mockReturnThis(),
  belongsTo: jest.fn().mockReturnThis(),
  belongsToMany: jest.fn().mockReturnThis(),
  
  // Propriedades do modelo
  name,
  tableName: name.toLowerCase(),
  associations: {},
  
  // Métodos de instância
  prototype: {
    save: jest.fn().mockResolvedValue(),
    destroy: jest.fn().mockResolvedValue(),
    update: jest.fn().mockResolvedValue(),
    reload: jest.fn().mockResolvedValue()
  }
});

const mockSequelize = {
  authenticate: jest.fn().mockResolvedValue(),
  sync: jest.fn().mockResolvedValue(),
  close: jest.fn().mockResolvedValue(),
  transaction: jest.fn().mockResolvedValue(mockTransaction),
  define: jest.fn().mockImplementation((name) => createMockModel(name)),
  DataTypes: {
    STRING: 'STRING',
    INTEGER: 'INTEGER',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE',
    TEXT: 'TEXT',
    UUID: 'UUID',
    UUIDV4: 'UUIDV4',
    DECIMAL: 'DECIMAL',
    FLOAT: 'FLOAT',
    DOUBLE: 'DOUBLE',
    BIGINT: 'BIGINT',
    JSON: 'JSON',
    JSONB: 'JSONB',
    ARRAY: jest.fn().mockReturnValue('ARRAY'),
    ENUM: jest.fn(),
    BLOB: 'BLOB',
    TIME: 'TIME',
    DATEONLY: 'DATEONLY',
    NOW: 'NOW'
  },
  Op: {
    eq: Symbol('eq'),
    ne: Symbol('ne'),
    gte: Symbol('gte'),
    gt: Symbol('gt'),
    lte: Symbol('lte'),
    lt: Symbol('lt'),
    like: Symbol('like'),
    in: Symbol('in'),
    notIn: Symbol('notIn')
  }
};

// Mock dos modelos baseados no arquivo de associações
const mockModels = {
  User: createMockModel('User'),
  Championship: createMockModel('Championship'),
  Team: createMockModel('Team'),
  Match: createMockModel('Match'),
  Participant: createMockModel('Participant'),
  Subscription: createMockModel('Subscription'),
  Agent: createMockModel('Agent'),
  ParticipantStatistics: createMockModel('ParticipantStatistics'),
  ChampionshipStatistics: createMockModel('ChampionshipStatistics')
};

jest.unstable_mockModule('sequelize', () => ({
  Sequelize: jest.fn().mockImplementation(() => mockSequelize),
  DataTypes: mockSequelize.DataTypes,
  Op: mockSequelize.Op
}));

// Mock dos modelos individuais (apenas os que existem)
jest.unstable_mockModule('../src/models/user.js', () => ({
  default: mockModels.User
}));

jest.unstable_mockModule('../src/models/championship.js', () => ({
  default: mockModels.Championship
}));

jest.unstable_mockModule('../src/models/team.js', () => ({
  default: mockModels.Team
}));

jest.unstable_mockModule('../src/models/match.js', () => ({
  default: mockModels.Match
}));

jest.unstable_mockModule('../src/models/participant.js', () => ({
  default: mockModels.Participant
}));

jest.unstable_mockModule('../src/models/subscription.js', () => ({
  default: mockModels.Subscription
}));

jest.unstable_mockModule('../src/models/agent.js', () => ({
  default: mockModels.Agent
}));

jest.unstable_mockModule('../src/models/participantStatistics.js', () => ({
  default: mockModels.ParticipantStatistics
}));

jest.unstable_mockModule('../src/models/championshipStatistics.js', () => ({
  default: mockModels.ChampionshipStatistics
}));

// Mock do arquivo de configuração do banco
jest.unstable_mockModule('../src/config/database.js', () => ({
  default: mockSequelize,
  syncDatabase: jest.fn().mockResolvedValue()
}));

// Setup e cleanup globais
beforeAll(async () => {
  console.log('🧪 Setting up test environment...');
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  if (mockSequelize.close) {
    await mockSequelize.close();
  }
});

beforeEach(() => {
  jest.clearAllMocks();
  // Re-setup ENUM mock after clearing
  mockSequelize.DataTypes.ENUM.mockImplementation((...values) => {
    return `ENUM(${values.join(',')})`;
  });
});

afterEach(() => {
  jest.resetAllMocks();
  // Re-setup ENUM mock after resetting
  mockSequelize.DataTypes.ENUM.mockImplementation((...values) => {
    return `ENUM(${values.join(',')})`;
  });
});

// Disponibilizar mocks globalmente para os testes
global.mockSequelize = mockSequelize;
global.mockTransaction = mockTransaction;
global.mockModels = mockModels;

// Ensure DataTypes is properly exposed
global.mockSequelize.DataTypes = mockSequelize.DataTypes;
