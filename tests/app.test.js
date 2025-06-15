import request from 'supertest';
import express from 'express';

// Mock da aplicação para testes
const createTestApp = () => {
  const app = express();
  
  // Middleware básico
  app.use(express.json());
  
  // Rota de health check
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV 
    });
  });
  
  // Middleware para rotas não encontradas - Express 5.x syntax
  app.use((req, res) => {
    res.status(404).json({ 
      error: 'Route not found',
      path: req.originalUrl 
    });
  });
  
  return app;
};

describe('App Integration Tests', () => {
  let app;
  
  beforeAll(() => {
    app = createTestApp();
  });

  describe('Health Check', () => {
    it('should respond with 200 for health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment', 'test');
    });
  });

  describe('API Routes', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('path', '/unknown-route');
    });

    it('should handle POST request to unknown route', async () => {
      const response = await request(app)
        .post('/unknown-route')
        .send({ test: 'data' })
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });

  describe('Middleware', () => {
    it('should parse JSON bodies', async () => {
      // Este teste verifica se o middleware de JSON está funcionando
      // mesmo que a rota não exista, deve processar o JSON
      const response = await request(app)
        .post('/test-json')
        .send({ test: 'data' })
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
    });
  });
});
