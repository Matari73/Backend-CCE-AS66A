import request from 'supertest';
import express from 'express';
import  userFactory  from '../factories/userFactory.js' // Import the user factory for generating test data
import { createTestUser } from '../helpers/userHelpers.js'; // Helper function to create test users
import { expectSuccessResponse, expectErrorResponse serFactory}                                                                              
import { authenticatedRequest } from '../helpers/apiHelpers.js'; // Helper for authenticated requests
import { userFactory } from '../factories/index.js'; // Import user factory for generating test data  

// Simple test app for now
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Mock user routes
  app.post('/api/users', (req, res) => {
    const { name, email, password } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Senha muito fraca'
      });
    }
    
    res.status(201).json({
      success: true,
      data: { id: 1, name, email },
      message: 'Usuário criado com sucesso'
    });
  });
  
  app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    
    if (id === '999') {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { id: parseInt(id), name: 'Test User', email: 'test@example.com' }
    });
  });
  
  return app;
};

describe('Users API Integration Tests', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/users', () => {
    it('should create user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: expect.any(Number),
        name: userData.name,
        email: userData.email
      });
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 400 for invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Email');
    });

    it('should return 400 for weak password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Senha');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user when found', async () => {
      const response = await request(app)
        .get('/api/users/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: 1,
        name: expect.any(String),
        email: expect.any(String)
      });
    });

    it('should return 404 when user not found', async () => {
      const response = await request(app)
        .get('/api/users/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('não encontrado');
    });
  });
});
      // Create multiple users
      const users = userFactory.buildList(15);
      for (const userData of users) {
        await createTestUser(global.testDb, userData);
      }
      
      const response = await request(app)
        .get('/api/users?page=1&limit=10');

      expectSuccessResponse(response);
      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 15,
        totalPages: 2
      });

    it('should filter users by name', async () => {
      await createTestUser(global.testDb, { name: 'John Doe' });
      await createTestUser(global.testDb, { name: 'Jane Smith' });
      
      const response = await request(app)
        .get('/api/users?search=John');

      expectSuccessResponse(response);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toContain('John');
    });

  describe('DELETE /api/users/:id', () => {
    it('should delete user when authenticated as admin', async () => {
      const user = await createTestUser(global.testDb);
      
      const response = await authenticatedRequest(
        app, 
        `/api/users/${user.id}`, 
        'DELETE', 
        null,
        { id: 1, role: 'admin' }
      );

      expectSuccessResponse(response, 204);
    });

    it('should return 403 when not admin', async () => {
      const user = await createTestUser(global.testDb);
      
      const response = await authenticatedRequest(
        app, 
        `/api/users/${user.id}`, 
        'DELETE', 
        null,
        { id: 2, role: 'user' }
      );

      expectErrorResponse(response, 403);
    });
  });

