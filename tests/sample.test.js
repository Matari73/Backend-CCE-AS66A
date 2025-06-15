import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Criar app de teste simples
const app = express();

app.get('/health', (_req, res) => res.status(200).json({ 
  status: 'OK', 
  timestamp: new Date().toISOString(),
  version: '1.0.0'
}));

describe('Smoke Test', () => {
  it('GET /health deve retornar 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  it('deve ter mocks do Sequelize disponíveis', () => {
    expect(global.mockSequelize).toBeDefined();
    expect(global.mockTransaction).toBeDefined();
    expect(typeof global.mockSequelize.transaction).toBe('function');
  });

  it('deve ter todos os modelos mockados', () => {
    expect(global.mockModels).toBeDefined();
    expect(global.mockModels.User).toBeDefined();
    expect(global.mockModels.Championship).toBeDefined();
    expect(typeof global.mockModels.User.hasMany).toBe('function');
  });

  it('deve ter DataTypes com ENUM funcionando', () => {
    console.log('mockSequelize:', typeof global.mockSequelize);
    console.log('DataTypes:', typeof global.mockSequelize?.DataTypes);
    console.log('ENUM:', typeof global.mockSequelize?.DataTypes?.ENUM);
    
    expect(global.mockSequelize.DataTypes.ENUM).toBeDefined();
    expect(typeof global.mockSequelize.DataTypes.ENUM).toBe('function');
    
    const enumResult = global.mockSequelize.DataTypes.ENUM('upper', 'lower', 'final');
    console.log('enumResult:', enumResult);
    
    expect(enumResult).toBe('ENUM(upper,lower,final)');
    expect(enumResult).toContain('ENUM');
  });
});
