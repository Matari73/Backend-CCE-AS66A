import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Teste básico para verificar se a configuração está funcionando
const app = express();

app.get('/health', (_req, res) => res.status(200).json({ 
  status: 'OK', 
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  environment: process.env.NODE_ENV
}));

describe('Smoke Tests', () => {
  it('should have test environment configured', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should respond to health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.environment).toBe('test');
  });

  it('should have mocks available for unit tests', () => {
    expect(global.mockSequelize).toBeDefined();
    expect(global.mockModels).toBeDefined();
    expect(typeof global.mockSequelize.DataTypes.ENUM).toBe('function');
  });
});
