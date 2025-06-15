import { jest } from '@jest/globals';
import './jest.setup.js';

// Mock completo do Sequelize para testes unitários
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

// Factory para criar mocks de modelo mais específicos
const createMockModel = (name, customMethods = {}) => ({
  // Métodos de query básicos
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  findByPk: jest.fn().mockResolvedValue(null),
  findAndCountAll: jest.fn().mockResolvedValue({ rows: [], count: 0 }),
  create: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue([1]),
  destroy: jest.fn().mockResolvedValue(1),
  sync: jest.fn().mockResolvedValue(),
  bulkCreate: jest.fn().mockResolvedValue([]),
  upsert: jest.fn().mockResolvedValue([{}, true]),
  
  // Métodos de associação
  hasMany: jest.fn().mockReturnThis(),
  hasOne: jest.fn().mockReturnThis(),
  belongsTo: jest.fn().mockReturnThis(),
  belongsToMany: jest.fn().mockReturnThis(),
  
  // Propriedades do modelo
  name,
  tableName: name.toLowerCase(),
  associations: {},
  rawAttributes: {},
  
  // Métodos personalizados
  ...customMethods,
  
  // Métodos de instância
  prototype: {
    save: jest.fn().mockResolvedValue(),
    destroy: jest.fn().mockResolvedValue(),
    update: jest.fn().mockResolvedValue(),
    reload: jest.fn().mockResolvedValue(),
    toJSON: jest.fn().mockReturnValue({})
  }
});

const mockSequelize = {
  authenticate: jest.fn().mockResolvedValue(),
  sync: jest.fn().mockResolvedValue(),
  close: jest.fn().mockResolvedValue(),
  transaction: jest.fn().mockResolvedValue(mockTransaction),
  define: jest.fn().mockImplementation((name) => createMockModel(name)),
  query: jest.fn().mockResolvedValue([]),
  literal: jest.fn().mockImplementation((sql) => ({ val: sql })),
  col: jest.fn().mockImplementation((col) => ({ col })),
  fn: jest.fn().mockImplementation((fn, ...args) => ({ fn, args })),
  where: jest.fn().mockImplementation((attr, comparator, logic) => ({ attr, comparator, logic })),
  
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
    VIRTUAL: 'VIRTUAL',
    ARRAY: jest.fn().mockReturnValue('ARRAY'),
    ENUM: jest.fn().mockImplementation((...values) => `ENUM(${values.join(',')})`),
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
    iLike: Symbol('iLike'),
    in: Symbol('in'),
    notIn: Symbol('notIn'),
    between: Symbol('between'),
    notBetween: Symbol('notBetween'),
    and: Symbol('and'),
    or: Symbol('or'),
    not: Symbol('not'),
    is: Symbol('is'),
    isNot: Symbol('isNot')
  }
};

// Mock dos modelos específicos - only the ones that exist
const mockModels = {
  User: createMockModel('User'),
  Championship: createMockModel('Championship'),
  Team: createMockModel('Team'),
  Match: createMockModel('Match'),
  Participant: createMockModel('Participant'),
  Subscription: createMockModel('Subscription'),
  Agent: createMockModel('Agent')
};

// Mocks dos módulos
jest.unstable_mockModule('sequelize', () => ({
  Sequelize: jest.fn().mockImplementation(() => mockSequelize),
  DataTypes: mockSequelize.DataTypes,
  Op: mockSequelize.Op
}));

// Mock individual dos modelos - only mock existing models
const existingModels = ['User', 'Championship', 'Team', 'Match', 'Participant', 'Subscription', 'Agent'];

existingModels.forEach(modelName => {
  const modelPath = `../../src/models/${modelName.toLowerCase()}.js`;
  jest.unstable_mockModule(modelPath, () => ({
    default: mockModels[modelName]
  }));
});

// Mock do arquivo de configuração do banco
jest.unstable_mockModule('../../src/config/database.js', () => ({
  default: mockSequelize,
  syncDatabase: jest.fn().mockResolvedValue()
}));

// Mock do arquivo de conexão do banco
jest.unstable_mockModule('../../src/db/db.js', () => ({
  sequelize: mockSequelize,
  connectInDatabase: jest.fn().mockResolvedValue()
}));

// Disponibilizar mocks globalmente
global.mockSequelize = mockSequelize;
global.mockTransaction = mockTransaction;
global.mockModels = mockModels;
global.createMockModel = createMockModel;
